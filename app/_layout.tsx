// app/_layout.js
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function Layout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'DapDap Events',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(filters)" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </PaperProvider>
  );
}





