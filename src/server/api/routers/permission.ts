import { z } from "zod";
import { createTRPCRouter, permissionProtectedProcedure } from "../trpc";
import { Permissions } from "@/utils/permissions";
import { TRPCError } from "@trpc/server";

const permissionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  group: z.string().optional(),
});

export const permissionRouter = createTRPCRouter({
  getAll: permissionProtectedProcedure(Permissions.PERMISSION_MANAGE)
    .query(async ({ ctx }) => {
        return ctx.prisma.permission.findMany();
    }),

  getById: permissionProtectedProcedure(Permissions.PERMISSION_MANAGE)
    .input(z.string())
    .query(async ({ ctx, input }) => {
        const permission = await ctx.prisma.permission.findUnique({
        where: { id: input },
      });

      if (!permission) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return permission;
    }),

  create: permissionProtectedProcedure(Permissions.PERMISSION_MANAGE)
    .input(permissionSchema)
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.permission.create({
        data: input,
      });
    }),

  update: permissionProtectedProcedure(Permissions.PERMISSION_MANAGE)
    .input(z.object({
      id: z.string(),
      data: permissionSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
        return ctx.prisma.permission.update({
        where: { id },
        data,
      });
    }),

  delete: permissionProtectedProcedure(Permissions.PERMISSION_MANAGE)
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.permission.delete({
        where: { id: input },
      });
    }),
});