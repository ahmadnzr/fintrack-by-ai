import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Room } from "@/lib/types";
import { MapPin, Users, Wifi, Monitor, Coffee, Car } from "lucide-react";

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  disabled?: boolean;
}

export function RoomCard({ room, onSelect, disabled = false }: RoomCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          className: 'bg-green-100 text-green-800',
        };
      case 'booked':
        return {
          label: 'Booked',
          className: 'bg-red-100 text-red-800',
        };
      case 'maintenance':
        return {
          label: 'Maintenance',
          className: 'bg-yellow-100 text-yellow-800',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const getFacilityIcon = (facilityName: string) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (name.includes('projector') || name.includes('monitor') || name.includes('screen')) return <Monitor className="h-4 w-4" />;
    if (name.includes('coffee') || name.includes('pantry')) return <Coffee className="h-4 w-4" />;
    if (name.includes('parking')) return <Car className="h-4 w-4" />;
    return null;
  };

  const statusConfig = getStatusConfig(room.status);
  const isAvailable = room.status === 'available';

  return (
    <Card className={`transition-all hover:shadow-md ${!isAvailable ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {room.description && (
              <CardDescription className="text-sm">{room.description}</CardDescription>
            )}
          </div>
          <Badge className={statusConfig.className}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.capacity} people</span>
          </div>
          {room.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{room.location}</span>
            </div>
          )}
        </div>

        {room.facilities && room.facilities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Facilities:</p>
            <div className="flex flex-wrap gap-2">
              {room.facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md"
                >
                  {getFacilityIcon(facility.name)}
                  <span>{facility.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onSelect(room)}
          disabled={disabled || !isAvailable}
          className="w-full"
          variant={isAvailable ? "default" : "secondary"}
        >
          {isAvailable ? "Select Room" : "Not Available"}
        </Button>
      </CardContent>
    </Card>
  );
}
