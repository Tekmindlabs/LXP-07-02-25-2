import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatGoogleGenerativeAI } from 'langchain/chat_models/googlegenai';
import { ChatAnthropic } from 'langchain/chat_models/anthropic';
import { env } from '@/env.mjs';

export type ModelProvider = 'openai' | 'google' | 'anthropic';

export const getLanguageModel = (provider: ModelProvider) => {
	switch (provider) {
		case 'openai':
			return new ChatOpenAI({
				openAIApiKey: env.OPENAI_API_KEY,
				modelName: env.OPENAI_API_MODEL,
				temperature: 0.7,
			});
		case 'google':
			return new ChatGoogleGenerativeAI({
				apiKey: env.GOOGLE_API_KEY,
				modelName: env.GOOGLE_API_MODEL,
				temperature: 0.7,
			});
		case 'anthropic':
			return new ChatAnthropic({
				anthropicApiKey: env.ANTHROPIC_API_KEY,
				modelName: env.ANTHROPIC_API_MODEL,
				temperature: 0.7,
			});
		default:
			throw new Error(`Unsupported model provider: ${provider}`);
	}
};