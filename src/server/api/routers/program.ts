import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const programRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where = {
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' as Prisma.QueryMode } },
              { description: { contains: input.search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }),
          ...(input.status && { status: input.status }),
        };

        const programs = await ctx.prisma.program.findMany({
          where,
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
            classGroups: {
              include: {
                classes: {
                  include: {
                    students: true,
                    teachers: true,
                  },
                },
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        const totalCount = await ctx.prisma.program.count({ where });

        return {
          programs,
          pagination: {
            currentPage: input.page,
            pageSize: input.pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / input.pageSize),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch programs',
          cause: error,
        });
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const program = await ctx.prisma.program.findUnique({
          where: { id: input },
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
            classGroups: {
              include: {
                classes: {
                  include: {
                    students: true,
                  },
                },
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program not found",
          });
        }

        return program;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch program",
          cause: error,
        });
      }
    }),

  getByProgramId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const program = await ctx.prisma.program.findUnique({
          where: { id: input },
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
            classGroups: {
              include: {
                classes: {
                  include: {
                    students: true,
                  },
                },
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program not found",
          });
        }

        return program;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch program",
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        calendarId: z.string(),
        coordinatorId: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate calendar exists
        const calendar = await ctx.prisma.calendar.findUnique({
          where: { id: input.calendarId },
        });

        if (!calendar) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Calendar not found",
          });
        }

        // Validate coordinator if provided
        if (input.coordinatorId) {
            const coordinator = await ctx.prisma.coordinatorProfile.findUnique({
            where: { id: input.coordinatorId },
          });

          if (!coordinator) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Coordinator not found",
            });
          }
        }

        const program = await ctx.prisma.program.create({
          data: {
            name: input.name,
            description: input.description,
            calendar: {
              connect: { id: input.calendarId }
            },
            coordinator: input.coordinatorId
              ? {
                  connect: { id: input.coordinatorId },
                }
              : undefined,
            status: input.status,
          },
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
          },
        });

        return program;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create program",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        calendarId: z.string().optional(),
        coordinatorId: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if program exists
        const existingProgram = await ctx.prisma.Program.findUnique({
          where: { id: input.id },
        });

        if (!existingProgram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program not found",
          });
        }

        // Validate calendar if provided
        if (input.calendarId) {
          const calendar = await ctx.prisma.calendar.findUnique({
            where: { id: input.calendarId },
          });

          if (!calendar) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Calendar not found",
            });
          }
        }

        // Validate coordinator if provided
        if (input.coordinatorId) {
          const coordinator = await ctx.prisma.coordinatorProfile.findUnique({
            where: { id: input.coordinatorId },
          });

          if (!coordinator) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Coordinator not found",
            });
          }
        }

        const { id, calendarId, coordinatorId, ...data } = input;
        
        const updatedProgram = await ctx.prisma.Program.update({
          where: { id },
          data: {
            ...data,
            calendar: calendarId ? { connect: { id: calendarId } } : undefined,
            coordinator: coordinatorId ? { connect: { id: coordinatorId } } : undefined
          },
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
          },
        });

        return updatedProgram;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update program",
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const program = await ctx.prisma.Program.delete({
          where: { id: input },
        });

        return program;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete program",
          cause: error,
        });
      }
    }),

  getAvailableCoordinators: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const coordinators = await ctx.prisma.CoordinatorProfile.findMany({
          include: {
            user: true,
          },
        });

        return coordinators;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch available coordinators',
          cause: error,
        });
      }
    }),


  associateCalendar: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        calendarId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const program = await ctx.prisma.Program.update({
          where: { id: input.programId },
          data: {
            calendar: {
              connect: { id: input.calendarId },
            },
          },
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
            classGroups: {
              include: {
                classes: {
                  include: {
                    students: true,
                    teachers: true,
                  },
                },
              },
            },
          },
        });

        return program;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to associate calendar',
          cause: error,
        });
      }
    }),

  searchPrograms: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const programs = await ctx.prisma.Program.findMany({
          where: {
            OR: [
              { name: { contains: input, mode: 'insensitive' as Prisma.QueryMode } },
              { description: { contains: input, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          },
          take: 10,
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
            calendar: true,
          },
        });

        return programs;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search programs',
          cause: error,
        });
      }
    }),
});
