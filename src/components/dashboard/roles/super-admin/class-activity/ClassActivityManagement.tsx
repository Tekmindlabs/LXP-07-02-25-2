'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import ClassActivityList from "./ClassActivityList";
import ClassActivityForm from "./ClassActivityForm";

export default function ClassActivityManagement() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

	const handleEdit = (id: string) => {
		setSelectedActivityId(id);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setSelectedActivityId(null);
		setIsFormOpen(true);
	};

	const handleClose = () => {
		setIsFormOpen(false);
		setSelectedActivityId(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Class Activities</h2>
				<Button onClick={handleCreate}>
					<PlusCircle className="mr-2 h-4 w-4" />
					Create Activity
				</Button>
			</div>

			<ClassActivityList onEdit={handleEdit} />

			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<ClassActivityForm
					activityId={selectedActivityId}
					onClose={handleClose}
				/>
			</Dialog>
		</div>
	);
}