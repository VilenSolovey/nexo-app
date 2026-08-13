import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NestorDialog } from '@nexo/components/Chronicle/NestorDialog'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import {
  getChronicleReconstructionById,
  getUserReconstructionProgressList,
} from '@nexo/services/chronicle.service'
import {
  completeChronicleReconstruction,
  type ChronicleProgressionOutcome,
} from '@nexo/services/chronicle-quiz.service'
import type {
  ChronicleReconstruction,
  ChronicleReconstructionStage,
} from '@nexo/types/chronicle.types'
import { formatChronicleDiscoveryReadyAt } from '@nexo/utils/chronicle-route'
import { getNestorDialogue } from '@nexo/utils/nestor-dialogue'

type AnswerValue = string[] | Record<string, string>

function asParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function sameItems(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function sameSet(left: string[], right: string[]) {
  return left.length === right.length && left.every((item) => right.includes(item))
}

export default function ChronicleReconstructionScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const { userId } = useAuth()
  const { showToast } = useFeedback()
  const params = useLocalSearchParams<{
    reconstructionId?: string | string[]
    chapterId?: string | string[]
  }>()
  const reconstructionId = asParam(params.reconstructionId)
  const chapterId = asParam(params.chapterId)

  const [reconstruction, setReconstruction] = useState<ChronicleReconstruction | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [introVisible, setIntroVisible] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [stageSolved, setStageSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [sequence, setSequence] = useState<string[]>([])
  const [connections, setConnections] = useState<Record<string, string>>({})
  const [evidence, setEvidence] = useState<string[]>([])
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [completionOutcome, setCompletionOutcome] = useState<ChronicleProgressionOutcome | null>(null)
  const [completionDialogVisible, setCompletionDialogVisible] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      if (!reconstructionId) {
        setError('Не вказано реконструкцію.')
        setLoading(false)
        return
      }

      try {
        const [nextReconstruction, progressRows] = await Promise.all([
          getChronicleReconstructionById(reconstructionId),
          userId && chapterId
            ? getUserReconstructionProgressList(userId, chapterId).catch(() => [])
            : Promise.resolve([]),
        ])
        if (!active) return
        if (!nextReconstruction) {
          setError('Матеріали реконструкції ще не завантажені до Архіву.')
          return
        }
        const progress = progressRows.find((item) => item.reconstructionId === reconstructionId)
        const isCompleted = progress?.status === 'completed'
        setReconstruction(nextReconstruction)
        setCompleted(isCompleted)
        setIntroVisible(!isCompleted)
      } catch (loadError: unknown) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Не вдалося відкрити реконструкцію.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [chapterId, reconstructionId, userId])

  const stage = reconstruction?.stages[stageIndex] ?? null
  const progress = reconstruction?.stages.length
    ? ((stageIndex + (stageSolved ? 1 : 0)) / reconstruction.stages.length) * 100
    : 0

  const resetStageSelection = () => {
    setSequence([])
    setConnections({})
    setEvidence([])
    setStageSolved(false)
    setValidationMessage(null)
  }

  const getCurrentAnswer = (currentStage: ChronicleReconstructionStage): AnswerValue => {
    if (currentStage.type === 'sequence') return sequence
    if (currentStage.type === 'connections') return connections
    return evidence
  }

  const isCurrentAnswerCorrect = (currentStage: ChronicleReconstructionStage) => {
    if (currentStage.type === 'sequence') {
      return sameItems(sequence, currentStage.correctOrder)
    }
    if (currentStage.type === 'connections') {
      const expectedEntries = Object.entries(currentStage.correctMatches)
      return expectedEntries.every(([sourceId, targetId]) => connections[sourceId] === targetId)
    }
    return sameSet(evidence, currentStage.correctEvidenceIds)
  }

  const validateStage = () => {
    if (!stage || stageSolved) return
    const answer = getCurrentAnswer(stage)
    const hasAnswer = Array.isArray(answer)
      ? answer.length > 0
      : Object.keys(answer).length > 0

    if (!hasAnswer) {
      setValidationMessage('Спочатку склади запис із доступних матеріалів.')
      return
    }

    if (!isCurrentAnswerCorrect(stage)) {
      setMistakes((current) => current + 1)
      setValidationMessage(
        mistakes >= 1
          ? 'Зв’язок усе ще нестабільний. Зверни увагу на причину кожної події, а не лише на дату.'
          : 'Не всі частини стали на свої місця. Переглянь зв’язки й спробуй ще раз.',
      )
      return
    }

    setAnswers((current) => ({ ...current, [stage.id]: answer }))
    setValidationMessage(null)
    setStageSolved(true)
  }

  const continueReconstruction = async () => {
    if (!reconstruction || !stage || !stageSolved) return
    const isLastStage = stageIndex === reconstruction.stages.length - 1

    if (!isLastStage) {
      setStageIndex((current) => current + 1)
      resetStageSelection()
      return
    }

    if (!userId) {
      showToast({ type: 'warning', message: 'Увійди в акаунт, щоб зберегти справу.' })
      return
    }

    setSubmitting(true)
    try {
      const outcome = await completeChronicleReconstruction({
        chapterId: reconstruction.chapterId,
        reconstructionId: reconstruction.id,
        answers,
        mistakes,
      })
      setCompletionOutcome(outcome)
      setCompletionDialogVisible(outcome.nextAction === 'discovery_search')
      setCompleted(true)
    } catch (completeError: unknown) {
      showToast({
        type: 'error',
        message: completeError instanceof Error
          ? completeError.message
          : 'Не вдалося зберегти реконструкцію.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const availableSequenceItems = useMemo(() => {
    if (!stage || stage.type !== 'sequence') return []
    return stage.items.filter((item) => !sequence.includes(item.id))
  }, [sequence, stage])

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Нестор збирає матеріали справи…</Text>
      </SafeAreaView>
    )
  }

  if (error || !reconstruction) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={34} color={theme.warning} />
        <Text style={[styles.errorText, { color: theme.text }]}>{error ?? 'Реконструкцію не знайдено.'}</Text>
        <Pressable onPress={() => router.back()} style={[styles.compactButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.compactButtonText, { color: theme.background }]}>Повернутися</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  if (completed) {
    const searchDialogue = getNestorDialogue('discovery_search_started', {
      readyAtLabel: formatChronicleDiscoveryReadyAt(
        completionOutcome?.discovery?.readyAt,
      ) ?? undefined,
    })
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.caseSeal, { backgroundColor: `${theme.success}18`, borderColor: `${theme.success}55` }]}>
            <Ionicons name="git-merge" size={34} color={theme.success} />
          </View>
          <Text style={[styles.eyebrow, { color: theme.success }]}>СПРАВУ ВІДНОВЛЕНО</Text>
          <Text style={[styles.resultTitle, { color: theme.text }]}>{reconstruction.caseFile.title}</Text>
          <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.resultSummary, { color: theme.textSecondary }]}>{reconstruction.caseFile.summary}</Text>
            <View style={[styles.unlockRow, { backgroundColor: `${theme.primary}12` }]}>
              <Ionicons
                name={reconstruction.unlockFragmentIds.length > 0 ? 'map-outline' : 'flag-outline'}
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.unlockText, { color: theme.text }]}>
                {reconstruction.unlockFragmentIds.length > 0
                  ? completionOutcome?.nextAction === 'discovery_search'
                    ? `Нестор вирушив за новим слідом і повернеться ${formatChronicleDiscoveryReadyAt(completionOutcome.discovery?.readyAt) ?? 'о 08:00'}.`
                    : 'Наступний слід уже досліджується.'
                  : 'Останню справу закрито. Шлях до Trial відновлено.'}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: theme.cardBorder, backgroundColor: theme.background }]}> 
          <Pressable onPress={() => router.back()} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>Повернутися до Хроніки</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.background} />
          </Pressable>
        </View>
        <NestorDialog
          visible={completionDialogVisible}
          title={searchDialogue.title}
          message={searchDialogue.message}
          primaryLabel="Зрозуміло"
          mode={searchDialogue.mode}
          mood={searchDialogue.mood}
          onPrimary={() => undefined}
          onDismiss={() => setCompletionDialogVisible(false)}
        />
      </SafeAreaView>
    )
  }

  if (!stage) return null

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.progressTrack, { backgroundColor: `${theme.primary}20` }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.headerMeta, { color: theme.textSecondary }]}>Реконструкція · {stageIndex + 1}/{reconstruction.stages.length}</Text>
        </View>
        <View style={[styles.counter, { backgroundColor: `${theme.primary}18` }]}>
          <Text style={[styles.counterText, { color: theme.primary }]}>{stageIndex + 1}/{reconstruction.stages.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.modePill, { backgroundColor: `${theme.primary}16` }]}>
          <Ionicons name="git-merge-outline" size={15} color={theme.primary} />
          <Text style={[styles.modePillText, { color: theme.primary }]}>АРХІВНА РЕКОНСТРУКЦІЯ</Text>
        </View>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{reconstruction.subtitle ?? 'Справа епохи'}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{reconstruction.title}</Text>

        <View style={[styles.stageCard, { backgroundColor: theme.card, borderColor: stageSolved ? `${theme.success}66` : theme.cardBorder }]}>
          <View style={styles.stageTitleRow}>
            <View style={[styles.stageNumber, { backgroundColor: stageSolved ? `${theme.success}20` : `${theme.primary}18` }]}>
              <Text style={[styles.stageNumberText, { color: stageSolved ? theme.success : theme.primary }]}>{stageIndex + 1}</Text>
            </View>
            <View style={styles.stageTitleBody}>
              <Text style={[styles.stageKicker, { color: theme.primary }]}>ЕТАП СПРАВИ</Text>
              <Text style={[styles.stageTitle, { color: theme.text }]}>{stage.title}</Text>
            </View>
          </View>
          <Text style={[styles.instruction, { color: theme.textSecondary }]}>{stage.instruction}</Text>

          {stage.type === 'sequence' ? (
            <View style={styles.boardSection}>
              {sequence.length > 0 && (
                <View style={styles.orderedList}>
                  {sequence.map((itemId, index) => {
                    const item = stage.items.find((candidate) => candidate.id === itemId)
                    if (!item) return null
                    return (
                      <Pressable
                        key={item.id}
                        disabled={stageSolved}
                        onPress={() => setSequence((current) => current.filter((id) => id !== item.id))}
                        style={[styles.orderedItem, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}42` }]}
                      >
                        <View style={[styles.orderBadge, { backgroundColor: theme.primary }]}>
                          <Text style={[styles.orderBadgeText, { color: theme.background }]}>{index + 1}</Text>
                        </View>
                        <View style={styles.itemBody}>
                          <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                          {item.detail ? <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{item.detail}</Text> : null}
                        </View>
                        {!stageSolved && <Ionicons name="close" size={17} color={theme.textSecondary} />}
                      </Pressable>
                    )
                  })}
                </View>
              )}
              <View style={styles.sourceTray}>
                <Text style={[styles.trayLabel, { color: theme.textSecondary }]}>НЕРОЗМІЩЕНІ ФРАГМЕНТИ</Text>
                {availableSequenceItems.map((item) => (
                  <Pressable
                    key={item.id}
                    disabled={stageSolved}
                    onPress={() => {
                      setSequence((current) => [...current, item.id])
                      setValidationMessage(null)
                    }}
                    style={[styles.sourceCard, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                    <View style={styles.itemBody}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                      {item.detail ? <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{item.detail}</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {stage.type === 'connections' ? (
            <View style={styles.boardSection}>
              {stage.sources.map((source) => (
                <View key={source.id} style={[styles.connectionGroup, { borderColor: theme.cardBorder }]}>
                  <View style={styles.connectionSource}>
                    <Ionicons name="radio-button-on" size={17} color={theme.primary} />
                    <View style={styles.itemBody}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{source.title}</Text>
                      {source.detail ? <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{source.detail}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.targetOptions}>
                    {stage.targets.map((target) => {
                      const selected = connections[source.id] === target.id
                      return (
                        <Pressable
                          key={target.id}
                          disabled={stageSolved}
                          onPress={() => {
                            setConnections((current) => ({ ...current, [source.id]: target.id }))
                            setValidationMessage(null)
                          }}
                          style={[
                            styles.targetChip,
                            {
                              backgroundColor: selected ? `${theme.primary}1e` : theme.background,
                              borderColor: selected ? theme.primary : theme.cardBorder,
                            },
                          ]}
                        >
                          <Ionicons name={selected ? 'link' : 'ellipse-outline'} size={15} color={selected ? theme.primary : theme.textSecondary} />
                          <Text style={[styles.targetChipText, { color: selected ? theme.text : theme.textSecondary }]}>{target.title}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {stage.type === 'evidence' ? (
            <View style={styles.boardSection}>
              <View style={[styles.claimCard, { backgroundColor: `${theme.primary}0e`, borderColor: `${theme.primary}38` }]}>
                <Text style={[styles.claimLabel, { color: theme.primary }]}>ВИСНОВОК, ЯКИЙ ТРЕБА ДОВЕСТИ</Text>
                <Text style={[styles.claimText, { color: theme.text }]}>{stage.claim}</Text>
              </View>
              <Text style={[styles.trayLabel, { color: theme.textSecondary }]}>ОБЕРИ ДОКАЗИ</Text>
              {stage.evidence.map((item) => {
                const selected = evidence.includes(item.id)
                return (
                  <Pressable
                    key={item.id}
                    disabled={stageSolved}
                    onPress={() => {
                      setEvidence((current) => selected
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id])
                      setValidationMessage(null)
                    }}
                    style={[
                      styles.evidenceCard,
                      {
                        backgroundColor: selected ? `${theme.primary}16` : theme.background,
                        borderColor: selected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={21} color={selected ? theme.primary : theme.textSecondary} />
                    <View style={styles.itemBody}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                      {item.detail ? <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{item.detail}</Text> : null}
                    </View>
                  </Pressable>
                )
              })}
            </View>
          ) : null}

          {validationMessage ? (
            <View style={[styles.feedbackCard, { backgroundColor: `${theme.warning}12`, borderColor: `${theme.warning}48` }]}>
              <Ionicons name="compass-outline" size={19} color={theme.warning} />
              <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>{validationMessage}</Text>
            </View>
          ) : null}

          {stageSolved ? (
            <View style={[styles.feedbackCard, { backgroundColor: `${theme.success}12`, borderColor: `${theme.success}48` }]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.feedbackText, { color: theme.text }]}>{stage.successText}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.cardBorder, backgroundColor: theme.background }]}>
        <Pressable
          disabled={submitting}
          onPress={stageSolved ? continueReconstruction : validateStage}
          style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.background }]}>
            {submitting
              ? 'Зберігаємо справу…'
              : stageSolved
                ? stageIndex === reconstruction.stages.length - 1
                  ? 'Завершити реконструкцію'
                  : 'Наступний етап'
                : 'Перевірити зв’язки'}
          </Text>
          <Ionicons name={stageSolved ? 'arrow-forward' : 'scan-outline'} size={18} color={theme.background} />
        </Pressable>
      </View>

      <NestorDialog
        visible={introVisible}
        title={`Нова справа: ${reconstruction.title}`}
        message={`${reconstruction.description} Зістав матеріали й віднови між ними надійний зв’язок.`}
        primaryLabel="Відкрити матеріали"
        mode="archive"
        mood="focused"
        onPrimary={() => undefined}
        onDismiss={() => setIntroVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  loadingText: { fontSize: 14, fontWeight: '700' },
  errorText: { maxWidth: 340, fontSize: 16, lineHeight: 23, textAlign: 'center', fontWeight: '700' },
  compactButton: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  compactButtonText: { fontSize: 14, fontWeight: '900' },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerCenter: { flex: 1 },
  progressTrack: { height: 5, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  headerMeta: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  counter: { minWidth: 42, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  counterText: { fontSize: 12, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 122 },
  modePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  modePillText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 0.8, marginTop: 14 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '900', marginTop: 6 },
  stageCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginTop: 22 },
  stageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageNumber: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stageNumberText: { fontSize: 16, fontWeight: '900' },
  stageTitleBody: { flex: 1 },
  stageKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  stageTitle: { fontSize: 20, lineHeight: 25, fontWeight: '900', marginTop: 3 },
  instruction: { fontSize: 14, lineHeight: 21, marginTop: 14 },
  boardSection: { marginTop: 18, gap: 12 },
  orderedList: { gap: 9 },
  orderedItem: { minHeight: 68, borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  orderBadge: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orderBadgeText: { fontSize: 13, fontWeight: '900' },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  itemDetail: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  sourceTray: { marginTop: 4, gap: 8 },
  trayLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  sourceCard: { minHeight: 62, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  connectionGroup: { borderTopWidth: 1, paddingTop: 14, gap: 10 },
  connectionSource: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  targetOptions: { gap: 7 },
  targetChip: { minHeight: 44, borderRadius: 13, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetChipText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  claimCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  claimLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  claimText: { fontSize: 16, lineHeight: 23, fontWeight: '800', marginTop: 7 },
  evidenceCard: { borderWidth: 1, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  feedbackCard: { borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 16 },
  feedbackText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 13, paddingBottom: 20 },
  primaryButton: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { fontSize: 15, fontWeight: '900' },
  resultContent: { flexGrow: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  caseSeal: { width: 82, height: 82, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 31, lineHeight: 37, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  resultCard: { width: '100%', borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 24 },
  resultSummary: { fontSize: 16, lineHeight: 25 },
  unlockRow: { borderRadius: 15, padding: 13, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  unlockText: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '800' },
})
