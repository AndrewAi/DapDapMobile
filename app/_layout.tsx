// app/_layout.js
import { Tabs, Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <PaperProvider>
          <Stack>
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="event/[id]" 
              options={{ presentation: 'card', headerShown: false }} 
            />
            <Stack.Screen 
              name="login" 
              options={{ presentation: 'modal', headerShown: false }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ presentation: 'modal', headerShown: false }} 
            />
          </Stack>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}





