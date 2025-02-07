"use client";

import { format } from "date-fns";
import { api } from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuBell, LuCalendar, LuGraduationCap, LuAlertCircle, LuCheckCircle } from "react-icons/lu";

type NotificationListProps = {
	notifications: any[];
	type: "SENT" | "RECEIVED";
};

const NotificationIcon = {
	ANNOUNCEMENT: LuBell,
	ASSIGNMENT: LuGraduationCap,
	GRADE: LuCheckCircle,
	REMINDER: LuCalendar,
	SYSTEM: LuAlertCircle,
};

export default function NotificationList({ notifications, type }: NotificationListProps) {
	const utils = api.useContext();

	const markAsRead = api.notification.markAsRead.useMutation({
		onSuccess: () => {
			utils.notification.getAll.invalidate();
		},
	});

	const deleteNotification = api.notification.delete.useMutation({
		onSuccess: () => {
			utils.notification.getAll.invalidate();
		},
	});

	return (
		<div className="space-y-4">
			{notifications.map((notification) => {
				const Icon = NotificationIcon[notification.type];
				const recipient = notification.recipients.find(
					(r: any) => r.recipientId === "current-user-id"
				);
				const isUnread = type === "RECEIVED" && !recipient?.read;

				return (
					<Card
						key={notification.id}
						className={`p-4 ${isUnread ? "bg-accent" : ""}`}
						onClick={() => {
							if (isUnread) {
								markAsRead.mutate(notification.id);
							}
						}}
					>
						<div className="flex items-start gap-4">
							<div
								className={`rounded-full p-2 ${
									isUnread ? "bg-primary text-primary-foreground" : "bg-muted"
								}`}
							>
								<Icon className="h-4 w-4" />
							</div>
							<div className="flex-1 space-y-1">
								<div className="flex items-start justify-between">
									<div>
										<p className="font-medium">{notification.title}</p>
										<p className="text-sm text-muted-foreground">
											From: {notification.sender.name}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											{format(new Date(notification.createdAt), "MMM d, h:mm a")}
										</span>
										{type === "SENT" && (
											<Button
												variant="ghost"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													deleteNotification.mutate(notification.id);
												}}
											>
												Delete
											</Button>
										)}
									</div>
								</div>
								<p className="text-sm">{notification.content}</p>
								{type === "SENT" && (
									<div className="mt-2">
										<p className="text-sm text-muted-foreground">
											Read by:{" "}
											{notification.recipients.filter((r: any) => r.read).length} of{" "}
											{notification.recipients.length}
										</p>
									</div>
								)}
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}