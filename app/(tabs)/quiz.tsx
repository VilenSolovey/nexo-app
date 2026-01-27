import { Text, View, StyleSheet, useColorScheme } from "react-native"
import { Theme } from "@nexo/constants/theme"

export default function Quiz() {

  return (
    <View style={[styles.container, { backgroundColor: Theme.background }]}>
      <Text style={[styles.text, { color: Theme.text }]}>Quizzes</Text>
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