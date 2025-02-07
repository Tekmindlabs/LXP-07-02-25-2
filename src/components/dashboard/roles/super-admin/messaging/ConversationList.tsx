import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ConversationListProps = {
	conversations: any[];
	onSelect: (id: string) => void;
	searchQuery: string;
};

export default function ConversationList({
	conversations,
	onSelect,
	searchQuery,
}: ConversationListProps) {
	const filteredConversations = conversations.filter((conv) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			conv.title?.toLowerCase().includes(searchLower) ||
			conv.messages[0]?.content.toLowerCase().includes(searchLower) ||
			conv.participants.some((p: any) =>
				p.user.name?.toLowerCase().includes(searchLower)
			)
		);
	});

	return (
		<div className="space-y-2">
			{filteredConversations.map((conversation) => {
				const lastMessage = conversation.messages[0];
				const otherParticipants = conversation.participants.filter(
					(p: any) => p.user.id !== "current-user-id"
				);
				const title =
					conversation.title ||
					otherParticipants.map((p: any) => p.user.name).join(", ");

				return (
					<Card
						key={conversation.id}
						className={cn(
							"p-4 cursor-pointer hover:bg-accent",
							conversation.messages.some(
								(msg: any) =>
									msg.recipients?.some(
										(rec: any) => !rec.read && rec.recipientId === "current-user-id"
									)
							) && "bg-accent"
						)}
						onClick={() => onSelect(conversation.id)}
					>
						<div className="flex items-start gap-4">
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
									<AvatarFallback>
										{title[0].toUpperCase()}
									</AvatarFallback>
								</Avatar>
							)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold truncate">{title}</h4>
									{lastMessage && (
										<span className="text-sm text-muted-foreground">
											{format(new Date(lastMessage.createdAt), "MMM d, h:mm a")}
										</span>
									)}
								</div>
								{lastMessage && (
									<p className="text-sm text-muted-foreground truncate">
										<span className="font-medium">
											{lastMessage.sender.name}:{" "}
										</span>
										{lastMessage.content}
									</p>
								)}
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}