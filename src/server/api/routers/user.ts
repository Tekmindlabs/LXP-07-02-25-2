import { z } from "zod";
import { createTRPCRouter, permissionProtectedProcedure } from "../trpc";
import { Permissions } from "@/utils/permissions";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8).optional(),
  roleIds: z.array(z.string()),
});

export const userRouter = createTRPCRouter({
  getAll: permissionProtectedProcedure(Permissions.USER_READ)
    .query(async ({ ctx }) => {
        return ctx.prisma.user.findMany({
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }),

  getById: permissionProtectedProcedure(Permissions.USER_READ)
    .input(z.string())
    .query(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({
        where: { id: input },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user;
    }),

  create: permissionProtectedProcedure(Permissions.USER_CREATE)
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = input.password 
        ? await bcrypt.hash(input.password, 12)
        : undefined;

        return ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          userRoles: {
            create: input.roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          },
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }),

  update: permissionProtectedProcedure(Permissions.USER_UPDATE)
    .input(z.object({
      id: z.string(),
      data: userSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const hashedPassword = data.password 
        ? await bcrypt.hash(data.password, 12)
        : undefined;

        return ctx.prisma.user.update({
        where: { id },
        data: {
          ...data,
          password: hashedPassword,
          userRoles: data.roleIds ? {
            deleteMany: {},
            create: data.roleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          } : undefined,
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }),

  delete: permissionProtectedProcedure(Permissions.USER_DELETE)
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.user.delete({
        where: { id: input },
      });
    }),

  searchUsers: permissionProtectedProcedure(Permissions.USER_READ)
    .input(z.object({
      search: z.string(),
      excludeIds: z.array(z.string()).optional(),
      roles: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
        return ctx.prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
              ],
            },
            input.excludeIds ? { id: { notIn: input.excludeIds } } : {},
            input.roles ? {
              userRoles: {
                some: {
                  role: {
                    name: { in: input.roles },
                  },
                },
              },
            } : {},
          ],
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    }),
});