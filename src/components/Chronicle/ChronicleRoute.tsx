import React, { type ComponentProps } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import type {
  ChronicleRouteItem,
  ChronicleRouteStatus,
} from '@nexo/utils/chronicle-route'
import { getArchiveMeta } from '@nexo/utils/chronicle-route'
import {
  FogNotice,
  FogNoticeText,
  Pill,
  PillText,
  RouteCard,
  RouteCardText,
  RouteCardTitle,
  RouteCardTop,
  RouteCta,
  RouteCtaText,
  RouteHeader,
  RouteHint,
  RouteItem,
  RouteKicker,
  RouteLine,
  RouteMeta,
  RouteNode,
  RoutePanel,
  RouteRail,
  RouteTitle,
} from '@nexo/components/Chronicle/Chronicle.styled'

type ChronicleRouteProps = {
  items: ChronicleRouteItem[]
  activeSlotId?: string
  focusActiveChallenge: boolean
  foggedFragmentCount: number
  completedTrialScore: number | null
  closeDate: string | null
  startButtonMuted: boolean
  startingChallenge: boolean
  startButtonText: string
  onItemPress: (item: ChronicleRouteItem) => void
  onPanelLayout: (event: LayoutChangeEvent) => void
  onActiveItemLayout: (event: LayoutChangeEvent) => void
}

type IconName = ComponentProps<typeof Ionicons>['name']

function getVisualStatus(item: ChronicleRouteItem): ChronicleRouteStatus {
  if (item.kind !== 'fragment') return item.status
  if (item.status === 'restored') return 'completed'
  if (item.status === 'locked') return 'locked'
  if (item.status === 'discovered') return 'available'
  return 'created'
}

function getRouteTitle(item: ChronicleRouteItem) {
  if (item.kind === 'challenge') {
    if (item.status !== 'locked') return item.slot.title
    return item.slot.type === 'trial_gate' ? 'Невідоме випробування' : 'Невідомий виклик'
  }
  if (item.kind === 'reconstruction') {
    return item.status === 'locked' ? 'Невідома реконструкція' : item.reconstruction.title
  }
  return item.status === 'locked' ? 'Закритий фрагмент' : item.fragment.title
}

function getRouteKicker(item: ChronicleRouteItem) {
  if (item.status === 'locked' && item.kind !== 'fragment') return 'Туман епохи'
  if (item.kind === 'challenge') {
    return item.slot.type === 'trial_gate' ? 'Фінал епохи · Trial' : 'Виклик'
  }
  if (item.kind === 'reconstruction') {
    return item.status === 'completed' ? 'Справу відновлено' : 'Реконструкція акту'
  }
  if (item.status === 'restored') return 'Запис відновлено'
  if (item.status === 'studied') return 'Теорію досліджено'
  if (item.status === 'discovered') return `Знайдено · ${getArchiveMeta(item.fragment).label}`
  return 'Туман епохи'
}

function getRouteDescription(
  item: ChronicleRouteItem,
  isActiveChallenge: boolean,
  completedTrialScore: number | null,
) {
  if (item.status === 'locked' && item.kind !== 'fragment') {
    return 'Туман приховує деталі. Віднови попередній запис, щоб дізнатися більше.'
  }
  if (item.kind === 'challenge') {
    if (item.status === 'completed') {
      return item.slot.type === 'trial_gate'
        ? `Trial завершено з результатом ${completedTrialScore ?? 0}%.`
        : 'Виклик пройдено. Нестор перевіряє сліди до наступного фрагмента.'
    }
    if (item.status === 'created') return 'Виклик уже створено та чекає на сторінці вікторин.'
    if (item.status === 'locked') {
      return isActiveChallenge
        ? 'Спочатку відкрий і познач як прочитану теорію перед цим викликом.'
        : 'Цей виклик відкриється, коли настане його час.'
    }
    return item.slot.description ?? 'Наступний крок твого маршруту.'
  }
  if (item.kind === 'reconstruction') {
    return item.status === 'completed'
      ? item.reconstruction.caseFile.summary
      : item.reconstruction.description
  }
  if (item.status === 'locked') {
    return 'Туман приховує цей фрагмент. Віднови попередній запис і дочекайся знахідки Нестора.'
  }
  if (item.status === 'studied') {
    return 'Теорію прочитано. Наступний Spark закріпить цей запис у твоєму Архіві.'
  }
  if (item.status === 'restored') {
    return 'Запис збережено в Архіві. Він ще повернеться у наступних викликах.'
  }
  return item.fragment.shortText
}

function getRouteIcon(item: ChronicleRouteItem): IconName {
  if (item.kind === 'challenge') {
    if (item.slot.type === 'trial_gate') return 'trophy-outline'
    if (item.status === 'completed') return 'checkmark'
    if (item.status === 'created') return 'hourglass-outline'
    if (item.status === 'locked') return 'lock-closed-outline'
    return 'flag'
  }
  if (item.kind === 'reconstruction') {
    if (item.status === 'completed') return 'checkmark'
    if (item.status === 'locked') return 'lock-closed-outline'
    return 'git-merge-outline'
  }
  if (item.status === 'restored') return 'checkmark'
  if (item.status === 'locked') return 'lock-closed-outline'
  if (item.status === 'studied') return 'flash-outline'
  return 'search-outline'
}

