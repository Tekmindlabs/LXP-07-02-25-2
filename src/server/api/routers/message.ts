import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { AttachmentType, ConversationType, ParticipantRole, Prisma, UserType } from "@prisma/client";

// Add helper function for role-based access
const canMessageUser = (senderRole: UserType, recipientRole: UserType) => {
	const roleHierarchy = {
		ADMIN: ["ADMIN", "COORDINATOR", "TEACHER", "STUDENT", "PARENT"],
		COORDINATOR: ["COORDINATOR", "TEACHER", "STUDENT", "PARENT"],
		TEACHER: ["TEACHER", "STUDENT", "PARENT"],
		STUDENT: ["TEACHER"],
		PARENT: ["TEACHER"],
	};
	return roleHierarchy[senderRole]?.includes(recipientRole) || false;
};

// Define the include types
const conversationInclude = {
	participants: {
		include: {
			user: true,
		},
	},
	messages: {
		include: {
			sender: true,
			attachments: true,
		},
	},
} satisfies Prisma.ConversationInclude;

const messageInclude = {
	sender: true,
	attachments: true,
	reactions: {
		include: {
			user: true,
		},
	},
} satisfies Prisma.MessageInclude;

export const messageRouter = createTRPCRouter({
	createConversation: protectedProcedure
		.input(
			z.object({
				title: z.string().optional(),
				type: z.enum(["DIRECT", "GROUP", "CHANNEL"]),
				participantIds: z.array(z.string()),
				initialMessage: z.string(),
				attachments: z.array(
					z.object({
						type: z.enum(["IMAGE", "DOCUMENT", "VIDEO", "AUDIO"]),
						url: z.string(),
					})
				).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Get sender's role
			const sender = await ctx.prisma.user.findUnique({
				where: { id: ctx.session!.user.id },
				include: { userRoles: { include: { role: true } } },
			});

			// Get recipients' roles
			const recipients = await ctx.prisma.user.findMany({
				where: { id: { in: input.participantIds } },
				include: { userRoles: { include: { role: true } } },
			});

			// Check if sender can message all recipients
			const senderRole = sender?.userType;
			for (const recipient of recipients) {
				if (!canMessageUser(senderRole!, recipient.userType!)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: `You don't have permission to message ${recipient.name}`,
					});
				}
			}

			const conversation = await ctx.prisma.conversation.create({
				data: {
					title: input.title,
					type: input.type,
					participants: {
						create: [
							{
								userId: ctx.session!.user.id,
								role: "OWNER" as ParticipantRole,
							},
							...input.participantIds.map((id) => ({
								userId: id,
								role: "MEMBER" as ParticipantRole,
							})),
						],
					},
					messages: {
						create: {
							content: input.initialMessage,
							senderId: ctx.session!.user.id,
							attachments: input.attachments
								? {
										create: input.attachments,
									}
								: undefined,
							recipients: {
								create: input.participantIds.map((id) => ({
									recipientId: id,
								})),
							},
						},
					},
				},
				include: conversationInclude,
			});

			return conversation;
		}),

	sendMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				content: z.string(),
				attachments: z.array(
					z.object({
						type: z.enum(["IMAGE", "DOCUMENT", "VIDEO", "AUDIO"]),
						url: z.string(),
					})
				).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Check if user is participant
			const conversation = await ctx.prisma.conversation.findUnique({
				where: { id: input.conversationId },
				include: { participants: true },
			});

			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}

			const participant = conversation.participants.find(
				(p) => p.userId === ctx.session!.user.id && !p.leftAt
			);

			if (!participant) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a participant in this conversation",
				});
			}

			// Create message with recipients
			const message = await ctx.prisma.message.create({
				data: {
					content: input.content,
					senderId: ctx.session!.user.id,
					conversationId: input.conversationId,
					attachments: input.attachments
						? {
								create: input.attachments,
							}
						: undefined,
					recipients: {
						create: conversation.participants
							.filter((p) => p.userId !== ctx.session!.user.id && !p.leftAt)
							.map((p) => ({
								recipientId: p.userId,
							})),
					},
				},
				include: messageInclude,
			});

			return message;
		}),

	getConversations: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.conversation.findMany({
			where: {
				participants: {
					some: {
						userId: ctx.session!.user.id,
						leftAt: null,
					},
				},
			},
			include: {
				participants: {
					include: {
						user: true,
					},
				},
				messages: {
					take: 1,
					orderBy: {
						createdAt: "desc",
					},
					include: {
						sender: true,
						recipients: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	}),

	getConversation: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const conversation = await ctx.prisma.conversation.findUnique({
				where: { id: input },
				include: conversationInclude,

			});

			if (!conversation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}

			// Check if user is participant
			const isParticipant = conversation.participants.some(
				(p) => p.userId === ctx.session!.user.id && !p.leftAt
			);

			if (!isParticipant) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a participant in this conversation",
				});
			}

			return conversation;
		}),

	markAsRead: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.messageRecipient.updateMany({
				where: {
					message: {
						conversationId: input,
					},
					recipientId: ctx.session!.user.id,
					read: false,
				},
				data: {
					read: true,
					readAt: new Date(),
				},
			});
		}),

	searchMessages: protectedProcedure
		.input(
			z.object({
				query: z.string(),
				conversationId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			return ctx.prisma.message.findMany({
				where: {
					conversation: {
						participants: {
							some: {
								userId: ctx.session!.user.id,
								leftAt: null,
							},
						},
					},
					conversationId: input.conversationId,
					content: {
						contains: input.query,
						mode: "insensitive",
					},
				},
				include: {
					sender: true,
					attachments: true,
					conversation: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		}),

	addReaction: protectedProcedure
		.input(z.object({
			messageId: z.string(),
			type: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			// Check if user is participant in the conversation
			const message = await ctx.prisma.message.findUnique({
				where: { id: input.messageId },
				include: { conversation: { include: { participants: true } } },
			});

			if (!message) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Message not found",
				});
			}

			const isParticipant = message.conversation.participants.some(
				(p) => p.userId === ctx.session!.user.id && !p.leftAt
			);

			if (!isParticipant) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a participant in this conversation",
				});
			}

			// Upsert reaction (add if not exists, remove if exists)
			const existingReaction = await ctx.prisma.messageReaction.findUnique({
				where: {
					messageId_userId_type: {
						messageId: input.messageId,
						userId: ctx.session!.user.id,
						type: input.type,
					},
				},
			});

			if (existingReaction) {
				await ctx.prisma.messageReaction.delete({
					where: { id: existingReaction.id },
				});
				return { action: "removed" };
			}

			await ctx.prisma.messageReaction.create({
				data: {
					messageId: input.messageId,
					userId: ctx.session!.user.id,
					type: input.type,
				},
			});

			return { action: "added" };
		}),

	getReactions: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.messageReaction.findMany({
				where: { messageId: input },
				include: { user: true },
			});
		}),
});
