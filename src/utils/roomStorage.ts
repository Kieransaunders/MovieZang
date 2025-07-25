import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types/movie';

const ROOMS_STORAGE_KEY = 'movie_match_rooms';

export interface StoredRoom {
  id: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  participantCount: number;
  hasPassword: boolean;
}

/**
 * Store a room for others to join
 */
export async function storeRoom(room: Room): Promise<void> {
  try {
    const existingRooms = await getStoredRooms();
    
    const storedRoom: StoredRoom = {
      id: room.id,
      inviteCode: room.inviteCode,
      createdBy: room.createdBy,
      createdAt: room.createdAt.toISOString(),
      participantCount: room.participants.length,
      hasPassword: false
    };

    const updatedRooms = [...existingRooms.filter(r => r.inviteCode !== room.inviteCode), storedRoom];
    
    await AsyncStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
    console.log('Room stored successfully:', storedRoom.inviteCode);
  } catch (error) {
    console.error('Error storing room:', error);
  }
}

/**
 * Get all stored rooms
 */
export async function getStoredRooms(): Promise<StoredRoom[]> {
  try {
    const rooms = await AsyncStorage.getItem(ROOMS_STORAGE_KEY);
    return rooms ? JSON.parse(rooms) : [];
  } catch (error) {
    console.error('Error getting stored rooms:', error);
    return [];
  }
}

/**
 * Find a room by invite code
 */
export async function findRoomByCode(inviteCode: string): Promise<StoredRoom | null> {
  try {
    const rooms = await getStoredRooms();
    console.log('All stored rooms:', rooms);
    console.log('Looking for code:', inviteCode);
    const found = rooms.find(room => room.inviteCode === inviteCode) || null;
    console.log('Found room:', found);
    return found;
  } catch (error) {
    console.error('Error finding room:', error);
    return null;
  }
}

/**
 * Remove old rooms (cleanup)
 */
export async function cleanupOldRooms(): Promise<void> {
  try {
    const rooms = await getStoredRooms();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const activeRooms = rooms.filter(room => 
      new Date(room.createdAt) > oneDayAgo
    );
    
    await AsyncStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(activeRooms));
  } catch (error) {
    console.error('Error cleaning up rooms:', error);
  }
}