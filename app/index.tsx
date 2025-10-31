import React, { useEffect, useMemo, useState } from "react"
import * as Haptics from "expo-haptics"
import {
  HomeContainer,
  UserContainer,
  Paragraph,
} from "@nexo/styles/home.styled"
import { getAllQuizzes } from "@nexo/services/quiz.service"
import { useUser} from "@nexo/hooks/useUser"
import { Banner } from "@nexo/components/Home/Banner/Banner"
import { useRouter } from "expo-router"
import { UserHeader } from "@nexo/components/Home/UserHeader/UserHeader"
import { StreakCard } from "@nexo/components/Home/StreakCard/StreakCard"
import { NewsSection } from "@nexo/components/Home/NewSection/NewsSection"
import { RecentSection } from "@nexo/components/Home/RecentSection/RecentSection"
import type { Quiz } from "@nexo/types/quiz.types"

type QuizItem = Quiz

export default function HomeScreen() {
  const router = useRouter()
  // TODO: Replace with actual user ID from auth context
  const USER_ID = "demo-user"
  const { user, loading: userLoading } = useUser(USER_ID)

  const [query, setQuery] = useState<string>("")
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const rows = await getAllQuizzes()
        if (!mounted) return
        const normalized: QuizItem[] = rows.map((r: any) => ({
          id: String(r.id),
          title: String(r.title ?? "Untitled"),
          category: String(r.type ?? r.category ?? "other"),
          questions: Array.isArray(r.questions) ? r.questions.length : Number(r.questions ?? 0),
          reward: typeof r.reward === "number" ? r.reward : Number(r.reward ?? 0),
          description: typeof r.description === "string" ? r.description : undefined,
        }))
        setQuizzes(normalized)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message ?? "Failed to load quizzes")
      } finally {
        mounted && setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return quizzes
    return quizzes.filter((x) => x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q))
  }, [quizzes, query])

  const news = useMemo(() => filtered.slice(0, 5), [filtered])

  const recent = useMemo(() => {
    if (!user) return [] as QuizItem[]
    const index = new Map<string, QuizItem>(quizzes.map((q) => [q.id, q]))
    const joined = user.completedQuizzes
      .map((c) => {
        const q = index.get(c.quizId)
        if (!q) return null
        return { ...q, status: "Completed" as const, completedAt: c.completedAt as number }
      })
      .filter(Boolean) as (QuizItem & { completedAt: number })[]
    joined.sort((a, b) => b.completedAt - a.completedAt)
    return joined.slice(0, 3)
  }, [user, quizzes])

  const streakDays = user?.streakDays ?? 0
 

  return (
    <HomeContainer>

      <UserContainer>
        <UserHeader name={user?.name ?? "Guest"} coins={user?.coins ?? 0} level={user?.level} />
      </UserContainer>

      <Banner />

      <StreakCard streakDays={streakDays} />

      <NewsSection
        items={news}
        onSeeAll={() => {
          Haptics.selectionAsync()
          router.push("/quiz")
        }}
        onPressItem={(id) => {
          Haptics.selectionAsync()
        }}
      />

      {loading || userLoading ? (
        <Paragraph style={{ alignSelf: "flex-start" }}>Завантажується…</Paragraph>
      ) : error ? (
        <Paragraph style={{ alignSelf: "flex-start" }}>Помилка: {error}</Paragraph>
      ) : (
        <RecentSection
          items={recent}
          onSeeAll={() => {
            Haptics.selectionAsync()
            router.push("/quiz")
          }}
          onPressItem={(id) => {
            Haptics.selectionAsync()
          }}
        />
      )}

    </HomeContainer>
  )
}