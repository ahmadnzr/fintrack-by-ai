"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoomCard } from "./room-card";
import { Room, Facility, RoomFilters } from "@/lib/types";
import { Search, Filter, Users, X } from "lucide-react";

interface RoomSelectionProps {
  rooms: Room[];
  facilities: Facility[];
  onRoomSelect: (room: Room) => void;
  onFiltersChange: (filters: RoomFilters) => void;
  isLoading?: boolean;
}

export function RoomSelection({ 
  rooms, 
  facilities, 
  onRoomSelect, 
  onFiltersChange,
  isLoading = false 
}: RoomSelectionProps) {
  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    capacity: undefined,
    facilityIds: [],
    status: "available",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCapacityChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      capacity: value ? parseInt(value) : undefined 
    }));
  };

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      facilityIds: checked
        ? [...(prev.facilityIds || []), facilityId]
        : (prev.facilityIds || []).filter(id => id !== facilityId)
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      capacity: undefined,
      facilityIds: [],
      status: "available",
    });
  };

  const hasActiveFilters = filters.search || filters.capacity || (filters.facilityIds && filters.facilityIds.length > 0);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Find a Room</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms by name or location..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Capacity Filter */}
                <div className="space-y-2">
                  <Label>Minimum Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={filters.capacity || ""}
                      onChange={(e) => handleCapacityChange(e.target.value)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Room Status</Label>
                  <Select
                    value={filters.status || "available"}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available Only</SelectItem>
                      <SelectItem value="all">All Rooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Facilities Filter */}
              {facilities.length > 0 && (
                <div className="space-y-2">
                  <Label>Required Facilities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility.id}
                          checked={(filters.facilityIds || []).includes(facility.id)}
                          onCheckedChange={(checked) => 
                            handleFacilityToggle(facility.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={facility.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {facility.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Available Rooms ({rooms.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={onRoomSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
