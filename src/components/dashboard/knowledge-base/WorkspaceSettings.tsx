'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WorkspaceSettings as IWorkspaceSettings } from '@/types/workspace'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const settingsSchema = z.object({
	messageLimit: z.number().min(1).max(1000),
	aiProvider: z.enum(['openai', 'anthropic', 'google']),
	aiModel: z.string().min(1),
	maxTokens: z.number().min(100).max(4000),
	temperature: z.number().min(0).max(2),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface WorkspaceSettingsProps {
	settings: IWorkspaceSettings
	onUpdate: (data: SettingsFormData) => Promise<void>
}

export function WorkspaceSettings({ settings, onUpdate }: WorkspaceSettingsProps) {
	const form = useForm<SettingsFormData>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			messageLimit: settings.messageLimit,
			aiProvider: settings.aiProvider,
			aiModel: settings.aiModel,
			maxTokens: settings.maxTokens,
			temperature: settings.temperature,
		},
	})

	return (
		<Card className="p-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
					<FormField
						control={form.control}
						name="messageLimit"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Message Limit</FormLabel>
								<FormControl>
									<Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="aiProvider"
						render={({ field }) => (
							<FormItem>
								<FormLabel>AI Provider</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select provider" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="openai">OpenAI</SelectItem>
										<SelectItem value="anthropic">Anthropic</SelectItem>
										<SelectItem value="google">Google</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="aiModel"
						render={({ field }) => (
							<FormItem>
								<FormLabel>AI Model</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="maxTokens"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Tokens</FormLabel>
								<FormControl>
									<Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="temperature"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Temperature</FormLabel>
								<FormControl>
									<Input 
										type="number" 
										step="0.1" 
										{...field} 
										onChange={e => field.onChange(parseFloat(e.target.value))} 
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Button type="submit">Save Settings</Button>
				</form>
			</Form>
		</Card>
	)
}