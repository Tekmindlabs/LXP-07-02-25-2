'use client';

import { useState } from "react";
import { Calendar as CalendarModel, CalendarType, Status, Visibility } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarFormProps {
	calendar?: Partial<CalendarModel>;
	onSubmit: (data: Partial<CalendarModel>) => void;
}

export const CalendarForm = ({ calendar, onSubmit }: CalendarFormProps) => {
	const [formData, setFormData] = useState<Partial<CalendarModel>>({
		name: calendar?.name || '',
		description: calendar?.description || '',
		type: calendar?.type || CalendarType.PRIMARY,
		visibility: calendar?.visibility || Visibility.ALL,
		status: calendar?.status || Status.ACTIVE,
		isDefault: calendar?.isDefault || false,
		startDate: calendar?.startDate || new Date(),
		endDate: calendar?.endDate || new Date(),
		metadata: calendar?.metadata || {
			academicYear: format(new Date(), 'yyyy'),
			semester: 'BOTH',
			terms: 2
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const submissionData = {
			...formData,
			startDate: new Date(formData.startDate!),
			endDate: new Date(formData.endDate!),
			metadata: {
				...formData.metadata,
				academicYear: `${format(formData.startDate!, 'yyyy')}-${format(formData.endDate!, 'yyyy')}`,
			}
		};
		onSubmit(submissionData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label>Type</Label>
					<Select
						value={formData.type}
						onValueChange={(value: CalendarType) =>
							setFormData({ ...formData, type: value })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							{Object.values(CalendarType).map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Visibility</Label>
					<Select
						value={formData.visibility}
						onValueChange={(value: Visibility) =>
							setFormData({ ...formData, visibility: value })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select visibility" />
						</SelectTrigger>
						<SelectContent>
							{Object.values(Visibility).map((visibility) => (
								<SelectItem key={visibility} value={visibility}>
									{visibility}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-4">
				<Label>Date Range</Label>
				<div className="flex flex-row gap-4">
					<div className="flex-1 space-y-2">
						<Label>Start Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal",
										!formData.startDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={formData.startDate}
									onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="flex-1 space-y-2">
						<Label>End Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal",
										!formData.endDate && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={formData.endDate}
									onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>

			<div className="flex items-center space-x-2">
				<Switch
					checked={formData.isDefault}
					onCheckedChange={(checked) =>
						setFormData({ ...formData, isDefault: checked })
					}
				/>
				<Label>Set as default calendar</Label>
			</div>

			<Button type="submit">
				{calendar ? 'Update Calendar' : 'Create Calendar'}
			</Button>
		</form>
	);
};