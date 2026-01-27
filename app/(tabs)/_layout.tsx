import React from "react"
import { Tabs, Redirect, router } from "expo-router"
import { Theme } from "@nexo/constants/theme"
import { AnimatedTabIcon } from "@nexo/components/TabBar/AnimatedTabIcon"
import { useAuth } from "@nexo/contexts/AuthProvider"

export default function TabsLayout() {

  const { user, loading } = useAuth()

  if (!loading && !user) {
    router.push('/(public)/register')
  }


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.primary,
        tabBarInactiveTintColor: Theme.text + "90",
        tabBarStyle: {
          backgroundColor: Theme.background,
          borderTopColor: Theme.card,
          height: 95,
          paddingBottom: 17,
          paddingTop: 10,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: "absolute",
          shadowColor: Theme.primary,
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: Theme.text,
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
     
      <Tabs.Screen name="shop" options={{ href: null }} />
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