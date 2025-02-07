import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/api/root';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const api = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '';
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

