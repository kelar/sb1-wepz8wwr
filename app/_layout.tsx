import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  // Initialize framework - required for proper functionality
  useFrameworkReady();
  const { session, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {!session ? (
            // Not authenticated, show auth screens
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          ) : (
            // Authenticated, show main app
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          )}
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});