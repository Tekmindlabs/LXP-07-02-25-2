import { z } from "zod";
import { createTRPCRouter, permissionProtectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Permissions } from "@/utils/permissions";
import { 
	type HistoricalStudentRecord,
	type VersionedRecord,
	type PerformanceMetrics,
	historicalStudentRecordSchema 
} from "../../../types/historical-data";

export const historicalDataRouter = createTRPCRouter({
	getStudentHistory: permissionProtectedProcedure(Permissions.GRADEBOOK_VIEW)
		.input(z.object({
			studentId: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const historicalRecords = await ctx.prisma.historicalStudentRecord.findMany({
				where: {
					studentId: input.studentId,
					timestamp: { gte: input.startDate, lte: input.endDate }
				},
				include: { grades: true, attendance: true },
				orderBy: { timestamp: 'desc' }
			});
			return historicalRecords;
		}),

	getVersionHistory: permissionProtectedProcedure(Permissions.GRADEBOOK_VIEW)
		.input(z.object({
			entityId: z.string(),
			entityType: z.enum(['STUDENT', 'TEACHER', 'CLASS'])
		}))
		.query(async ({ ctx, input }) => {
			const versions = await ctx.prisma.versionedRecord.findMany({
				where: { entityId: input.entityId, entityType: input.entityType },
				orderBy: { timestamp: 'desc' },
				include: { user: { select: { name: true, email: true } } }
			});
			return versions;
		}),

	getPerformanceMetrics: permissionProtectedProcedure(Permissions.GRADEBOOK_VIEW)
		.input(z.object({
			studentId: z.string(),
			periodStart: z.date(),
			periodEnd: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const grades = await ctx.prisma.activitySubmission.findMany({
				where: {
					studentId: input.studentId,
					submittedAt: { gte: input.periodStart, lte: input.periodEnd },
					status: 'GRADED'
				}
			});

			const attendance = await ctx.prisma.attendance.findMany({
				where: {
					studentId: input.studentId,
					date: { gte: input.periodStart, lte: input.periodEnd }
				}
			});

			const academicPerformance = grades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / grades.length || 0;
			const attendanceRate = (attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100 || 0;
			const participationScore = ((grades.filter(g => g.status === 'SUBMITTED').length / grades.length + 
									  attendance.filter(a => a.status === 'PRESENT').length / attendance.length) / 2) * 100;

			return {
				periodStart: input.periodStart,
				periodEnd: input.periodEnd,
				metrics: { academicPerformance, attendanceRate, participationScore }
			};
		}),

	applyRetentionPolicy: permissionProtectedProcedure(Permissions.GRADEBOOK_MANAGE)
		.input(z.object({
			entityType: z.string(),
			olderThan: z.date()
		}))
		.mutation(async ({ ctx, input }) => {
			const policy = await ctx.prisma.dataRetentionPolicy.findFirst({
				where: { entityType: input.entityType }
			});

			if (!policy) throw new TRPCError({ code: 'NOT_FOUND', message: `No retention policy for ${input.entityType}` });

			if (policy.archivalStrategy === 'ARCHIVE') {
				await ctx.prisma.archivedRecord.createMany({ data: {} });
			}

			return ctx.prisma[input.entityType].deleteMany({
				where: { timestamp: { lt: input.olderThan } }
			});
		}),

	createHistoricalRecord: permissionProtectedProcedure(Permissions.GRADEBOOK_MANAGE)
		.input(historicalStudentRecordSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.historicalStudentRecord.create({ data: input });
		})
});