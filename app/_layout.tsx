import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationBootstrap } from '@nexo/components/NotificationBootstrap';
import { AuthProvider } from '@nexo/contexts/AuthProvider';
import { AppThemeProvider } from '@nexo/contexts/AppThemeProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppThemeProvider>
          <NotificationBootstrap />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AppThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
