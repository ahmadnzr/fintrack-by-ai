"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RoomSelection } from "@/components/bookings/room-selection";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingList } from "@/components/bookings/booking-list";
import { Room, Facility, Booking, RoomFilters, BookingInput } from "@/lib/types";
import { getRooms, getFacilities } from "@/lib/rooms-api";
import { getUserBookings, createBooking, cancelBooking } from "@/lib/bookings-api";
import { ArrowLeft, Calendar, Plus } from "lucide-react";

type BookingStep = "select-room" | "booking-form" | "view-bookings";

export function BookingsPageClient() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>("select-room");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Loading states
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Load facilities on mount
  useEffect(() => {
    loadFacilities();
    loadBookings();
  }, []);

  const loadFacilities = async () => {
    try {
      const response = await getFacilities();
      setFacilities(response.data);
    } catch (error) {
      console.error("Failed to load facilities:", error);
      toast({
        title: "Error",
        description: "Failed to load facilities",
        variant: "destructive",
      });
    }
  };

  const loadRooms = useCallback(async (filters: RoomFilters) => {
    setIsLoadingRooms(true);
    try {
      const response = await getRooms(filters);
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to load rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRooms(false);
    }
  }, [toast]);

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCurrentStep("booking-form");
  };

  const handleBookingSubmit = async (data: BookingInput) => {
    setIsSubmittingBooking(true);
    try {
      const result = await createBooking(data);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Room booking created successfully!",
        });
        
        // Refresh bookings and go back to room selection
        await loadBookings();
        setCurrentStep("select-room");
        setSelectedRoom(null);
        
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create booking",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
      return { success: false, error: "Failed to create booking" };
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const result = await cancelBooking(id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
        
        // Refresh bookings
        await loadBookings();
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
    }
  };

  const handleBackToRoomSelection = () => {
    setCurrentStep("select-room");
    setSelectedRoom(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "select-room":
        return "Select a Room";
      case "booking-form":
        return "Create Booking";
      case "view-bookings":
        return "Your Bookings";
      default:
        return "Room Bookings";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {currentStep !== "select-room" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToRoomSelection}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-bold">{getStepTitle()}</h1>
          </div>
          <p className="text-muted-foreground">
            {currentStep === "select-room" && "Choose a room and create your booking"}
            {currentStep === "booking-form" && "Fill in the booking details"}
            {currentStep === "view-bookings" && "Manage your room bookings"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={currentStep === "view-bookings" ? "default" : "outline"}
            onClick={() => setCurrentStep("view-bookings")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Bookings
          </Button>
          {currentStep !== "select-room" && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep("select-room")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {currentStep === "select-room" && (
        <RoomSelection
          rooms={rooms}
          facilities={facilities}
          onRoomSelect={handleRoomSelect}
          onFiltersChange={loadRooms}
          isLoading={isLoadingRooms}
        />
      )}

      {currentStep === "booking-form" && selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
            <CardDescription>
              Fill in the details for your room booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm
              selectedRoom={selectedRoom}
              onSubmit={handleBookingSubmit}
              onCancel={handleBackToRoomSelection}
              isSubmitting={isSubmittingBooking}
            />
          </CardContent>
        </Card>
      )}

      {currentStep === "view-bookings" && (
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              View and manage your room bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingList
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              isLoading={isLoadingBookings}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {currentStep === "select-room" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-sm text-muted-foreground">Available Rooms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{facilities.length}</div>
              <p className="text-sm text-muted-foreground">Facilities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Active Bookings</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
