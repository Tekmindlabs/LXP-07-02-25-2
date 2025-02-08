import { authOptions } from "@/server/auth"
import NextAuth from "next-auth"

// Configure session handling
const handler = NextAuth({
	...authOptions,
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	debug: true,
});

export const GET = handler;
export const POST = handler;