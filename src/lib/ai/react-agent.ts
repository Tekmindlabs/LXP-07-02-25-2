import { BaseLanguageModel } from 'langchain/base_language_models';
import { RetrievalAgent } from './retrieval-agent';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';
import { Tool } from 'langchain/tools';
import { AgentExecutor, createReactAgent } from 'langchain/agents';

export class ReactAgent {
	private model: BaseLanguageModel;
	private retrievalAgent: RetrievalAgent;
	private tools: Tool[];
	private executor: AgentExecutor;

	constructor(
		model: BaseLanguageModel, 
		knowledgeBaseId: string,
		tools: Tool[]
	) {
		this.model = model;
		this.retrievalAgent = new RetrievalAgent(model, knowledgeBaseId);
		this.tools = [
			...tools,
			new Tool({
				name: "knowledge_base",
				description: "Search the knowledge base for relevant information",
				func: async (query: string) => {
					const result = await this.retrievalAgent.query(query);
					return result.answer;
				}
			})
		];

		const agent = createReactAgent(model, this.tools);
		this.executor = AgentExecutor.fromAgentAndTools({
			agent,
			tools: this.tools,
			verbose: true
		});
	}

	private systemPrompt = PromptTemplate.fromTemplate(
		`You are a helpful AI assistant with access to various tools and a knowledge base.
		Use the knowledge_base tool when you need to retrieve specific information.
		Always provide clear, accurate responses with citations when using knowledge base information.
		
		Current conversation:
		{chat_history}
		
		Human: {input}
		Assistant: Let me help you with that.`
	);

	private chain = RunnableSequence.from([
		{
			input: (input: { question: string; chatHistory: string }) => input.question,
			chat_history: (input: { question: string; chatHistory: string }) => input.chatHistory,
		},
		this.systemPrompt,
		async (input: string) => {
			return this.executor.run(input);
		},
		new StringOutputParser(),
	]);

	async chat(question: string, chatHistory: string = "") {
		try {
			const response = await this.chain.invoke({
				question,
				chatHistory
			});
			
			return {
				response,
				success: true
			};
		} catch (error) {
			console.error('ReAct agent error:', error);
			return {
				response: "I encountered an error processing your request.",
				success: false,
				error
			};
		}
	}
}