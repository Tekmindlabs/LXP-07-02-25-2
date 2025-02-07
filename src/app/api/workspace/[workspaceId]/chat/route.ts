import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { prisma } from '@/server/db'
import { getServerSession } from 'next-auth'

const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL,
})
const openai = new OpenAIApi(config)

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
	try {
		const session = await getServerSession()
		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const { messages } = await req.json()
		const workspace = await prisma.workspaceSettings.findUnique({
			where: { workspaceId: params.workspaceId }
		})

		if (!workspace) {
			return new Response('Workspace not found', { status: 404 })
		}

		// Check message limits
		const chat = await prisma.workspaceChat.findFirst({
			where: {
				workspaceId: params.workspaceId,
				userId: session.user.id,
			}
		})

		if (chat && chat.messageCount >= workspace.messageLimit) {
			return new Response('Message limit exceeded', { status: 429 })
		}

		// Get workspace context from documents
		const documents = await prisma.workspaceDocument.findMany({
			where: { workspaceId: params.workspaceId },
			include: { sourceDocument: true }
		})

		const context = documents.map(doc => doc.sourceDocument.content).join('\n')

		const systemMessage = {
			role: 'system',
			content: `You are a helpful AI assistant with access to the following workspace context:\n\n${context}\n\nAnswer questions based on this context.`
		}

		const response = await openai.createChatCompletion({
			model: workspace.aiModel,
			messages: [systemMessage, ...messages],
			temperature: workspace.temperature,
			max_tokens: workspace.maxTokens,
			stream: true,
		})

		// Update message count
		await prisma.workspaceChat.upsert({
			where: {
				id: chat?.id || '',
			},
			create: {
				workspaceId: params.workspaceId,
				userId: session.user.id,
				messageCount: 1,
			},
			update: {
				messageCount: {
					increment: 1
				},
				lastMessageAt: new Date(),
			}
		})

		const stream = OpenAIStream(response)
		return new StreamingTextResponse(stream)

	} catch (error) {
		console.error('Chat error:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}