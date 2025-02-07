import { prisma } from '@/server/db'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const settingsSchema = z.object({
	messageLimit: z.number().min(1).max(1000),
	aiProvider: z.enum(['openai', 'anthropic', 'google']),
	aiModel: z.string().min(1),
	maxTokens: z.number().min(100).max(4000),
	temperature: z.number().min(0).max(2),
})

export async function PUT(req: Request, { params }: { params: { workspaceId: string } }) {
	try {
		const session = await getServerSession()
		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const data = settingsSchema.parse(await req.json())

		const settings = await prisma.workspaceSettings.upsert({
			where: { workspaceId: params.workspaceId },
			create: {
				workspaceId: params.workspaceId,
				...data
			},
			update: data
		})

		return new Response(JSON.stringify(settings))
	} catch (error) {
		console.error('Settings update error:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}