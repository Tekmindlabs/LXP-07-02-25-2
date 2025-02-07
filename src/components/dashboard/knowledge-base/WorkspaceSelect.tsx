'use client';

import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface Workspace {
	id: string;
	name: string;
}

interface WorkspaceSelectProps {
	workspaces: Workspace[];
	selectedWorkspace: Workspace | null;
	onWorkspaceSelect: (workspace: Workspace) => void;
}

export function WorkspaceSelect({ workspaces, selectedWorkspace, onWorkspaceSelect }: WorkspaceSelectProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{selectedWorkspace ? selectedWorkspace.name : "Select workspace..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search workspace..." />
					<CommandEmpty>No workspace found.</CommandEmpty>
					<CommandGroup>
						{workspaces.map((workspace) => (
							<CommandItem
								key={workspace.id}
								onSelect={() => {
									onWorkspaceSelect(workspace);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										selectedWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
									)}
								/>
								{workspace.name}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}