import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import * as Clipboard from 'expo-clipboard';
import { useMovieStore } from '../state/movieStore';
import { cn } from '../utils/cn';

interface RoomScreenProps {
  navigation: any;
}

export function RoomScreen({ navigation }: RoomScreenProps) {
  const { currentRoom, currentUser, leaveRoom } = useMovieStore();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    console.log('=== ROOM SCREEN DEBUG ===');
    console.log('Current room:', currentRoom);
    console.log('Current user:', currentUser);
    
    if (!currentRoom || !currentUser) {
      console.log('No room or user found, navigating to Home');
      navigation.navigate('Home');
      return;
    }
    
    console.log('Room loaded successfully:', currentRoom.inviteCode);
  }, [currentRoom, currentUser]);

  const handleStartSwiping = () => {
    navigation.navigate('Swipe');
  };

  const handleViewMatches = () => {
    navigation.navigate('Matches');
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const shareInviteCode = async () => {
    if (!currentRoom) return;
    
    setIsSharing(true);
    const message = `Join my Movie Match room! Use code: ${currentRoom.inviteCode}`;
    
    try {
      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      
      if (isAvailable) {
        // Open SMS with the room code
        await SMS.sendSMSAsync([], message);
      } else {
        // Fallback to clipboard if SMS not available
        await Clipboard.setStringAsync(currentRoom.inviteCode);
        Alert.alert('Copied!', `Room code ${currentRoom.inviteCode} copied to clipboard`);
      }
    } catch (error) {
      // Fallback to clipboard on error
      try {
        await Clipboard.setStringAsync(currentRoom.inviteCode);
        Alert.alert('Copied!', `Room code ${currentRoom.inviteCode} copied to clipboard`);
      } catch (clipboardError) {
        Alert.alert('Error', 'Unable to share room code');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (!currentRoom || !currentUser) {
    return null;
  }

  const matchCount = currentRoom.matches.length;
  const participantCount = currentRoom.participants.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-white text-2xl font-bold">Room</Text>
          <Pressable
            onPress={handleLeaveRoom}
            className="p-2"
          >
            <Ionicons name="exit-outline" size={24} color="#EF4444" />
          </Pressable>
        </View>

        {/* Room Info Card */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <View className="items-center mb-4">
            <Text className="text-gray-400 text-sm uppercase tracking-wide mb-1">
              Room Code - Tap to Share
            </Text>
            <Pressable
              onPress={shareInviteCode}
              className="flex-row items-center"
            >
              <Text className="text-white text-3xl font-mono font-bold tracking-widest">
                {currentRoom.inviteCode}
              </Text>
              <Ionicons 
                name={isSharing ? "hourglass-outline" : "chatbubble-outline"} 
                size={20} 
                color={isSharing ? "#10B981" : "#9CA3AF"} 
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{participantCount}</Text>
              <Text className="text-gray-400 text-sm">
                {participantCount === 1 ? 'Participant' : 'Participants'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-500">{matchCount}</Text>
              <Text className="text-gray-400 text-sm">
                {matchCount === 1 ? 'Match' : 'Matches'}
              </Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Participants</Text>
          {currentRoom.participants.map((participant, index) => (
            <View key={participant.id} className="flex-row items-center mb-3 last:mb-0">
              <View className="w-10 h-10 bg-red-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">{participant.name}</Text>
                {participant.id === currentUser.id && (
                  <Text className="text-gray-400 text-sm">You</Text>
                )}
              </View>
              {currentRoom.createdBy === participant.id && (
                <View className="bg-yellow-500 px-2 py-1 rounded">
                  <Text className="text-black text-xs font-medium">Host</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="flex-1 justify-end pb-6">
          {matchCount > 0 && (
            <>
              <View className="bg-green-900 border border-green-600 p-4 rounded-xl mb-4">
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text className="text-green-400 text-lg font-semibold ml-2">
                    You have {matchCount} {matchCount === 1 ? 'match' : 'matches'}!
                  </Text>
                </View>
                <Text className="text-green-300 text-center text-sm">
                  Movies everyone loved are ready to watch
                </Text>
              </View>
              
              <Pressable
                onPress={handleViewMatches}
                className="bg-green-600 p-4 rounded-xl mb-4 active:bg-green-700"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="heart" size={20} color="white" />
                  <Text className="text-white text-xl font-semibold ml-2">
                    View Matches ({matchCount})
                  </Text>
                </View>
              </Pressable>
            </>
          )}

          <Pressable
            onPress={handleStartSwiping}
            className="bg-red-600 p-4 rounded-xl active:bg-red-700"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="film" size={20} color="white" />
              <Text className="text-white text-xl font-semibold ml-2">
                {matchCount > 0 ? 'Continue Swiping' : 'Start Swiping'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}