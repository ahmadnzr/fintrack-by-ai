"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Room, BookingInput } from "@/lib/types";
import React from "react";

const BookingFormSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  purpose: z.string().min(1, "Purpose is required.").max(200, "Purpose too long."),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

interface BookingFormProps {
  selectedRoom: Room;
  onSubmit: (data: BookingInput) => Promise<{ success?: boolean; error?: any }>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BookingForm({ selectedRoom, onSubmit, onCancel, isSubmitting = false }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
      purpose: "",
    },
  });

  const handleSubmit = async (data: BookingFormValues) => {
    // Combine date and time into ISO strings
    const startDateTime = new Date(data.date);
    const [startHour, startMinute] = data.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    const endDateTime = new Date(data.date);
    const [endHour, endMinute] = data.endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

    const bookingData: BookingInput = {
      roomId: selectedRoom.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      purpose: data.purpose,
    };

    const result = await onSubmit(bookingData);
    
    if (result.success) {
      form.reset();
    } else if (result.error && typeof result.error === 'object') {
      // Handle validation errors
      Object.keys(result.error).forEach(key => {
        if (key !== '_form') {
          form.setError(key as keyof BookingFormValues, { 
            message: Array.isArray(result.error[key]) ? result.error[key].join(', ') : result.error[key] 
          });
        }
      });
    }
  };

  // Generate time options (9 AM to 6 PM in 30-minute intervals)
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  }, []);

  return (
    <div className="space-y-6">
      {/* Selected Room Info */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold text-lg">{selectedRoom.name}</h3>
        <p className="text-sm text-muted-foreground">
          Capacity: {selectedRoom.capacity} people
          {selectedRoom.location && ` • Location: ${selectedRoom.location}`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Booking Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the date for your booking.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select start time</option>
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select end time</option>
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Team meeting, Client presentation, Training session"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the purpose of your booking (max 200 characters).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Booking
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
