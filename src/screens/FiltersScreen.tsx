import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieFilters } from '../types/movie';
import { cn } from '../utils/cn';

interface FiltersScreenProps {
  navigation: any;
  route: {
    params: {
      initialFilters: MovieFilters;
      onApplyFilters: (filters: MovieFilters) => void;
    };
  };
}

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];

const STREAMING_SERVICES = [
  'Netflix', 'Amazon Prime', 'Disney+', 'Hulu', 'HBO Max', 
  'Apple TV+', 'Paramount+', 'Peacock', 'YouTube TV'
];

const RATING_OPTIONS = [
  { label: 'Any Rating', value: 0 },
  { label: '6.0+', value: 6.0 },
  { label: '7.0+', value: 7.0 },
  { label: '8.0+', value: 8.0 },
  { label: '9.0+', value: 9.0 },
];

export function FiltersScreen({ navigation, route }: FiltersScreenProps) {
  const { initialFilters, onApplyFilters } = route.params;
  const [filters, setFilters] = useState<MovieFilters>(initialFilters);

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleService = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const setMinRating = (rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    navigation.goBack();
  };

  const handleReset = () => {
    const resetFilters: MovieFilters = {
      genres: [],
      services: [],
      minRating: 0,
      region: 'US'
    };
    setFilters(resetFilters);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-semibold">Filters</Text>
        <Pressable onPress={handleReset}>
          <Text className="text-red-500 font-medium">Reset</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Genres Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Genres</Text>
            <View className="flex-row flex-wrap">
              {AVAILABLE_GENRES.map((genre) => (
                <Pressable
                  key={genre}
                  onPress={() => toggleGenre(genre)}
                  className={cn(
                    "px-4 py-2 rounded-full mr-3 mb-3",
                    filters.genres.includes(genre)
                      ? "bg-red-600"
                      : "bg-gray-700"
                  )}
                >
                  <Text className={cn(
                    "font-medium",
                    filters.genres.includes(genre)
                      ? "text-white"
                      : "text-gray-300"
                  )}>
                    {genre}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Streaming Services Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Streaming Services</Text>
            <View className="flex-row flex-wrap">
              {STREAMING_SERVICES.map((service) => (
                <Pressable
                  key={service}
                  onPress={() => toggleService(service)}
                  className={cn(
                    "px-4 py-2 rounded-full mr-3 mb-3",
                    filters.services.includes(service)
                      ? "bg-blue-600"
                      : "bg-gray-700"
                  )}
                >
                  <Text className={cn(
                    "font-medium",
                    filters.services.includes(service)
                      ? "text-white"
                      : "text-gray-300"
                  )}>
                    {service}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Minimum Rating Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Minimum Rating</Text>
            <View className="flex-row flex-wrap">
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setMinRating(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-full mr-3 mb-3",
                    filters.minRating === option.value
                      ? "bg-yellow-600"
                      : "bg-gray-700"
                  )}
                >
                  <Text className={cn(
                    "font-medium",
                    filters.minRating === option.value
                      ? "text-white"
                      : "text-gray-300"
                  )}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-6">
        <Pressable
          onPress={handleApply}
          className="bg-red-600 p-4 rounded-xl"
        >
          <Text className="text-white text-lg font-semibold text-center">
            Apply Filters
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}