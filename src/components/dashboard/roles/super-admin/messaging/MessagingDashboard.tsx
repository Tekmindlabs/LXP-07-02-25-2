"use client";
import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import NewConversation from "./NewConversation";

export default function MessagingDashboard() {
	const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const { data: conversations, isLoading } = api.message.getConversations.useQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="h-[calc(100vh-4rem)]">
			<Card className="h-full">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Messages</CardTitle>
						<Button onClick={() => setIsCreating(true)} disabled={isCreating}>
							New Message
						</Button>
					</div>
					<div className="mt-2">
						<Input
							placeholder="Search messages..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</CardHeader>
				<CardContent className="h-[calc(100%-8rem)]">
					{isCreating ? (
						<NewConversation onCancel={() => setIsCreating(false)} />
					) : selectedConversationId ? (
						<ConversationView
							conversationId={selectedConversationId}
							onBack={() => setSelectedConversationId(null)}
						/>
					) : (
						<Tabs defaultValue="all" className="h-full">
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="unread">Unread</TabsTrigger>
							</TabsList>
							<TabsContent value="all" className="h-[calc(100%-2rem)]">
								<ScrollArea className="h-full">
									<ConversationList
										conversations={conversations || []}
										onSelect={setSelectedConversationId}
										searchQuery={searchQuery}
									/>
								</ScrollArea>
							</TabsContent>
							<TabsContent value="unread" className="h-[calc(100%-2rem)]">
								<ScrollArea className="h-full">
									<ConversationList
										conversations={
											conversations?.filter((conv) =>
												conv.messages.some(
													(msg) =>
														msg.recipients?.some(
															(rec) => !rec.read && rec.recipientId === "current-user-id"
														)
												)
											) || []
										}
										onSelect={setSelectedConversationId}
										searchQuery={searchQuery}
									/>
								</ScrollArea>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
