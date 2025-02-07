import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () => {
			const ctx = await createTRPCContext({ req });
			console.log('TRPC Context Created:', {
				hasSession: !!ctx.session,
				userId: ctx.session?.user?.id,
				userRoles: ctx.session?.user?.roles,
			});
			return ctx;
		},
		onError:
			env.NODE_ENV === "development"
				? ({ path, error }) => {
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
						);
						if (error.cause) {
							console.error('Error cause:', error.cause);
						}
					}
				: undefined,
	});

export { handler as GET, handler as POST };