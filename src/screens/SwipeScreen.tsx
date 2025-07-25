import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useMovieStore } from '../state/movieStore';
import { Movie, Match } from '../types/movie';
import { cn } from '../utils/cn';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeScreenProps {
  navigation: any;
}

export function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { 
    currentRoom, 
    currentUser, 
    getCurrentMovie, 
    swipeMovie, 
    nextMovie, 
    checkForMatches 
  } = useMovieStore();
  
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [newMatches, setNewMatches] = useState<Match[]>([]);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!currentRoom || !currentUser) {
      navigation.navigate('Home');
      return;
    }
    
    const movie = getCurrentMovie();
    setCurrentMovie(movie);
  }, [currentRoom, currentUser]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentMovie || !currentRoom) return;

    swipeMovie(currentMovie.id, direction);
    
    // Check if this was the last movie
    const isLastMovie = currentRoom.currentMovieIndex >= currentRoom.movies.length - 1;
    
    // Check for new matches
    const matches = checkForMatches();
    if (matches.length > 0) {
      setNewMatches(matches);
      setShowMatchModal(true);
    } else if (isLastMovie) {
      // If this was the last movie and no matches, go directly to room
      setTimeout(() => {
        navigation.navigate('Room');
      }, 500); // Small delay for smooth transition
    } else {
      moveToNextMovie();
    }
  };

  const moveToNextMovie = () => {
    nextMovie();
    const nextMovieData = getCurrentMovie();
    setCurrentMovie(nextMovieData);
    
    // Reset animation values
    translateX.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    setNewMatches([]);
    
    // Check if this was the last movie
    const isLastMovie = currentRoom && currentRoom.currentMovieIndex >= currentRoom.movies.length - 1;
    
    if (isLastMovie) {
      // If this was the last movie, go to room
      navigation.navigate('Room');
    } else {
      moveToNextMovie();
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {},
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth);
        opacity.value = withSpring(0);
        runOnJS(handleSwipe)('left');
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth);
        opacity.value = withSpring(0);
        runOnJS(handleSwipe)('right');
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const rejectOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  if (!currentRoom || !currentUser) {
    return null;
  }

  if (!currentMovie) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text className="text-white text-2xl font-bold mt-4 mb-2">All Done!</Text>
        <Text className="text-gray-400 text-center mb-8 px-6">
          You have seen all available movies. Check your results in the room!
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Room')}
          className="bg-green-600 px-8 py-4 rounded-xl"
        >
          <Text className="text-white text-lg font-semibold">Back to Room</Text>
        </Pressable>
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
          {currentRoom.inviteCode}
        </Text>
        <Pressable onPress={() => navigation.navigate('Matches')}>
          <Ionicons name="heart" size={24} color="#EF4444" />
        </Pressable>
      </View>

      {/* Movie Card */}
      <View className="flex-1 items-center justify-center px-6 pt-4 pb-8">
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[animatedStyle]}
            className="w-full max-w-xs"
          >
            <View className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Movie Poster */}
              <View className="aspect-[3/4] bg-gray-700">
                <Image
                  source={{ uri: currentMovie.poster }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              {/* Movie Info */}
              <View className="p-4">
                <Text className="text-white text-xl font-bold mb-1">
                  {currentMovie.title}
                </Text>
                <Text className="text-gray-400 text-base mb-2">
                  {currentMovie.year} • {Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m
                </Text>
                
                <View className="flex-row flex-wrap mb-2">
                  {currentMovie.genres.slice(0, 2).map((genre, index) => (
                    <View key={genre} className="bg-gray-700 px-2 py-1 rounded-full mr-2 mb-1">
                      <Text className="text-gray-300 text-xs">{genre}</Text>
                    </View>
                  ))}
                </View>

                <Text className="text-gray-300 text-sm leading-5 mb-3" numberOfLines={3}>
                  {currentMovie.overview}
                </Text>

                <View className="flex-row items-center">
                  <Ionicons name="star" size={14} color="#FCD34D" />
                  <Text className="text-yellow-400 font-semibold ml-1 text-sm">
                    {currentMovie.rating}
                  </Text>
                </View>
              </View>
            </View>

            {/* Swipe Indicators */}
            <Animated.View
              style={[likeOpacity]}
              className="absolute top-6 right-6 bg-green-500 px-3 py-1 rounded-full"
            >
              <Text className="text-white font-bold text-base">LIKE</Text>
            </Animated.View>

            <Animated.View
              style={[rejectOpacity]}
              className="absolute top-6 left-6 bg-red-500 px-3 py-1 rounded-full"
            >
              <Text className="text-white font-bold text-base">PASS</Text>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-center items-center px-6 pb-8 pt-4">
        <Pressable
          onPress={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500 rounded-full items-center justify-center mr-12 active:bg-red-600 shadow-lg"
        >
          <Ionicons name="close" size={32} color="white" />
        </Pressable>

        <Pressable
          onPress={() => handleSwipe('right')}
          className="w-16 h-16 bg-green-500 rounded-full items-center justify-center active:bg-green-600 shadow-lg"
        >
          <Ionicons name="heart" size={28} color="white" />
        </Pressable>
      </View>

      {/* Match Modal */}
      {showMatchModal && newMatches.length > 0 && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center">
          <View className="bg-gray-800 rounded-3xl p-8 mx-6 max-w-sm w-full">
            <View className="items-center mb-6">
              <Ionicons name="heart" size={48} color="#EF4444" />
              <Text className="text-white text-3xl font-bold mt-4 mb-2">
                It's a Match!
              </Text>
              <Text className="text-gray-400 text-center">
                Everyone loved {newMatches[0].movie.title}
              </Text>
            </View>

            <Image
              source={{ uri: newMatches[0].movie.poster }}
              className="w-32 h-48 rounded-xl self-center mb-6"
              resizeMode="cover"
            />

            <Pressable
              onPress={handleMatchModalClose}
              className="bg-red-600 p-4 rounded-xl"
            >
              <Text className="text-white text-lg font-semibold text-center">
                Continue Swiping
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}