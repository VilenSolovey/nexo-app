import React, { useCallback, useMemo, useState } from "react"
import { useRouter } from "expo-router"
import { UserContainer, Paragraph } from "@nexo/components/Home/HomeLayout"
import { UserHeader } from "@nexo/components/Home/UserHeader/UserHeader"
import { MiniGameOfDay } from "@nexo/components/Home/MiniGameOfDay/MiniGameOfDay"
import { ProgressOverview } from "@nexo/components/Home/ProgressOverview/ProgressOverview"
import { RecentSection } from "@nexo/components/Home/RecentSection/RecentSection"
import { TodayFocus } from "@nexo/components/Home/TodayFocus/TodayFocus"
import { Entrance } from "@nexo/components/Motion/Entrance"
import { RefreshableScreen } from "@nexo/components/RefreshableScreen"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { useAllQuizzes } from "@nexo/hooks/useAllQuizzes"
import { useHomeChronicleFocus } from "@nexo/hooks/useHomeChronicleFocus"
import { useRefreshOnReturn } from "@nexo/hooks/useRefreshOnReturn"
import { useUserQuizProgress } from "@nexo/hooks/useUserQuizProgress"
import { useUserQuizResults } from "@nexo/hooks/useUserQuizResults"
import { getAvatarSeed } from "@nexo/utils/profile-customization"
import { toCompletedQuizItems } from "@nexo/utils/quiz-history"


export default function HomeScreen() {
  const router = useRouter()
  const { userId, userProfile, refreshUserProfile } = useAuth()
  const { quizzes, loading: quizzesLoading, error: quizzesError, refetch: refetchQuizzes } = useAllQuizzes(userId)
  const {
    progressList,
    loading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useUserQuizProgress(userId)
  const {
    results,
    loading: resultsLoading,
    error: resultsError,
    refetch: refetchResults,
  } = useUserQuizResults(userId)
  const { focus: chronicleFocus, refresh: refreshChronicleFocus } = useHomeChronicleFocus(userId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const pullToRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refreshUserProfile(),
        refetchQuizzes(),
        refetchProgress(),
        refetchResults(),
        refreshChronicleFocus(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  } 
  
  const recent = useMemo(
    () => toCompletedQuizItems(quizzes, progressList, results, 3),
    [quizzes, progressList, results]
  ) 

  const loading = quizzesLoading || progressLoading || resultsLoading
  const error = quizzesError ?? progressError ?? resultsError
  const streakDays = userProfile?.streakDays ?? userProfile?.streak ?? 0
  const displayName = userProfile?.displayName ?? 'Гравець'
  const avatarSeed = getAvatarSeed(
    userProfile?.selectedAvatarId,
    displayName,
  )

  const refreshOnReturn = useCallback(
    () => Promise.all([
      refetchProgress(),
      refetchQuizzes(),
      refetchResults(),
      refreshChronicleFocus(),
    ]),
    [refreshChronicleFocus, refetchProgress, refetchQuizzes, refetchResults],
  )
  useRefreshOnReturn(refreshOnReturn)

  return (
    <>
      <RefreshableScreen
        onRefresh={pullToRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        <Entrance index={0}>
          <UserContainer>
            <UserHeader
              name={displayName}
              coins={userProfile?.coins ?? 0}
              avatarSeed={avatarSeed}
              onPressShop={() => router.push("/shop")}
            />
          </UserContainer>
        </Entrance>

        <Entrance index={1} variant="hero">
          <TodayFocus
            focus={chronicleFocus}
            onPress={() => {
              router.push({
                pathname: "/chronicle",
                params: { focusChallenge: "active" },
              } as any)
            }}
          />
        </Entrance>

        <Entrance index={2}>
          <ProgressOverview
            level={userProfile?.level ?? 1}
            exp={userProfile?.exp ?? 0}
            streakDays={streakDays}
          />
        </Entrance>

        {loading ? (
          <Paragraph>Завантажується…</Paragraph>
        ) : error ? (
          <Paragraph>Помилка: {error}</Paragraph>
        ) : (
          <Entrance index={3}>
            <RecentSection
              items={recent}
              onSeeAll={() => router.push('/history')}
            />
          </Entrance>
        )}

      </RefreshableScreen>

      <MiniGameOfDay />
    </>
  )
}
