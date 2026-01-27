import { Text, View, StyleSheet } from "react-native"
import { Theme } from "@nexo/constants/theme"

export default function Achievements() {


  return (
    <View style={[styles.container, { backgroundColor: Theme.background }]}>
      <Text style={[styles.text, { color: Theme.text }]}>Achievements</Text>
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