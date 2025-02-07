'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
		icon?: React.ReactNode;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const pathname = usePathname();
	const role = pathname.split('/')[2]?.toUpperCase()?.replace(/-/g, '_');

	return (
		<nav
			className={cn(
				"flex space-y-1 lg:flex-col lg:space-x-0 lg:space-y-1",
				className
			)}
			{...props}
		>
			{items.map((item) => {
				const href = item.href.replace('[role]', role?.toLowerCase().replace(/_/g, '-'));
				return (
					<Link
						key={item.href}
						href={href}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							pathname === href
								? "bg-muted hover:bg-muted"
								: "hover:bg-transparent hover:underline",
							"justify-start"
						)}
					>
						{item.icon && <span className="mr-2">{item.icon}</span>}
						{item.title}
					</Link>
				);
			})}
		</nav>
	);
}