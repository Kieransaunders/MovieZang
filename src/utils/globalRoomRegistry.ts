import { Room } from '../types/movie';

// Simple in-memory room registry for testing
// In a real app, this would be handled by a backend service
class GlobalRoomRegistry {
  private rooms: Map<string, Room> = new Map();

  addRoom(room: Room): void {
    this.rooms.set(room.inviteCode, room);
    console.log('Added room to registry:', room.inviteCode);
    console.log('Registry now has:', Array.from(this.rooms.keys()));
  }

  getRoom(inviteCode: string): Room | null {
    console.log('Looking for room:', inviteCode);
    console.log('Available rooms:', Array.from(this.rooms.keys()));
    const room = this.rooms.get(inviteCode) || null;
    console.log('Found room:', room ? room.inviteCode : 'none');
    return room;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  removeRoom(inviteCode: string): void {
    this.rooms.delete(inviteCode);
  }

  // Clean up old rooms (older than 24 hours)
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [code, room] of this.rooms.entries()) {
      if (room.createdAt < oneDayAgo) {
        this.rooms.delete(code);
      }
    }
  }
}

export const globalRoomRegistry = new GlobalRoomRegistry();