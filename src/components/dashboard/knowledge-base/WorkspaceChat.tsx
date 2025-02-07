'use client'

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkspaceWithSettings } from '@/types/workspace'
import { useState } from 'react'

interface WorkspaceChatProps {
	workspace: WorkspaceWithSettings
}

export function WorkspaceChat({ workspace }: WorkspaceChatProps) {
	const [error, setError] = useState<string>('')
	
	const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
		api: `/api/workspace/${workspace.id}/chat`,
		onError: (err) => setError(err.message),
	})

	return (
		<Card className="flex h-[600px] flex-col">
			<ScrollArea className="flex-1 p-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`mb-4 flex ${
							message.role === 'assistant' ? 'justify-start' : 'justify-end'
						}`}
					>
						<div
							className={`rounded-lg px-4 py-2 ${
								message.role === 'assistant'
									? 'bg-secondary'
									: 'bg-primary text-primary-foreground'
							}`}
						>
							{message.content}
						</div>
					</div>
				))}
				{error && (
					<div className="text-destructive text-sm mt-2">
						Error: {error}
					</div>
				)}
			</ScrollArea>
			<form onSubmit={handleSubmit} className="p-4 border-t">
				<div className="flex gap-2">
					<Input
						value={input}
						onChange={handleInputChange}
						placeholder="Ask about workspace documents..."
						disabled={isLoading}
					/>
					<Button type="submit" disabled={isLoading}>
						Send
					</Button>
				</div>
			</form>
		</Card>
	)
}