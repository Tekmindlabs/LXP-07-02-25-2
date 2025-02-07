'use client';

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { api } from "@/utils/api";
import { EventType, Status, CalendarType, Visibility } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CalendarForm } from "./CalendarForm";
import { EventForm } from "./EventForm";
import Link from "next/link";


export const AcademicCalendarView = () => {
  const [isAddCalendarOpen, setIsAddCalendarOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split('/')[2]; // Get role from pathname

  const handleCalendarSelect = (calendarId: string) => {
    router.push(`/dashboard/${role}/calendar-view?calendarId=${calendarId}`);
  };





  const { data: calendars, refetch: refetchCalendars } = api.academicCalendar.getAllCalendars.useQuery();

  const createCalendar = api.academicCalendar.createCalendar.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Calendar created successfully" });
      setIsAddCalendarOpen(false);
      void refetchCalendars();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });


  return (
    <div className="space-y-4">

        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendar Management</CardTitle>
          <Dialog open={isAddCalendarOpen} onOpenChange={setIsAddCalendarOpen}>
          <DialogTrigger asChild>
            <Button>Add Calendar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
            </DialogHeader>
            <CalendarForm 
            onSubmit={(data) => {
              if (!data.name || !data.startDate || !data.endDate) return;
              createCalendar.mutate({
              name: data.name,
              startDate: data.startDate,
              endDate: data.endDate,
              description: data.description ?? undefined,
              status: Status.ACTIVE,
              type: data.type ?? CalendarType.PRIMARY,
              isDefault: false,
              visibility: data.visibility ?? Visibility.ALL
              });
            }} 
            />
          </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calendars?.map((calendar) => (
            <Card key={calendar.id} className="p-4">
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold">{calendar.name}</h3>
              <p className="text-sm text-gray-500">{calendar.description}</p>
              <div className="flex items-center space-x-2">
              <Badge>{calendar.type}</Badge>
              <Badge variant="outline">{calendar.visibility}</Badge>
              </div>
                <Button
                className="w-full mt-2"
                onClick={() => handleCalendarSelect(calendar.id)}
                >
                View Calendar

              </Button>
            </div>
            </Card>
          ))}
          </div>
        </CardContent>
        </Card>

  </div>
  );
};
