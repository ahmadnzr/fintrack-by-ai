import { Booking, BookingInput, BookingFilters } from './types';
import { authenticatedFetch } from './auth-client';

const API_BASE = '/api';

export async function getUserBookings(filters?: BookingFilters): Promise<{ data: Booking[]; pagination: any }> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.roomId) params.append('roomId', filters.roomId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await authenticatedFetch(`${API_BASE}/bookings?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

export async function createBooking(data: BookingInput): Promise<{ success: boolean; data: Booking; error?: any }> {
  const response = await authenticatedFetch(`${API_BASE}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      data: {} as Booking,
      error: result.error || 'Failed to create booking',
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export async function getBookingById(id: string): Promise<{ data: Booking }> {
  const response = await authenticatedFetch(`${API_BASE}/bookings/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }

  return response.json();
}

export async function updateBooking(id: string, data: Partial<BookingInput & { status: string }>): Promise<{ success: boolean; data: Booking; error?: any }> {
  const response = await authenticatedFetch(`${API_BASE}/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      data: {} as Booking,
      error: result.error || 'Failed to update booking',
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export async function cancelBooking(id: string): Promise<{ success: boolean; data: Booking; error?: any }> {
  return updateBooking(id, { status: 'cancelled' });
}

export async function deleteBooking(id: string): Promise<{ success: boolean; error?: any }> {
  const response = await authenticatedFetch(`${API_BASE}/bookings/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: result.error || 'Failed to delete booking',
    };
  }

  return {
    success: true,
  };
}
