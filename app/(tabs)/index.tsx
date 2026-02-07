import React, { useMemo, useState } from "react"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { UserContainer, Paragraph } from "@nexo/components/Home/HomeLayout"
import { Banner } from "@nexo/components/Home/Banner/Banner"
import { UserHeader } from "@nexo/components/Home/UserHeader/UserHeader"
import { StreakCard } from "@nexo/components/Home/StreakCard/StreakCard"
import { NewsSection } from "@nexo/components/Home/NewSection/NewsSection"
import { RecentSection } from "@nexo/components/Home/RecentSection/RecentSection"
import { RefreshableScreen } from "@nexo/components/RefreshableScreen"
import { useAuth } from "@nexo/contexts/AuthProvider"
import { useAllQuizzes } from "@nexo/hooks/useAllQuizzes"
import { useRecentResults } from "@nexo/hooks/useRecentResults"
import type { NewsItem, RecentItem } from "@nexo/types/quiz.types"
import type { QuizResult } from "@nexo/types/result.types"

function joinRecentQuizzes(
  quizzes: NewsItem[],
  results: QuizResult[]
): RecentItem[] {
  const quizIndex = new Map(quizzes.map(q => [q.id, q]))

  return results
    .map(r => {
      const quiz = quizIndex.get(r.quizId)
      if (!quiz) {
        return null
      }

      const completedAt = typeof r.completedAt === 'object' && 'seconds' in r.completedAt
        ? r.completedAt.seconds
        : typeof r.completedAt === 'number'
        ? r.completedAt
        : Date.now() / 1000

      return {
        ...quiz,
        completedAt,
        score: r.score,
        total: r.total,
      }
    })
    .filter((item): item is RecentItem => item !== null)
}


export default function HomeScreen() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const { quizzes, loading: quizzesLoading, error, refetch: refetchQuizzes } = useAllQuizzes()
  const { results, loading: resultsLoading, refetch: refetchResults } = useRecentResults(userProfile?.id)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const pullToRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchQuizzes?.(),
        refetchResults?.(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  } 
  
  const completedQuizIds = useMemo(
  () => new Set(results.map(r => r.quizId)),
  [results]
  )

  const availableQuizzes = useMemo(
  () => quizzes.filter(q => !completedQuizIds.has(q.id)),
  [quizzes, completedQuizIds]
  )

  const news = useMemo(
  () => availableQuizzes.slice(0, 5),
  [availableQuizzes]
)

  const recent = useMemo(
    () => joinRecentQuizzes(quizzes, results),
    [quizzes, results]
  ) 

  const loading = authLoading || quizzesLoading || resultsLoading
  const streakDays = userProfile?.streakDays ?? userProfile?.streak ?? 0

  return (
    <RefreshableScreen onRefresh={pullToRefresh} refreshing={isRefreshing}>
      <UserContainer>
        <UserHeader
          name={userProfile?.displayName ?? "Guest"}
          coins={userProfile?.coins ?? 0}
          level={userProfile?.level ?? 1}
        />
      </UserContainer>

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