export function ChronicleRoute({
  items,
  activeSlotId,
  focusActiveChallenge,
  foggedFragmentCount,
  completedTrialScore,
  closeDate,
  startButtonMuted,
  startingChallenge,
  startButtonText,
  onItemPress,
  onPanelLayout,
  onActiveItemLayout,
}: ChronicleRouteProps) {
  const theme = useAppTheme()

  return (
    <RoutePanel onLayout={onPanelLayout}>
      <RouteHeader>
        <RouteTitle>Шлях епохи</RouteTitle>
        <Ionicons name="map-outline" size={21} color={theme.primary} />
      </RouteHeader>
      <RouteHint>
        Кожна відновлена справа відсуває туман і відкриває наступну частину історії.
      </RouteHint>
      {foggedFragmentCount > 0 ? (
        <FogNotice>
          <Ionicons name="cloud-outline" size={17} color={theme.textSecondary} />
          <FogNoticeText>
            Туман приховує ще {foggedFragmentCount}{' '}
            {foggedFragmentCount === 1 ? 'фрагмент' : 'фрагменти'} епохи.
          </FogNoticeText>
        </FogNotice>
      ) : null}

      {items.map((item, index) => {
        const visualStatus = getVisualStatus(item)
        const isChallenge = item.kind === 'challenge'
        const isReconstruction = item.kind === 'reconstruction'
        const isActiveChallenge = isChallenge && item.slot.id === activeSlotId
        const hiddenChallenge = isChallenge && item.status === 'locked'
        const hiddenReconstruction = isReconstruction && item.status === 'locked'
        const side = index % 2 === 0 ? 'left' : 'right'
        const icon = getRouteIcon(item)

        return (
          <RouteItem
            key={item.kind === 'challenge'
              ? item.slot.id
              : item.kind === 'reconstruction'
                ? item.reconstruction.id
                : item.fragment.id}
            $side={side}
            activeOpacity={0.84}
            onPress={() => onItemPress(item)}
            onLayout={isActiveChallenge ? onActiveItemLayout : undefined}
          >
            <RouteRail>
              <RouteNode $status={visualStatus}>
                <Ionicons
                  name={icon}
                  size={visualStatus === 'trial' ? 21 : 17}
                  color={
                    visualStatus === 'available' ||
                    visualStatus === 'completed' ||
                    visualStatus === 'created'
                      ? theme.background
                      : theme.primary
                  }
                />
              </RouteNode>
              {index < items.length - 1 ? (
                <RouteLine $filled={visualStatus === 'completed' || visualStatus === 'available'} />
              ) : null}
            </RouteRail>

            <RouteCard
              $status={visualStatus}
              $side={side}
              $highlight={isActiveChallenge && focusActiveChallenge}
            >
              <RouteCardTop>
                <RouteKicker $status={visualStatus}>{getRouteKicker(item)}</RouteKicker>
                {isChallenge && !hiddenChallenge ? (
                  <Pill $variant={visualStatus === 'completed' ? 'success' : 'primary'}>
                    <PillText $variant={visualStatus === 'completed' ? 'success' : 'primary'}>
                      {item.slot.questionCount} питань
                    </PillText>
                  </Pill>
                ) : null}
                {isReconstruction && !hiddenReconstruction ? (
                  <Pill $variant={visualStatus === 'completed' ? 'success' : 'primary'}>
                    <PillText $variant={visualStatus === 'completed' ? 'success' : 'primary'}>
                      {item.reconstruction.stages.length} етапи
                    </PillText>
                  </Pill>
                ) : null}
              </RouteCardTop>
              <RouteCardTitle>{getRouteTitle(item)}</RouteCardTitle>
              <RouteCardText>
                {getRouteDescription(item, isActiveChallenge, completedTrialScore)}
              </RouteCardText>

              {isActiveChallenge ? (
                <>
                  <RouteMeta>
                    {closeDate ? <Pill><PillText>до {closeDate}</PillText></Pill> : null}
                    <Pill><PillText>{item.slot.targetFragmentIds.length} фрагм.</PillText></Pill>
                  </RouteMeta>
                  <RouteCta $muted={startButtonMuted}>
                    <Ionicons
                      name={startingChallenge ? 'hourglass-outline' : item.status === 'completed' ? 'checkmark-circle-outline' : 'add-circle'}
                      size={16}
                      color={startButtonMuted ? theme.textSecondary : theme.background}
                    />
                    <RouteCtaText $muted={startButtonMuted}>{startButtonText}</RouteCtaText>
                  </RouteCta>
                </>
              ) : null}
            </RouteCard>
          </RouteItem>
        )
      })}
    </RoutePanel>
  )
}
