import { Stack } from 'expo-router';
import { AuthProvider } from '@nexo/contexts/AuthProvider';
import { AppThemeProvider } from '@nexo/contexts/AppThemeProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AppThemeProvider>
    </AuthProvider>
  );
}
