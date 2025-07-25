import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useMovieStore } from '../state/movieStore';
import { MovieFilters } from '../types/movie';
import { getStoredRooms, StoredRoom } from '../utils/roomStorage';
import { cn } from '../utils/cn';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [userName, setUserName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<StoredRoom[]>([]);
  const [showAvailableRooms, setShowAvailableRooms] = useState(false);
  const [filters, setFilters] = useState<MovieFilters>({
    genres: [],
    services: [],
    minRating: 0,
    region: 'US'
  });
  
  const { createRoom, joinRoom } = useMovieStore();

  useEffect(() => {
    loadAvailableRooms();
  }, []);

  const loadAvailableRooms = async () => {
    const rooms = await getStoredRooms();
    setAvailableRooms(rooms);
  };

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsCreating(true);
    try {
      const code = await createRoom(userName.trim(), filters);
      
      Alert.alert(
        'Room Created!',
        `Share this code with friends: ${code}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Room') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter the room code');
      return;
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    
    // Validate room code format
    if (cleanCode.length !== 6) {
      Alert.alert('Error', 'Room code must be 6 characters long');
      return;
    }

    console.log('=== HOME SCREEN DEBUG ===');
    console.log('Joining room with code:', cleanCode);
    console.log('User name:', userName.trim());

    setIsJoining(true);
    try {
      const success = await joinRoom(cleanCode, userName.trim());
      console.log('Join room result:', success);
      
      if (success) {
        console.log('Navigating to Room screen');
        navigation.navigate('Room');
      } else {
        console.log('Join room failed');
        Alert.alert('Error', 'Failed to join room. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Join room error:', error);
      Alert.alert('Error', `Failed to join room: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleFiltersPress = () => {
    navigation.navigate('Filters', {
      initialFilters: filters,
      onApplyFilters: setFilters
    });
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filters.genres.length > 0) {
      parts.push(`${filters.genres.length} genre${filters.genres.length > 1 ? 's' : ''}`);
    }
    if (filters.services.length > 0) {
      parts.push(`${filters.services.length} service${filters.services.length > 1 ? 's' : ''}`);
    }
    if (filters.minRating > 0) {
      parts.push(`${filters.minRating}+ rating`);
    }
    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  };

  const handleQuickJoin = (roomCode: string) => {
    setInviteCode(roomCode);
    setShowAvailableRooms(false);
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        // First try to find a 6-character alphanumeric code
        const codeMatch = clipboardContent.match(/\b[A-Z0-9]{6}\b/i);
        if (codeMatch) {
          setInviteCode(codeMatch[0].toUpperCase());
        } else {
          // Look for any sequence of 6 characters that could be a code
          const anyCodeMatch = clipboardContent.match(/[A-Z0-9]{6}/i);
          if (anyCodeMatch) {
            setInviteCode(anyCodeMatch[0].toUpperCase());
          } else {
            // If no valid code found, clean and format the text
            const cleanedText = clipboardContent.replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase();
            if (cleanedText.length >= 3) {
              setInviteCode(cleanedText);
            } else {
              Alert.alert('No Code Found', 'Could not find a valid room code in the clipboard');
            }
          }
        }
      } else {
        Alert.alert('Clipboard Empty', 'No text found in clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to paste from clipboard');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center min-h-screen">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-red-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="film" size={32} color="white" />
          </View>
          <Text className="text-4xl font-bold text-white mb-2">Movie Match</Text>
          <Text className="text-gray-400 text-center text-lg">
            Swipe together, watch together
          </Text>
        </View>

        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-white text-lg mb-3 font-medium">Your Name</Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-xl text-lg"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
          />
        </View>

        {/* Movie Filters */}
        <Pressable
          onPress={handleFiltersPress}
          className="bg-gray-800 p-4 rounded-xl mb-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-medium mb-1">Movie Preferences</Text>
              <Text className="text-gray-400 text-sm">{getFilterSummary()}</Text>
            </View>
            <Ionicons name="options-outline" size={20} color="#9CA3AF" />
          </View>
        </Pressable>

        {/* Create Room Button */}
        <Pressable
          onPress={handleCreateRoom}
          disabled={isCreating}
          className={cn(
            "bg-red-600 p-4 rounded-xl mb-4",
            "active:bg-red-700",
            isCreating && "opacity-50"
          )}
        >
          <Text className="text-white text-xl font-semibold text-center">
            {isCreating ? 'Creating Room...' : 'Create New Room'}
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-700" />
          <Text className="text-gray-400 mx-4">OR</Text>
          <View className="flex-1 h-px bg-gray-700" />
        </View>

        {/* Join Room Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-lg font-medium">Room Code</Text>
            {availableRooms.length > 0 && (
              <Pressable
                onPress={() => setShowAvailableRooms(!showAvailableRooms)}
                className="flex-row items-center"
              >
                <Text className="text-blue-400 text-sm mr-1">Available rooms</Text>
                <Ionicons 
                  name={showAvailableRooms ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#60A5FA" 
                />
              </Pressable>
            )}
          </View>
          <Text className="text-gray-400 text-sm mb-3">
            Long press to paste or use the paste button
          </Text>
          
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: 16,
                paddingRight: 48,
                borderRadius: 12,
                fontSize: 18,
                letterSpacing: 4,
                fontFamily: 'System',
              }}
              placeholder="ABCD12"
              placeholderTextColor="#9CA3AF"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
              maxLength={6}
              keyboardType="default"
              returnKeyType="done"
              enablesReturnKeyAutomatically={true}
              contextMenuHidden={false}
              selectTextOnFocus={true}
              clearButtonMode="while-editing"
              spellCheck={false}
              multiline={false}
              editable={true}
              caretHidden={false}
            />
            <Pressable
              onPress={handlePaste}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: [{ translateY: -10 }],
                padding: 4,
              }}
            >
              <Ionicons name="clipboard-outline" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Available Rooms List */}
          {showAvailableRooms && availableRooms.length > 0 && (
            <View className="mt-3 bg-gray-800 rounded-xl p-3">
              <Text className="text-gray-400 text-sm mb-2">Tap to join:</Text>
              {availableRooms.map((room) => (
                <Pressable
                  key={room.id}
                  onPress={() => handleQuickJoin(room.inviteCode)}
                  className="flex-row items-center justify-between py-2 px-3 rounded-lg mb-1 last:mb-0 active:bg-gray-700"
                >
                  <View>
                    <Text className="text-white font-mono text-lg tracking-widest">
                      {room.inviteCode}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {new Date(room.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleJoinRoom}
          disabled={isJoining}
          className={cn(
            "bg-gray-700 p-4 rounded-xl",
            "active:bg-gray-600",
            isJoining && "opacity-50"
          )}
        >
          <Text className="text-white text-xl font-semibold text-center">
            {isJoining ? 'Joining...' : 'Join Room'}
          </Text>
        </Pressable>

        {/* Footer */}
        <View className="mt-12 items-center">
          <Text className="text-gray-500 text-sm">
            Create a room to start matching movies with friends
          </Text>
        </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}