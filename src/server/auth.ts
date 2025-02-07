import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcryptjs";
import { env } from "@/env.mjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: string[];
    permissions: string[];
  }

  interface JWT {
    id: string;
    roles: string[];
    permissions: string[];
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.roles = user.roles || [];
        token.permissions = user.permissions || [];
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          roles: (token.roles as string[]) || [],
          permissions: (token.permissions as string[]) || [],
        };
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // If the url is a relative url, append it to the base url
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If the url is already an absolute url, return it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
        
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        
        // Extract roles and permissions
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = user.userRoles
          .flatMap((ur) => ur.role.permissions)
          .map((rp) => rp.permission.name);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: roles,
          permissions: permissions
        };
      },
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const getServerAuthSession = async () => {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};



