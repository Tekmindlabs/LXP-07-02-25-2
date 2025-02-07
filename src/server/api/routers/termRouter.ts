import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TermManagementService } from "@/server/services/TermManagementService";
import { randomUUID } from "crypto";

const assessmentPeriodInputSchema = z.object({
	name: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	weight: z.number()
});

const termInputSchema = z.object({
	name: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	type: z.enum(['SEMESTER', 'TERM', 'QUARTER']),
	assessmentPeriods: z.array(assessmentPeriodInputSchema)
});

export const termRouter = createTRPCRouter({
	createProgramTerms: protectedProcedure
		.input(z.object({
			programId: z.string(),
			academicYearId: z.string(),
			terms: z.array(termInputSchema)
		}))
		.mutation(async ({ ctx, input }) => {
			const termService = new TermManagementService(ctx.prisma);
			
			// Add IDs to the terms and assessment periods
			const termsWithIds = input.terms.map(term => ({
				...term,
				id: randomUUID(),
				assessmentPeriods: term.assessmentPeriods.map(ap => ({
					...ap,
					id: randomUUID()
				}))
			}));

			return termService.createProgramTerms(
				input.programId,
				input.academicYearId,
				termsWithIds
			);
		}),

	getClassGroupTerms: protectedProcedure
		.input(z.object({ classGroupId: z.string() }))
		.query(async ({ ctx, input }) => {
			const termService = new TermManagementService(ctx.prisma);
			return termService.getClassGroupTerms(input.classGroupId);
		}),

	customizeClassGroupTerm: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			termId: z.string(),
			customSettings: z.object({
				startDate: z.date().optional(),
				endDate: z.date().optional(),
				assessmentPeriods: z.array(assessmentPeriodInputSchema)
					.transform(aps => aps.map(ap => ({
						...ap,
						id: randomUUID()
					})))
					.optional()
			})
		}))
		.mutation(async ({ ctx, input }) => {
			const termService = new TermManagementService(ctx.prisma);
			return termService.customizeClassGroupTerm(
				input.classGroupId,
				input.termId,
				input.customSettings
			);
		})
});