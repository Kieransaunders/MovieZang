import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RoomScreen } from '../screens/RoomScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { FiltersScreen } from '../screens/FiltersScreen';
import { MovieFilters } from '../types/movie';

export type RootStackParamList = {
  Home: undefined;
  Room: undefined;
  Swipe: undefined;
  Matches: undefined;
  Filters: {
    initialFilters: MovieFilters;
    onApplyFilters: (filters: MovieFilters) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen 
          name="Filters" 
          component={FiltersScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}