"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Booking } from "@/lib/types";
import { getBookingById, cancelBooking } from "@/lib/bookings-api";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  X,
  Loader2 
} from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBooking(params.id as string);
    }
  }, [params.id]);

  const loadBooking = async (id: string) => {
    try {
      const response = await getBookingById(id);
      setBooking(response.data);
    } catch (error) {
      console.error("Failed to load booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
      router.push("/bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setIsCancelling(true);
    try {
      const result = await cancelBooking(booking.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
        
        // Refresh booking data
        await loadBooking(booking.id);
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to cancel booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "EEEE, MMMM dd, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading booking details...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Booking not found</h3>
            <p className="text-muted-foreground mb-4">
              The booking you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/bookings")}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDateTime = formatDateTime(booking.startTime);
  const endDateTime = formatDateTime(booking.endTime);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/bookings")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Booking Details</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage your booking information
          </p>
        </div>
        
        {canCancelBooking(booking) && (
          <Button
            variant="destructive"
            onClick={handleCancelBooking}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Booking Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Information */}
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{booking.room?.name}</h3>
              {booking.room?.description && (
                <p className="text-muted-foreground">{booking.room.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{booking.room?.capacity} people</span>
              </div>
              {booking.room?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.room.location}</span>
                </div>
              )}
            </div>

            {booking.room?.facilities && booking.room.facilities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {booking.room.facilities.map((facility) => (
                    <Badge key={facility.id} variant="secondary">
                      {facility.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <BookingStatusBadge status={booking.status} />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{startDateTime.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{startDateTime.time} - {endDateTime.time}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Purpose:</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {booking.purpose}
                </p>
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {format(new Date(booking.createdAt), "PPp")}</p>
                <p>Updated: {format(new Date(booking.updatedAt), "PPp")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
