import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { Permission, RolePermissions } from "@/utils/permissions";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import type { Session } from "next-auth";

export type Context = {
  prisma: typeof prisma;
  session: Session | null;
};

import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerAuthSession();
  console.log('Session received:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    userEmail: session?.user?.email 
  });

  if (session?.user) {
    try {
      // First check if user exists and get their roles
      const userWithRoles = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { 
            id: session.user.id,
            deleted: null,
          },
          select: { id: true }
        });

        if (!user) {
          console.error(`User not found: ${session.user.id}`);
          return null;
        }

        // Get roles in a separate query
        const roles = await tx.userRole.findMany({
          where: {
            userId: user.id,
            role: {
              deleted: null
            }
          },
          include: {
            role: {
              select: {
                name: true
              }
            }
          }
        });

        return {
          ...user,
          userRoles: roles
        };
      });

      console.log('User lookup result:', { 
        found: !!userWithRoles,
        id: session.user.id,
        rolesCount: userWithRoles?.userRoles?.length ?? 0,
        roles: userWithRoles?.userRoles?.map(ur => ur.role.name) ?? []
      });
      
      // If no user found, continue with empty roles
      if (!userWithRoles) {
        console.warn(`User ${session.user.id} not found or has no active roles`);
        session.user.roles = [];
        session.user.permissions = [];
        return { prisma, session };
      }

      const roles = userWithRoles.userRoles.map(ur => ur.role.name);
      session.user.roles = roles;
      
      // Add permissions based on roles
      const permissions = roles.flatMap(role => {
        const rolePermissions = RolePermissions[role as keyof typeof RolePermissions];
        if (!rolePermissions) {
          console.warn(`No permissions defined for role: ${role}`);
          return [];
        }
        return rolePermissions;
      });
      
      session.user.permissions = permissions;

      console.log('TRPC Context Created:', {
        hasSession: true,
        userId: session.user.id,
        userRoles: roles,
        permissionsCount: permissions.length
      });
    } catch (error) {
      console.error('Error setting up user context:', error);
      // Continue with empty roles instead of throwing
      session.user.roles = [];
      session.user.permissions = [];
    }
  }

  return {
    prisma,
    session,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error('TRPC Error:', {
      error,
      cause: error.cause,
      path: error.path,
      input: error.input,
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        code: error.code,
        message: error.message,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});


export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserHasPermission = (requiredPermission: Permission) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    // Get all permissions for the user's roles
    const userPermissions = ctx.session.user.permissions || [];
    console.log('Checking permissions:', {
      required: requiredPermission,
      userHas: userPermissions,
      roles: ctx.session.user.roles
    });

    // Super admin bypass
    if (ctx.session.user.roles.includes('super-admin')) {
      return next({
        ctx: {
          ...ctx,
          session: {
            ...ctx.session,
            user: {
              ...ctx.session.user,
              permissions: Object.values(Permissions)
            }
          }
        },
      });
    }

    if (!userPermissions.includes(requiredPermission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session
      },
    });
  });

export const permissionProtectedProcedure = (permission: Permission) =>
  t.procedure.use(enforceUserHasPermission(permission));

// Debug router for troubleshooting permissions
export const debugRouter = createTRPCRouter({
  getCurrentUserContext: protectedProcedure
    .query(({ ctx }) => {
      return {
        user: {
          id: ctx.session?.user?.id,
          email: ctx.session?.user?.email,
        },
        roles: ctx.session?.user?.roles || [],
        permissions: ctx.session?.user?.permissions || [],
      };
    }),
});