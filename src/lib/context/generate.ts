import { PrismaClient } from '@prisma/client';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import { getServerAuthSession } from '../auth';

interface CreateContextOptions {
	session: Session | null;
	prisma?: PrismaClient;
}

const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export function createContextInner(opts: CreateContextOptions) {
	return {
		session: opts.session,
		prisma: opts.prisma || prisma,
	};
}

export async function createContext(opts: CreateNextContextOptions) {
	const { req, res } = opts;
	const session = await getServerAuthSession({ req, res });
	
	return createContextInner({
		session,
		prisma,
	});
}

export type Context = ReturnType<typeof createContextInner>;