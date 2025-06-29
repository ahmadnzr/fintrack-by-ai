import { Room, RoomFilters } from './types';
import { authenticatedFetch } from './auth-client';

const API_BASE = '/api';

export async function getRooms(filters?: RoomFilters): Promise<{ data: Room[]; pagination: any }> {
  const params = new URLSearchParams();
  
  // Only add status filter if it's not "all"
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.capacity) params.append('capacity', filters.capacity.toString());
  if (filters?.facilityIds?.length) params.append('facilityIds', filters.facilityIds.join(','));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await authenticatedFetch(`${API_BASE}/rooms?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
}

export async function getRoomById(id: string): Promise<{ data: Room }> {
  const response = await authenticatedFetch(`${API_BASE}/rooms/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
}

export async function getFacilities(): Promise<{ data: any[] }> {
  const response = await authenticatedFetch(`${API_BASE}/facilities`);

  if (!response.ok) {
    throw new Error('Failed to fetch facilities');
  }

  return response.json();
}
