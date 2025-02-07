import { z } from "zod";
import { createTRPCRouter, permissionProtectedProcedure } from "../trpc";
import { Permissions } from "@/utils/permissions";
import { TRPCError } from "@trpc/server";

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
});

export const roleRouter = createTRPCRouter({
  getAll: permissionProtectedProcedure(Permissions.ROLE_READ)
    .query(async ({ ctx }) => {
        return ctx.prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  getById: permissionProtectedProcedure(Permissions.ROLE_READ)
    .input(z.string())
    .query(async ({ ctx, input }) => {
        const role = await ctx.prisma.role.findUnique({
        where: { id: input },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return role;
    }),

  create: permissionProtectedProcedure(Permissions.ROLE_CREATE)
    .input(roleSchema)
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.role.create({
        data: {
          name: input.name,
          description: input.description,
          permissions: {
            create: input.permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })),
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  update: permissionProtectedProcedure(Permissions.ROLE_UPDATE)
    .input(z.object({
      id: z.string(),
      data: roleSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
        return ctx.prisma.role.update({
        where: { id },
        data: {
          ...data,
          permissions: data.permissionIds ? {
            deleteMany: {},
            create: data.permissionIds.map((permissionId) => ({
              permission: { connect: { id: permissionId } },
            })),
          } : undefined,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }),

  delete: permissionProtectedProcedure(Permissions.ROLE_DELETE)
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.role.delete({
        where: { id: input },
      });
    }),
});