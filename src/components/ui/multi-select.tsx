import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Option {
	label: string;
	value: string;
}

interface MultiSelectProps {
	options: Option[];
	value?: string[];
	onChange?: (value: string[]) => void;
	placeholder?: string;
}

export function MultiSelect({ options, value = [], onChange, placeholder }: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleUnselect = (item: string) => {
		onChange?.(value.filter((i) => i !== item));
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					<div className="flex gap-1 flex-wrap">
						{value.length === 0 && placeholder}
						{value.map((item) => (
							<Badge
								variant="secondary"
								key={item}
								className="mr-1"
								onClick={(e) => {
									e.stopPropagation();
									handleUnselect(item);
								}}
							>
								{options.find((option) => option.value === item)?.label}
								<X className="ml-1 h-3 w-3" />
							</Badge>
						))}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>No item found.</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-auto">
						{options.map((option) => (
							<CommandItem
								key={option.value}
								onSelect={() => {
									onChange?.(
										value.includes(option.value)
											? value.filter((item) => item !== option.value)
											: [...value, option.value]
									);
									setOpen(true);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value.includes(option.value) ? "opacity-100" : "opacity-0"
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}