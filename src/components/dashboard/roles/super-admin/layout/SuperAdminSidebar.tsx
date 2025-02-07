'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LuLayoutDashboard, 
  LuCalendar, 
  LuGraduationCap, 
  LuUsers, 
  LuSettings, 
  LuBookOpen, 
  LuClock, 
  LuHouse, 
  LuMessageSquare, 
  LuBell,
  LuUserCog,
  LuActivity,
  LuBook,
  LuClipboardCheck
} from "react-icons/lu";
import { type FC } from "react";

interface MenuItem {
  title: string;
  href: string;
  icon: FC<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/[role]",
    icon: LuLayoutDashboard,
  },
  {
    title: "Programs",
    href: "/dashboard/[role]/program",
    icon: LuGraduationCap,
  },
  {
    title: "Academic Calendar",
    href: "/dashboard/[role]/academic-calendar",
    icon: LuCalendar,
  },

  {
    title: "Class Groups",
    href: "/dashboard/[role]/class-group",
    icon: LuUsers,
  },
  {
    title: "Classes",
    href: "/dashboard/[role]/class",
    icon: LuBookOpen,
  },
  {
    title: "Teachers",
    href: "/dashboard/[role]/teacher",
    icon: LuUsers,
  },
  {
    title: "Students",
    href: "/dashboard/[role]/student",
    icon: LuUsers,
  },
  {
    title: "Subjects",
    href: "/dashboard/[role]/subject",
    icon: LuBookOpen,
  },
  {
    title: "Timetables",
    href: "/dashboard/[role]/timetable",
    icon: LuClock,
  },
  {
    title: "Classrooms",
    href: "/dashboard/[role]/classroom",
    icon: LuHouse,
  },
  {
    title: "Users",
    href: "/dashboard/[role]/users",
    icon: LuUsers,
  },
  {
    title: "Coordinator Management",
    href: "/dashboard/[role]/coordinator",
    icon: LuUserCog,
  },
  {
    title: "Class Activities",
    href: "/dashboard/[role]/class-activity",
    icon: LuActivity,
  },
  {
    title: "Attendance Management",
    href: "/dashboard/[role]/attendance",
    icon: LuClipboardCheck,
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/[role]/knowledge-base",
    icon: LuBook,
  },
  {
    title: "Messages",
    href: "/dashboard/[role]/messaging",
    icon: LuMessageSquare,
  },
  {
    title: "Notifications",
    href: "/dashboard/[role]/notification",
    icon: LuBell,
  },
  {
    title: "Settings",
    href: "/dashboard/[role]/settings",
    icon: LuSettings,
  },
];

const SuperAdminSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const href = item.href.replace('[role]', 'super-admin');
              const isActive = pathname === href;
              return (
                <Link 
                  key={href} 
                  href={href}
                  className="block"
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-2", {
                      "bg-secondary": isActive,
                    })}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;