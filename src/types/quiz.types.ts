export type QuizStatus = "Completed" | "Incomplete"

export type Quiz = {
	id: string
	title: string
	category: string 
	questions: number
	reward?: number
	description?: string
}

export type NewsItem = Quiz

export type RecentItem = Quiz & {
	status?: QuizStatus
}
