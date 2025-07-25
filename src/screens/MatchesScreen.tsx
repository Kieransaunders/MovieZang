import React from 'react';
import { View, Text, Pressable, Image, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '../state/movieStore';
import { StreamingPlatform } from '../types/movie';

interface MatchesScreenProps {
  navigation: any;
}

export function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { currentRoom, currentUser } = useMovieStore();

  const handleStreamingPress = (platform: StreamingPlatform) => {
    if (platform.link) {
      Linking.openURL(platform.link);
    }
  };

  if (!currentRoom || !currentUser) {
    navigation.navigate('Home');
    return null;
  }

  const matches = currentRoom.matches;

  if (matches.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-semibold">Matches</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={64} color="#6B7280" />
          <Text className="text-white text-2xl font-bold mt-4 mb-2">No Matches Yet</Text>
          <Text className="text-gray-400 text-center mb-8">
            Keep swiping to find movies everyone loves!
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Swipe')}
            className="bg-red-600 px-8 py-4 rounded-xl"
          >
            <Text className="text-white text-lg font-semibold">Start Swiping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-semibold">
          Matches ({matches.length})
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {matches.map((match, index) => (
            <View key={match.movie.id} className="bg-gray-800 rounded-2xl mb-6 overflow-hidden">
              {/* Movie Header */}
              <View className="flex-row p-6">
                <Image
                  source={{ uri: match.movie.poster }}
                  className="w-24 h-36 rounded-xl"
                  resizeMode="cover"
                />
                
                <View className="flex-1 ml-4">
                  <Text className="text-white text-xl font-bold mb-2">
                    {match.movie.title}
                  </Text>
                  <Text className="text-gray-400 text-base mb-2">
                    {match.movie.year} • {Math.floor(match.movie.runtime / 60)}h {match.movie.runtime % 60}m
                  </Text>
                  
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="star" size={16} color="#FCD34D" />
                    <Text className="text-yellow-400 font-semibold ml-1 mr-4">
                      {match.movie.rating}
                    </Text>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                    <Text className="text-red-400 font-semibold ml-1">
                      {match.participants.length} {match.participants.length === 1 ? 'vote' : 'votes'}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap">
                    {match.movie.genres.slice(0, 2).map((genre) => (
                      <View key={genre} className="bg-gray-700 px-2 py-1 rounded mr-2 mb-1">
                        <Text className="text-gray-300 text-xs">{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Movie Overview */}
              <View className="px-6 pb-4">
                <Text className="text-gray-300 text-sm leading-5">
                  {match.movie.overview}
                </Text>
              </View>

              {/* Streaming Platforms */}
              <View className="px-6 pb-6">
                <Text className="text-white font-semibold mb-3">Watch On:</Text>
                <View className="flex-row flex-wrap">
                  {match.movie.streamingInfo.map((platform, platformIndex) => (
                    <Pressable
                      key={platformIndex}
                      onPress={() => handleStreamingPress(platform)}
                      className="bg-blue-600 px-4 py-2 rounded-lg mr-3 mb-2 active:bg-blue-700"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-white font-medium">{platform.service}</Text>
                        {platform.price && (
                          <Text className="text-blue-200 text-sm ml-2">
                            ({platform.price})
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Match Date */}
              <View className="bg-gray-700 px-6 py-3">
                <Text className="text-gray-400 text-sm">
                  Matched on {new Date(match.matchedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-6">
        <Pressable
          onPress={() => navigation.navigate('Swipe')}
          className="bg-red-600 p-4 rounded-xl"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="film" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Keep Swiping
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}