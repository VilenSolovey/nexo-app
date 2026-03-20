import React, { useMemo, useState } from "react"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { UserContainer, Paragraph } from "@nexo/components/Home/HomeLayout"
import { Banner } from "@nexo/components/Home/Banner/Banner"
import { LevelProgressCard } from "@nexo/components/Home/LevelProgressCard/LevelProgressCard"
import { UserHeader } from "@nexo/components/Home/UserHeader/UserHeader"
import { StreakCard } from "@nexo/components/Home/StreakCard/StreakCard"
import { NewsSection } from "@nexo/components/Home/NewSection/NewsSection"
import { RecentSection } from "@nexo/components/Home/RecentSection/RecentSection"
import { RefreshableScreen } from "@nexo/components/RefreshableScreen"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { useAllQuizzes } from "@nexo/hooks/useAllQuizzes"
import { useUserQuizProgress } from "@nexo/hooks/useUserQuizProgress"
import { registerDailyActivity } from "@nexo/services/user.service"
import type { NewsItem, RecentItem } from "@nexo/types/quiz.types"
import type { UserQuizProgress } from "@nexo/types/result.types"
import { getAvatarSeed } from "@nexo/utils/profile-customization"
import { isQuizRecent, toMillis } from "@nexo/utils/quiz-progress"

function joinRecentQuizzes(
  quizzes: NewsItem[],
  progressList: UserQuizProgress[]
): RecentItem[] {
  const progressIndex = new Map(progressList.map(progress => [progress.quizId, progress]))

  return quizzes
    .filter((quiz) => isQuizRecent({
      progress: progressIndex.get(quiz.id),
      createdAt: quiz.createdAt,
    }))
    .sort((a, b) => {
      const aProgress = progressIndex.get(a.id)
      const bProgress = progressIndex.get(b.id)
      const aTime = toMillis(aProgress?.lastPlayedAt) ?? toMillis(a.createdAt) ?? 0
      const bTime = toMillis(bProgress?.lastPlayedAt) ?? toMillis(b.createdAt) ?? 0
      return bTime - aTime
    })
    .slice(0, 3)
    .map((quiz) => {
      const progress = progressIndex.get(quiz.id)
      const completedAtMs = toMillis(progress?.lastPlayedAt) ?? toMillis(quiz.createdAt) ?? Date.now()

      return {
        ...quiz,
        completedAt: Math.floor(completedAtMs / 1000),
        score: progress?.officialScore ?? progress?.bestScore ?? 0,
        total: quiz.questionsCount,
      }
    })
    .filter((item): item is RecentItem => item !== null)
}


export default function HomeScreen() {
  const router = useRouter()
  const { userProfile, loading: authLoading, refreshUserProfile } = useAuth()
  const userId = userProfile?.uid ?? userProfile?.id
  const { quizzes, loading: quizzesLoading, error, refetch: refetchQuizzes } = useAllQuizzes()
  const { progressList, progressMap, loading: progressLoading, refetch: refetchProgress } = useUserQuizProgress(userId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const pullToRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchQuizzes?.(),
        refetchProgress?.(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  } 
  
  const news = useMemo(
    () => quizzes
      .filter((quiz) => !isQuizRecent({
        progress: progressMap.get(quiz.id),
        createdAt: quiz.createdAt,
      }))
      .slice(0, 5),
    [progressMap, quizzes]
  )

  const recent = useMemo(
    () => joinRecentQuizzes(quizzes, progressList),
    [quizzes, progressList]
  ) 

  const loading = authLoading || quizzesLoading || progressLoading
  const streakDays = userProfile?.streakDays ?? userProfile?.streak ?? 0
  const avatarSeed = getAvatarSeed(
    userProfile?.selectedAvatarId,
    userProfile?.displayName ?? userProfile?.email ?? "Guest",
  )

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false

      const syncDailyProgress = async () => {
        if (userId) {
          try {
            const result = await registerDailyActivity(userId)
            if (result.changed && !cancelled) {
              await refreshUserProfile()
            }
          } catch (error) {
            console.error("Failed to register daily activity:", error)
          }
        }

        refetchProgress()
        refetchQuizzes()
      }

      syncDailyProgress()

      return () => {
        cancelled = true
      }
    }, [refreshUserProfile, refetchProgress, refetchQuizzes, userId]),
  )

  return (
    <RefreshableScreen
      onRefresh={pullToRefresh}
      refreshing={isRefreshing}
      contentContainerStyle={{ paddingBottom: 180 }}
    >
      <UserContainer>
        <UserHeader
          name={userProfile?.displayName ?? "Guest"}
          coins={userProfile?.coins ?? 0}
          level={userProfile?.level ?? 1}
          avatarSeed={avatarSeed}
        />
      </UserContainer>

      <LevelProgressCard
        level={userProfile?.level ?? 1}
        exp={userProfile?.exp ?? 0}
      />

      <Banner />

      <StreakCard streakDays={streakDays} />

      <NewsSection
        items={news}
        onSeeAll={() => {
          Haptics.selectionAsync()
          router.push("/quiz")
        }}
        onPressItem={() => {
          Haptics.selectionAsync()
        }}
      />

      {loading ? (
        <Paragraph>Завантажується…</Paragraph>
      ) : error ? (
        <Paragraph>Помилка: {error}</Paragraph>
      ) : (
        <RecentSection
          items={recent}
          onSeeAll={() => {
            Haptics.selectionAsync()
            router.push("/quiz")
          }}
          onPressItem={() => {
            Haptics.selectionAsync()
          }}
        />
      )}
    </RefreshableScreen>
  )
}
