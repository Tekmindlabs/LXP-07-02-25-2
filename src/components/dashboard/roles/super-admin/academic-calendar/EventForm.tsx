"use client"

import { useState } from "react"
import { type Event, EventType, Priority, Status, Visibility } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface EventFormProps {
  event?: Partial<Event>
  calendarId: string
  onSubmit: (data: Partial<Event>) => void
}

interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly"
  interval: number
  endAfterOccurrences?: number
  daysOfWeek?: number[]
}

export const EventForm = ({ event, calendarId, onSubmit }: EventFormProps) => {
  const [formData, setFormData] = useState<Partial<Event> & { recurrencePattern?: RecurrencePattern }>({
    title: event?.title || "",
    description: event?.description || "",
    eventType: event?.eventType || EventType.ACADEMIC,
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || new Date(),
    calendarId: calendarId,
    status: event?.status || Status.ACTIVE,
    priority: event?.priority || Priority.MEDIUM,
    visibility: event?.visibility || Visibility.ALL,
    recurrence: event?.recurrence || null,
  })

  const [isRecurring, setIsRecurring] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={formData.eventType}
            onValueChange={(value: EventType) => setFormData({ ...formData, eventType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(EventType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Priority).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Date Range</Label>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground",
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
                    !formData.endDate && "text-muted-foreground",
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
        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
        <Label>Recurring Event</Label>
      </div>

      {isRecurring && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={formData.recurrencePattern?.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setFormData({
                  ...formData,
                  recurrencePattern: {
                    ...formData.recurrencePattern,
                    frequency: value,
                    interval: 1,
                  } as RecurrencePattern,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repeat every</Label>
            <Input
              type="number"
              min="1"
              value={formData.recurrencePattern?.interval || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurrencePattern: {
                    ...formData.recurrencePattern,
                    interval: Number.parseInt(e.target.value),
                  } as RecurrencePattern,
                })
              }
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">
        {event ? "Update Event" : "Create Event"}
      </Button>
    </form>
  )
}

