import type { ChronicleFragment, UserFragmentProgress } from '@nexo/types/chronicle.types'

/**
 * Один фрагмент проходить однаковий шлях у карті, Архіві та фокус-блоці.
 * `verified` лишається станом усієї епохи після Trial, а не окремого запису.
 */
export type ChronicleFragmentStage = 'locked' | 'discovered' | 'studied' | 'restored'

type FragmentStageParams = {
  fragment: ChronicleFragment
  progress?: UserFragmentProgress
  isFirstFragment?: boolean
}

export function getChronicleFragmentStage({
  fragment,
  progress,
  isFirstFragment = false,
}: FragmentStageParams): ChronicleFragmentStage {
  if (progress?.mastered) return 'restored'
  if (progress?.read) return 'studied'
  if (progress?.unlocked || isFirstFragment) return 'discovered'
  return 'locked'
}

export function isChronicleFragmentAccessible(stage: ChronicleFragmentStage) {
  return stage !== 'locked'
}

