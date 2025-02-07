'use client';

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ClassGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<div className="container mx-auto py-6">
			<div className="mb-6">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="h-4 w-4" />
					Back
				</Button>
			</div>
			{children}
		</div>
	);
}