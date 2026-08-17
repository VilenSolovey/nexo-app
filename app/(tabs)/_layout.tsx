import React from "react"
import { Tabs, Redirect } from "expo-router"
import { FullScreenState } from "@nexo/components/FullScreenState/FullScreenState"
import { AnimatedTabIcon } from "@nexo/components/TabBar/AnimatedTabIcon"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import { useAuth } from "@nexo/contexts/AuthProvider"

export default function TabsLayout() {
  const Theme = useAppTheme()
  const { status, retryProfile } = useAuth()

  if (status === "unauthenticated") {
    return <Redirect href="/(public)/register" />
  }

  if (status === "restoring" || status === "loading-profile") {
    return <FullScreenState variant="loading" />
  }

  if (status === "profile-error") {
    return (
      <FullScreenState
        variant="error"
        title="Не вдалося завантажити профіль"
        description="Перевір з’єднання та спробуй ще раз."
        actionLabel="Повторити"
        onAction={() => { void retryProfile() }}
      />
    )
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
            <AnimatedTabIcon {...props} name="home-outline" activeName="home" />
          ),
        }}
      />
     
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quizzes",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="extension-puzzle-outline" activeName="extension-puzzle" />
          ),
        }}
      />
      <Tabs.Screen
        name="chronicle"
        options={{
          title: "Хроніка",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="map-outline" activeName="map" />
          ),
        }}
      />
       <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="medal-outline" activeName="medal" />
          ),
        }}
      />
       <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: (props) => (
            <AnimatedTabIcon {...props} name="settings-outline" activeName="settings" />
          ),
        }}
      />
    </Tabs>
  )
}
