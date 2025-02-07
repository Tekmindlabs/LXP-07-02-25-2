import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { UserType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const canMessageUser = (senderRole: UserType, recipientRole: UserType) => {
	const roleHierarchy = {
		ADMIN: ["ADMIN", "COORDINATOR", "TEACHER", "STUDENT", "PARENT"],
		COORDINATOR: ["COORDINATOR", "TEACHER", "STUDENT", "PARENT"],
		TEACHER: ["TEACHER", "STUDENT", "PARENT"],
		STUDENT: ["TEACHER"],
		PARENT: ["TEACHER"],
	};
	return roleHierarchy[senderRole]?.includes(recipientRole) || false;
};

type NewConversationProps = {
	onCancel: () => void;
};

export default function NewConversation({ onCancel }: NewConversationProps) {
	const { toast } = useToast();
	const { data: session } = useSession();
	const currentUserRole = session?.user?.userType;
	const [type, setType] = useState<"DIRECT" | "GROUP">("DIRECT");
	const [title, setTitle] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [message, setMessage] = useState("");

	const utils = api.useContext();
	const { data: users } = api.user.searchUsers.useQuery({
		search: searchQuery,
		excludeIds: [session?.user?.id || ""],
	});

	const createConversation = api.message.createConversation.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Conversation created successfully",
			});
			utils.message.getConversations.invalidate();
			onCancel();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const filteredUsers = users?.filter(user => 
		user.userType && currentUserRole && canMessageUser(currentUserRole, user.userType)
	);


	const handleCreate = () => {
		if (!selectedUsers.length) {
			toast({
				title: "Error",
				description: "Please select at least one recipient",
				variant: "destructive",
			});
			return;
		}

		if (!message.trim()) {
			toast({
				title: "Error",
				description: "Please enter a message",
				variant: "destructive",
			});
			return;
		}

		createConversation.mutate({
			type,
			title: type === "GROUP" ? title : undefined,
			participantIds: selectedUsers,
			initialMessage: message,
		});
	};

	return (
		<div className="space-y-4">
			<RadioGroup
				value={type}
				onValueChange={(value) => setType(value as "DIRECT" | "GROUP")}
				className="flex space-x-4"
			>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="DIRECT" id="direct" />
					<Label htmlFor="direct">Direct Message</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value="GROUP" id="group" />
					<Label htmlFor="group">Group Chat</Label>
				</div>
			</RadioGroup>

			{type === "GROUP" && (
				<div className="space-y-2">
					<Label>Group Name</Label>
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter group name..."
					/>
				</div>
			)}

			<div className="space-y-2">
				<Label>Recipients</Label>
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search users..."
				/>
				<ScrollArea className="h-48 border rounded-md">
					<div className="p-2 space-y-2">
						{filteredUsers?.map((user) => (
							<Card
								key={user.id}
								className={`p-2 cursor-pointer ${
									selectedUsers.includes(user.id)
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent"
								}`}
								onClick={() => {
									if (type === "DIRECT" && selectedUsers.length === 1) {
										return;
									}
									setSelectedUsers((prev) =>
										prev.includes(user.id)
											? prev.filter((id) => id !== user.id)
											: [...prev, user.id]
									);
								}}
							>
								<div className="flex items-center gap-2">
									<Avatar>
										<AvatarImage src={user.image} alt={user.name} />
										<AvatarFallback>
											{user.name?.[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<p className="font-medium">{user.name}</p>
											<Badge variant="secondary" className="text-xs">
												{user.userType?.toLowerCase()}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</ScrollArea>
			</div>

			<div className="space-y-2">
				<Label>Message</Label>
				<Input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Type your message..."
				/>
			</div>

			<div className="flex justify-end space-x-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					onClick={handleCreate}
					disabled={
						createConversation.isLoading ||
						!selectedUsers.length ||
						!message.trim() ||
						(type === "GROUP" && !title.trim())
					}
				>
					Create Conversation
				</Button>
			</div>
		</div>
	);
}