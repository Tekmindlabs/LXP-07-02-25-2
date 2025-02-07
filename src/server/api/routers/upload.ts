import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { localStorage } from "@/lib/storage/local-storage";
import { redisCache } from "@/lib/cache/redis-client";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import crypto from "crypto";

// Event emitter for real-time updates
const uploadEvents = new EventEmitter();

// Allowed file types and their mime types
const ALLOWED_FILE_TYPES = {
	'image/jpeg': ['jpg', 'jpeg'],
	'image/png': ['png'],
	'image/gif': ['gif'],
	'application/pdf': ['pdf'],
	'application/msword': ['doc'],
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadRouter = createTRPCRouter({
	getUploadConfig: protectedProcedure
		.input(z.object({
			fileName: z.string(),
			fileType: z.string(),
			fileSize: z.number(),
		}))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Not authenticated',
				});
			}

			// Validate file type
			const fileExt = input.fileName.split('.').pop()?.toLowerCase();
			const isValidType = Object.entries(ALLOWED_FILE_TYPES).some(([mime, exts]) => 
				mime === input.fileType && exts.includes(fileExt || '')
			);

			if (!isValidType) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid file type',
				});
			}

			// Validate file size
			if (input.fileSize > MAX_FILE_SIZE) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'File too large',
				});
			}

			// Generate upload token
			const uploadToken = crypto.randomBytes(32).toString('hex');
			
			// Cache upload details
			await redisCache.set(`upload:${uploadToken}`, {
				userId: ctx.session.user.id,
				fileName: input.fileName,
				fileType: input.fileType,
				fileSize: input.fileSize,
				status: 'pending',
			}, 3600); // 1 hour expiry

			return { uploadToken };
		}),

	saveFile: protectedProcedure
		.input(z.object({
			uploadToken: z.string(),
			file: z.any(), // This will be a Buffer
		}))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Not authenticated',
				});
			}

			// Get upload details from cache
			const uploadDetails = await redisCache.get<any>(`upload:${input.uploadToken}`);
			
			if (!uploadDetails) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Upload token not found or expired',
				});
			}

			// Validate ownership
			if (uploadDetails.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Not authorized to complete this upload',
				});
			}

			try {
				// Save file to local storage
				const filePath = await localStorage.saveFile(
					input.file,
					uploadDetails.fileName,
					ctx.session.user.id // Use user ID as subdirectory
				);

				// Update cache with completed status
				await redisCache.set(`upload:${input.uploadToken}`, {
					...uploadDetails,
					status: 'completed',
					filePath,
				}, 3600);

				// Emit real-time update
				uploadEvents.emit('uploadCompleted', {
					userId: ctx.session.user.id,
					filePath,
				});

				return { filePath };
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to save file',
				});
			}
		}),

	// Real-time upload status subscription
	onUploadStatusChange: protectedProcedure
		.subscription(({ ctx }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Not authenticated',
				});
			}

			return observable<{ status: string; filePath?: string }>((emit) => {
				const onUploadCompleted = (data: { userId: string; filePath: string }) => {
					if (data.userId === ctx.session?.user?.id) {
						emit.next({ status: 'completed', filePath: data.filePath });
					}
				};

				uploadEvents.on('uploadCompleted', onUploadCompleted);

				return () => {
					uploadEvents.off('uploadCompleted', onUploadCompleted);
				};
			});
		}),
});