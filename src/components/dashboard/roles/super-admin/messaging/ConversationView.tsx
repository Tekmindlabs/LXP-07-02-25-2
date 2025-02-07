import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { LuArrowLeft, LuPaperclip, LuSend, LuHeart, LuSmile, LuThumbsUp, LuCheck, LuCheckCheck } from "react-icons/lu";

type ConversationViewProps = {
	conversationId: string;
	onBack: () => void;
};

export default function ConversationView({
	conversationId,
	onBack,
}: ConversationViewProps) {
	const [newMessage, setNewMessage] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: conversation, isLoading } = api.message.getConversation.useQuery(
		conversationId
	);

	const utils = api.useContext();
	const sendMessage = api.message.sendMessage.useMutation({
		onSuccess: () => {
			setNewMessage("");
			utils.message.getConversation.invalidate(conversationId);
		},
	});

	const markAsRead = api.message.markAsRead.useMutation();

	useEffect(() => {
		if (conversationId) {
			markAsRead.mutate(conversationId);
		}
	}, [conversationId]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [conversation?.messages]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!conversation) {
		return <div>Conversation not found</div>;
	}

	const { data: session } = useSession();
	const currentUserId = session?.user?.id;

	const otherParticipants = conversation.participants.filter(
		(p) => p.userId !== currentUserId
	);

	const isCurrentUserMessage = (senderId: string) => senderId === currentUserId;
	const title =
		conversation.title ||
		otherParticipants.map((p) => p.user.name).join(", ");

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAttachments(Array.from(e.target.files));
		}
	};

	const handleSend = async () => {
		if (newMessage.trim() || attachments.length > 0) {
			const uploadedFiles = await Promise.all(
				attachments.map(async (file) => {
					// TODO: Implement file upload logic
					const url = "temporary-url"; // Replace with actual upload
					return {
						type: file.type.includes("image") ? "IMAGE" : "DOCUMENT",
						url,
					};
				})
			);

			sendMessage.mutate({
				conversationId,
				content: newMessage.trim(),
				attachments: uploadedFiles,
			});
			setAttachments([]);
		}
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center gap-4 p-4 border-b">
				<Button variant="ghost" size="icon" onClick={onBack}>
					<LuArrowLeft className="h-4 w-4" />
				</Button>
				{conversation.type === "DIRECT" ? (
					<Avatar>
						<AvatarImage
							src={otherParticipants[0]?.user.image}
							alt={otherParticipants[0]?.user.name}
						/>
						<AvatarFallback>
							{otherParticipants[0]?.user.name?.[0].toUpperCase()}
						</AvatarFallback>
					</Avatar>
				) : (
					<Avatar>
						<AvatarFallback>{title[0].toUpperCase()}</AvatarFallback>
					</Avatar>
				)}
				<div>
					<h3 className="font-semibold">{title}</h3>
					<p className="text-sm text-muted-foreground">
						{conversation.participants.length} participants
					</p>
				</div>
			</div>

			<ScrollArea ref={scrollRef} className="flex-1 p-4">
				<div className="space-y-4">
					{conversation.messages.map((message) => (
						<div key={message.id} className="flex flex-col gap-1">
							<div className={`flex items-start gap-2 ${
								isCurrentUserMessage(message.sender.id) ? 'justify-end' : ''
							}`}>
								<div className="flex gap-2 max-w-[70%]">
									{!isCurrentUserMessage(message.sender.id) && (
										<Avatar>
											<AvatarImage
												src={message.sender.image}
												alt={message.sender.name}
											/>
											<AvatarFallback>
												{message.sender.name?.[0].toUpperCase()}
											</AvatarFallback>
										</Avatar>
									)}
									<div className="flex flex-col gap-1">
										<Card
											className={`p-3 ${
												isCurrentUserMessage(message.sender.id)
													? "bg-primary text-primary-foreground"
													: ""
											}`}
										>
											{!isCurrentUserMessage(message.sender.id) && (
												<p className="text-xs text-muted-foreground mb-1">
													{message.sender.name}
												</p>
											)}
											<p>{message.content}</p>
											{message.attachments?.map((attachment) => (
												<div key={attachment.id} className="mt-2">
													{attachment.type === "IMAGE" ? (
														<img src={attachment.url} alt="attachment" className="max-w-xs rounded" />
													) : (
														<a href={attachment.url} className="flex items-center gap-2 text-sm hover:underline">
															<LuPaperclip className="h-4 w-4" />
															Download attachment
														</a>
													)}
												</div>
											))}
										</Card>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
											{isCurrentUserMessage(message.sender.id) && (
												<span className="flex items-center">
													{message.recipients?.every((r) => r.read) ? (
														<LuCheckCheck className="h-3 w-3" />
													) : (
														<LuCheck className="h-3 w-3" />
													)}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1 ml-12">
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<LuThumbsUp className="h-3 w-3" />
								</Button>
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<LuHeart className="h-3 w-3" />
								</Button>
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<LuSmile className="h-3 w-3" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			<div className="p-4 border-t">
				<div className="flex flex-col gap-2">
					{attachments.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{attachments.map((file, index) => (
								<div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
									<LuPaperclip className="h-4 w-4" />
									<span className="text-sm">{file.name}</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0"
										onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
									>
										×
									</Button>
								</div>
							))}
						</div>
					)}
					<div className="flex gap-2">
						<Input
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="Type a message..."
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
						/>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							multiple
							onChange={handleFileSelect}
						/>
						<Button
							size="icon"
							variant="ghost"
							className="shrink-0"
							onClick={() => fileInputRef.current?.click()}
						>
							<LuPaperclip className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							className="shrink-0"
							onClick={handleSend}
							disabled={(!newMessage.trim() && attachments.length === 0) || sendMessage.isLoading}
						>
							<LuSend className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}