import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { EventType, Priority, Status, Visibility } from "@prisma/client";

const eventSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	eventType: z.nativeEnum(EventType),
	startDate: z.date(),
	endDate: z.date(),
	calendarId: z.string(),
	priority: z.nativeEnum(Priority).optional(),
	visibility: z.nativeEnum(Visibility).optional(),
	recurrence: z.any().optional(),
	metadata: z.any().optional(),
	status: z.nativeEnum(Status).optional(),
});

export const eventRouter = createTRPCRouter({
	getEventsByCalendar: protectedProcedure
		.input(z.object({
			calendarId: z.string(),
			startDate: z.date().optional(),
			endDate: z.date().optional(),
			eventType: z.nativeEnum(EventType).optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { calendarId, startDate, endDate, eventType } = input;
			return ctx.prisma.event.findMany({
				where: {
					calendarId,
					...(eventType && { eventType }),
					...(startDate && { startDate: { gte: startDate } }),
					...(endDate && { endDate: { lte: endDate } }),
					status: Status.ACTIVE,
				},
				orderBy: {
					startDate: 'asc',
				},
			});
		}),

	createEvent: protectedProcedure
		.input(eventSchema)
		.mutation(async ({ ctx, input }) => {
			const { recurrence, ...eventData } = input;

			// If no recurrence pattern, create a single event
			if (!recurrence) {
				return ctx.prisma.event.upsert({
					where: {
						title_calendarId_eventType: {
							title: eventData.title,
							calendarId: eventData.calendarId,
							eventType: eventData.eventType
						}
					},
					update: {
						...eventData,
						status: Status.ACTIVE,
					},
					create: {
						...eventData,
						status: Status.ACTIVE,
					},
				});
			}

			// Handle recurring events
			const events = [];
			const { frequency, interval, endAfterOccurrences = 1 } = recurrence;
			let currentDate = new Date(eventData.startDate);
			const duration = eventData.endDate.getTime() - eventData.startDate.getTime();

			for (let i = 0; i < endAfterOccurrences; i++) {
				const event = {
					...eventData,
					startDate: new Date(currentDate),
					endDate: new Date(currentDate.getTime() + duration),
					recurrence,
				};

				events.push(
					ctx.prisma.event.upsert({
						where: {
							title_calendarId_eventType: {
								title: event.title,
								calendarId: event.calendarId,
								eventType: event.eventType
							}
						},
						update: event,
						create: event,
					})
				);

				// Calculate next occurrence
				switch (frequency) {
					case 'daily':
						currentDate.setDate(currentDate.getDate() + interval);
						break;
					case 'weekly':
						currentDate.setDate(currentDate.getDate() + (interval * 7));
						break;
					case 'monthly':
						currentDate.setMonth(currentDate.getMonth() + interval);
						break;
				}
			}

			return Promise.all(events);
		}),

	updateEvent: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: eventSchema.partial(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			return ctx.prisma.event.update({
				where: { id },
				data,
			});
		}),

	deleteEvent: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.event.delete({
				where: { id: input },
			});
		}),
});