import { Text, View, StyleSheet, useColorScheme, TouchableOpacity } from "react-native"
import { Theme } from "@nexo/constants/theme"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { useRouter } from "expo-router"

export default function Settings() {

  const { signOut, user } = useAuth()
  const router = useRouter()

  async function logout() {
    try {
      await signOut()
      router.replace('/(public)/login')
    } catch (e: any) {
      // Optionally surface error with toast component later
      console.warn('Failed to sign out', e.message)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: Theme.background }]}>
      <Text style={[styles.text, { color: Theme.text }]}>Settings</Text>
      {user ? (
        <TouchableOpacity
          onPress={logout}
          style={{
            marginTop: 24,
            backgroundColor: Theme.card,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Theme.primary,
          }}
        >
          <Text style={{ fontWeight: '700', color: Theme.text }}>Вийти з акаунту</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 22,
    fontWeight: "600",
  },
})