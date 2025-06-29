
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string for date
  description: string;
  amount: number;
  category: Category; // Full category object from API
  type: TransactionType;
  attachmentUrl?: string;
  tags?: Array<{ id: string; name: string }>; // Tag objects from API
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'general'; // 'general' if category can apply to both
  isCustom: boolean;
  icon?: string; // Changed from React.ElementType to string
}

export type FinancialInsightParams = {
  income: Array<{ date: string; description: string; amount: number; category: string }>;
  expenses: Array<{ date: string; description: string; amount: number; category: string }>;
};

// Room booking types
export type RoomStatus = 'available' | 'booked' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Facility {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  status: RoomStatus;
  location?: string;
  facilities?: Facility[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  room?: Room;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingInput {
  roomId: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

export interface RoomFilters {
  search?: string;
  capacity?: number;
  facilityIds?: string[];
  status?: RoomStatus | 'all';
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  status?: BookingStatus;
  roomId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
