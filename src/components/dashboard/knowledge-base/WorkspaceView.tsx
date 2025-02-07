'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkspaceWithSettings } from '@/types/workspace'
import { WorkspaceChat } from './WorkspaceChat'
import { WorkspaceSettings } from './WorkspaceSettings'
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast";

interface WorkspaceViewProps {
	workspace: WorkspaceWithSettings
}

export function WorkspaceView({ workspace: initialWorkspace }: WorkspaceViewProps) {
	const [workspace, setWorkspace] = useState(initialWorkspace)

	const handleSettingsUpdate = async (data: any) => {
		try {
			const response = await fetch(`/api/workspace/${workspace.id}/settings`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!response.ok) throw new Error('Failed to update settings')

			const updatedSettings = await response.json()
			setWorkspace({ ...workspace, settings: updatedSettings })
			toast({
				title: 'Settings updated',
				description: 'Workspace settings have been updated successfully.',
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update workspace settings.',
				variant: 'destructive',
			})
		}
	}

	return (
		<div className="container mx-auto py-6">
			<Tabs defaultValue="chat">
				<TabsList>
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>
				<TabsContent value="chat">
					<WorkspaceChat workspace={workspace} />
				</TabsContent>
				<TabsContent value="settings">
					<WorkspaceSettings 
						settings={workspace.settings} 
						onUpdate={handleSettingsUpdate} 
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}