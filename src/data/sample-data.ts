import type { ActivityTemplate } from '@/types/class-activity';

export const sampleTemplates: ActivityTemplate[] = [
	{
		id: "1",
		type: "QUIZ_MULTIPLE_CHOICE",
		title: "Basic Multiple Choice Quiz",
		description: "Standard multiple choice quiz template with customizable options",
		configuration: {
			timeLimit: 1800,
			attempts: 2,
			passingScore: 70,
			isGraded: true,
			gradingType: "AUTOMATIC",
			viewType: "STUDENT"
		}
	},
	{
		id: "2",
		type: "GAME_WORD_SEARCH",
		title: "Vocabulary Word Search",
		description: "Interactive word search game for vocabulary practice",
		configuration: {
			timeLimit: 900,
			attempts: 3,
			isGraded: false,
			gradingType: "NONE",
			viewType: "STUDENT"
		}
	},
	{
		id: "3",
		type: "QUIZ_FILL_BLANKS",
		title: "Fill in the Blanks Exercise",
		description: "Text completion exercise with blank spaces",
		configuration: {
			timeLimit: 1200,
			attempts: 2,
			passingScore: 80,
			isGraded: true,
			gradingType: "AUTOMATIC",
			viewType: "STUDENT"
		}
	}
];