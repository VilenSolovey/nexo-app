import React from "react"
import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "@nexo/constants/theme"
import { AnimatedTabIcon } from "@nexo/TabBar/AnimatedTabIcon"

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? "light"
  const theme = Colors[colorScheme]

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text + "90",
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.card,
          height: 95,
          paddingBottom: 17,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: "absolute",
          shadowColor: theme.primary,
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="home-outline" />
          ),
        }}
      />
    <Tabs.Screen
        name="quiz"
        options={{
          title: "Quizzes",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="extension-puzzle-outline" />
          ),
        }}
      />
       <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="medal-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="settings-outline" />
          ),
        }}
      />
    </Tabs>
  )
}