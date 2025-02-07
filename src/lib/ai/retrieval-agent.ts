import { LanceDB } from '../vectorDb/lance';
import { BaseLanguageModel } from 'langchain/base_language_models';
import { VectorStoreRetriever } from 'langchain/vectorstores/base';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';
import { formatDocumentsWithSources } from 'langchain/util/document';

export class RetrievalAgent {
	private model: BaseLanguageModel;
	private retriever: VectorStoreRetriever;
	
	constructor(model: BaseLanguageModel, knowledgeBaseId: string) {
		this.model = model;
		this.retriever = LanceDB.getRetriever(knowledgeBaseId);
	}

	private questionPrompt = PromptTemplate.fromTemplate(
		`Answer the question based only on the following context:
		{context}
		
		Question: {question}
		
		Answer with citations in markdown format. If you don't know, say "I don't know".`
	);

	private combineDocumentsPrompt = PromptTemplate.fromTemplate(
		`Given these documents, provide a comprehensive answer:
		{context}
		
		Question: {question}
		
		Provide a clear answer with citations to the source documents.`
	);

	private chain = RunnableSequence.from([
		{
			context: async (input: { question: string }) => {
				const docs = await this.retriever.getRelevantDocuments(input.question);
				return formatDocumentsWithSources(docs);
			},
			question: (input: { question: string }) => input.question,
		},
		this.questionPrompt,
		this.model,
		new StringOutputParser(),
	]);

	async query(question: string) {
		try {
			const response = await this.chain.invoke({
				question
			});
			
			return {
				answer: response,
				success: true
			};
		} catch (error) {
			console.error('Retrieval agent error:', error);
			return {
				answer: "Failed to retrieve information",
				success: false,
				error
			};
		}
	}
}