import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationBootstrap } from '@nexo/components/NotificationBootstrap';
import { FeedbackHost } from '@nexo/components/Feedback/FeedbackHost';
import { AuthProvider } from '@nexo/contexts/AuthProvider';
import { AppThemeProvider } from '@nexo/contexts/AppThemeProvider';
import { FeedbackProvider } from '@nexo/contexts/FeedbackProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppThemeProvider>
          <FeedbackProvider>
            <NotificationBootstrap />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(public)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <FeedbackHost />
          </FeedbackProvider>
        </AppThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
