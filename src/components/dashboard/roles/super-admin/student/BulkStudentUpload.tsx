'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface UploadResult {
	successful: number;
	failed: number;
	errors: string[];
}

export const BulkStudentUpload = () => {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const utils = api.useContext();

	const uploadMutation = api.student.bulkUpload.useMutation({
		onSuccess: (result: UploadResult) => {
			toast.success(`Successfully uploaded ${result.successful} students`);
			if (result.failed > 0) {
				toast.error(`Failed to upload ${result.failed} students`, {
					description: (
						<div className="mt-2">
							<p className="font-semibold">Errors:</p>
							<ul className="list-disc pl-4">
								{result.errors.slice(0, 3).map((error, index) => (
									<li key={index}>{error}</li>
								))}
								{result.errors.length > 3 && (
									<li>...and {result.errors.length - 3} more errors</li>
								)}
							</ul>
						</div>
					),
					duration: 5000,
				});
			}
			setFile(null);
			setIsUploading(false);
			utils.student.searchStudents.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to upload students");
			setIsUploading(false);
		}
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
				toast.error("Please upload a CSV or Excel file");
				return;
			}
			setFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!file) return;
		
		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);
		
		uploadMutation.mutate(formData);
	};

	return (
		<div className="flex items-center gap-4">
			<Input
				type="file"
				accept=".csv,.xlsx,.xls"
				onChange={handleFileChange}
				className="max-w-xs"
				disabled={isUploading}
			/>
			<Button 
				onClick={handleUpload}
				disabled={!file || isUploading}
			>
				{isUploading ? "Uploading..." : "Upload"}
			</Button>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<InfoCircledIcon className="h-5 w-5 text-muted-foreground cursor-help" />
					</TooltipTrigger>
					<TooltipContent className="max-w-sm">
						<p className="font-semibold mb-2">File Format Instructions:</p>
						<ul className="list-disc pl-4 space-y-1">
							<li>Upload CSV or Excel file (.csv, .xlsx, .xls)</li>
							<li>Required columns: Name, Email, Date of Birth (YYYY-MM-DD)</li>
							<li>Optional columns: Class ID, Parent Email</li>
							<li>First row should be column headers</li>
							<li>Maximum 500 students per upload</li>
						</ul>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};