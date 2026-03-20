import React, { useEffect, useMemo, useState } from "react"
import { Alert } from "react-native"
import { SHOP_ITEMS } from "@nexo/constants/shop"
import { ALL_THEME_OPTIONS, DEFAULT_THEME_ID, DEFAULT_THEME_OPTION } from "@nexo/constants/themes"
import { RefreshableScreen } from "@nexo/components/RefreshableScreen"
import { AccountSection } from "@nexo/components/Settings/AccountSection"
import { CosmeticsSection } from "@nexo/components/Settings/CosmeticsSection"
import { ProfileSection } from "@nexo/components/Settings/ProfileSection"
import { SettingsHero } from "@nexo/components/Settings/SettingsHero"
import { ScreenContent } from "@nexo/components/Settings/Settings.styled"
import { StatsSection } from "@nexo/components/Settings/StatsSection"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { useRouter } from "expo-router"
import { useAchievements } from "@nexo/hooks/useAchievements"
import { useUserQuizProgress } from "@nexo/hooks/useUserQuizProgress"
import { updateUser } from "@nexo/services/user.service"
import {
  DEFAULT_AVATAR_ID,
  getAvatarSeed,
  getThemePreview,
} from "@nexo/utils/profile-customization"

export default function Settings() {
  const { signOut, user, userProfile, refreshUserProfile } = useAuth()
  const router = useRouter()
  const userId = userProfile?.uid ?? userProfile?.id
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? "")
  const [isSavingName, setIsSavingName] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [savingSelection, setSavingSelection] = useState<"theme" | "avatar" | null>(null)
  const { summary, loading: achievementsLoading, refetch: refetchAchievements } = useAchievements(
    userId,
    userProfile,
  )
  const { progressList, loading: progressLoading, refetch: refetchProgress } = useUserQuizProgress(
    userId,
  )

  useEffect(() => {
    setDisplayName(userProfile?.displayName ?? "")
  }, [userProfile?.displayName])

  const inventory = useMemo(() => userProfile?.inventory ?? [], [userProfile?.inventory])
  const selectedThemeId = userProfile?.selectedThemeId ?? DEFAULT_THEME_ID
  const selectedAvatarId = userProfile?.selectedAvatarId ?? DEFAULT_AVATAR_ID
  const heroTheme = getThemePreview(selectedThemeId)
  const resolvedEmail = userProfile?.email || user?.email || "Пошта недоступна"
  const avatarFallback = userProfile?.displayName ?? resolvedEmail ?? "Guest"
  const avatarSeed = getAvatarSeed(selectedAvatarId, avatarFallback)

  const ownedThemes = useMemo(
    () =>
      ALL_THEME_OPTIONS.filter(
        (item) => item.id === DEFAULT_THEME_OPTION.id || inventory.includes(item.id),
      ),
    [inventory],
  )

  const ownedAvatars = useMemo(() => {
    const purchased = SHOP_ITEMS.filter(
      (item) => item.category === "avatar" && inventory.includes(item.id),
    )

    return [
      {
        id: DEFAULT_AVATAR_ID,
        name: "Базовий",
        description: "Автогенерований аватар за вашим профілем",
        icon: "person-outline",
      },
      ...purchased,
    ]
  }, [inventory])

  const unlockedCosmeticsCount =
    Math.max(0, ownedThemes.length - 1) + Math.max(0, ownedAvatars.length - 1)
  const streakDays = userProfile?.streakDays ?? userProfile?.streak ?? 0
  const longestStreak = userProfile?.longestStreak ?? streakDays
  const achievementsCount = achievementsLoading ? "..." : String(summary.unlockedTiers)
  const quizzesCount = progressLoading ? "..." : String(progressList.length)
  const statsRefreshing = achievementsLoading || progressLoading

  async function handleRefresh() {
    try {
      setIsRefreshing(true)
      await Promise.all([refreshUserProfile(), refetchAchievements(), refetchProgress()])
    } finally {
      setIsRefreshing(false)
    }
  }

  async function logout() {
    try {
      await signOut()
      router.replace("/(public)/login")
    } catch (e: any) {
      console.warn("Failed to sign out", e.message)
    }
  }

  async function saveDisplayName() {
    const trimmed = displayName.trim()

    if (!userId) return

    if (!trimmed) {
      Alert.alert("Ім'я порожнє", "Введіть ім'я, яке буде відображатися у профілі.")
      return
    }

    if (trimmed === userProfile?.displayName) {
      return
    }

    try {
      setIsSavingName(true)
      await updateUser(userId, { displayName: trimmed })
      await refreshUserProfile()
      Alert.alert("Профіль оновлено", "Ім'я збережено.")
    } catch (error: any) {
      Alert.alert("Помилка", error?.message ?? "Не вдалося зберегти ім'я.")
    } finally {
      setIsSavingName(false)
    }
  }

  async function updateCosmeticSelection(type: "theme" | "avatar", value: string | null) {
    if (!userId) return

    try {
      setSavingSelection(type)
      await updateUser(
        userId,
        type === "theme" ? { selectedThemeId: value } : { selectedAvatarId: value },
      )
      await refreshUserProfile()
    } catch (error: any) {
      Alert.alert("Помилка", error?.message ?? "Не вдалося оновити косметику.")
    } finally {
      setSavingSelection(null)
    }
  }

  return (
    <RefreshableScreen onRefresh={handleRefresh} refreshing={isRefreshing}>
      <ScreenContent>
        <SettingsHero
          avatarSeed={avatarSeed}
          displayName={userProfile?.displayName ?? "Гравець"}
          email={resolvedEmail}
          heroTheme={heroTheme}
          level={userProfile?.level ?? 1}
          coins={userProfile?.coins ?? 0}
          streakDays={streakDays}
          selectedAvatarId={selectedAvatarId}
        />

        <ProfileSection
          displayName={displayName}
          email={resolvedEmail}
          isSavingName={isSavingName}
          onChangeDisplayName={setDisplayName}
          onSaveDisplayName={saveDisplayName}
        />

        <CosmeticsSection
          avatarFallback={avatarFallback}
          ownedThemes={ownedThemes}
          ownedAvatars={ownedAvatars}
          selectedThemeId={selectedThemeId}
          selectedAvatarId={selectedAvatarId}
          savingSelection={savingSelection}
          unlockedCosmeticsCount={unlockedCosmeticsCount}
          onSelectTheme={(value) =>
            updateCosmeticSelection("theme", value === DEFAULT_THEME_ID ? null : value)
          }
          onSelectAvatar={(value) => updateCosmeticSelection("avatar", value)}
        />

        <StatsSection
          quizzesCount={quizzesCount}
          longestStreak={longestStreak}
          achievementsCount={achievementsCount}
          achievementsTotal={summary.totalTiers}
          unlockedCosmeticsCount={unlockedCosmeticsCount}
          isRefreshing={statsRefreshing}
          isAchievementsLoading={achievementsLoading}
        />

        <AccountSection
          canLogout={Boolean(user)}
          onOpenShop={() => router.push("/shop")}
          onLogout={logout}
        />
      </ScreenContent>
    </RefreshableScreen>
  )
}
