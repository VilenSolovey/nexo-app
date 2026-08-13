import React, { useEffect } from "react"
import { Pressable } from "react-native"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { Theme } from "@nexo/constants/theme"
import { Motion } from "@nexo/constants/motion"
import { useAppTheme } from "@nexo/contexts/AppThemeProvider"
import type { HomeChronicleFocus } from "@nexo/hooks/useHomeChronicleFocus"
import {
  FocusBottomRow,
  FocusButton,
  FocusButtonText,
  FocusCard,
  FocusEyebrow,
  FocusGlow,
  FocusHint,
  FocusHeroIcon,
  FocusPill,
  FocusPillText,
  FocusShimmer,
  FocusSubtitle,
  FocusTitle,
  FocusTopRow,
} from "@nexo/components/Home/TodayFocus/TodayFocus.styled"

type Props = {
  focus: HomeChronicleFocus
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function TodayFocus({ focus, onPress }: Props) {
  const appTheme = useAppTheme()
  const pressScale = useSharedValue(1)
  const shimmerX = useSharedValue(-130)
  const iconLift = useSharedValue(0)
  const content = {
    loading: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ПЕРЕВІРКА",
      title: "Оновлюємо Хроніку",
      subtitle: "Перевіряємо, який крок доступний тобі зараз.",
      hint: "Це займе лише мить",
      cta: "Відкрити",
    },
    available: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ДОСТУПНО",
      title: focus.challengeTitle ?? "Новий виклик доступний",
      subtitle: "Виклик уже відкритий. Перейди в Хроніку, щоб створити його та продовжити шлях.",
      hint: "Хроніка чекає на тебе",
      cta: "До виклику",
    },
    created: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ГОТОВО",
      title: "Виклик уже створено",
      subtitle: "Твій виклик готовий. Відкрий Хроніку, щоб побачити його статус і наступний фрагмент.",
      hint: focus.challengeTitle ?? "Продовжуй у своєму темпі",
      cta: "Переглянути",
    },
    study: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ТЕОРІЯ",
      title: "Спочатку опрацюй теорію",
      subtitle: "Перед наступним викликом відкрий матеріал на мапі епохи та познач його прочитаним.",
      hint: focus.challengeTitle ?? "Новий блок уже чекає в Хроніці",
      cta: "До теорії",
    },
    reconstruction: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "РЕКОНСТРУКЦІЯ",
      title: focus.challengeTitle ?? "З’єднай відновлені записи",
      subtitle: "Обидва фрагменти акту вже відновлено. Тепер склади з них цілісну історичну справу.",
      hint: "Нестор підготував матеріали",
      cta: "До справи",
    },
    searching: {
      eyebrow: "ЕКСПЕДИЦІЯ НЕСТОРА",
      pill: "У ПОШУКУ",
      title: "Нестор досліджує новий слід",
      subtitle: "Наступний фрагмент ще прихований туманом. Нестор повернеться з матеріалами після завершення пошуку.",
      hint: focus.opensAtLabel ? `Повернення ${focus.opensAtLabel}` : "Повернення о 08:00 за Києвом",
      cta: "Стежити за пошуком",
    },
    discovery_ready: {
      eyebrow: "ЕКСПЕДИЦІЯ НЕСТОРА",
      pill: "ЗНАХІДКА",
      title: "Нестор повернувся",
      subtitle: "Новий матеріал уже доставлено до Архіву. Прийми знахідку, щоб відкрити наступний запис.",
      hint: "Новий слід чекає у Хроніці",
      cta: "Прийняти знахідку",
    },
    waiting: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ОЧІКУВАННЯ",
      title: "Зараз час для теорії",
      subtitle: "Новий виклик ще не відкритий. Переглянь доступні фрагменти Хроніки, щоб бути готовим.",
      hint: focus.opensAtLabel ? `Наступний виклик відкриється ${focus.opensAtLabel}` : "Новий виклик з’явиться незабаром",
      cta: "Відкрити Хроніку",
    },
    complete: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "ЗАВЕРШЕНО",
      title: "Епоху завершено",
      subtitle: "Ти пройшов усі доступні виклики. Переглянь результати та відкриті фрагменти Хроніки.",
      hint: "Нові епохи з’являться тут",
      cta: "Відкрити Хроніку",
    },
    error: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "НЕМАЄ ЗВ’ЯЗКУ",
      title: "Не вдалося звірити Хроніку",
      subtitle: "Ми не отримали актуальний прогрес. Відкрий Хроніку або онови Home ще раз.",
      hint: "Перевір з’єднання та спробуй ще раз",
      cta: "Відкрити Хроніку",
    },
    empty: {
      eyebrow: "ТВІЙ НАСТУПНИЙ КРОК",
      pill: "НЕЗАБАРОМ",
      title: "Хроніка готується",
      subtitle: "Поки немає нового виклику. Повертайся трохи пізніше.",
      hint: "Ми готуємо наступну пригоду",
      cta: "Переглянути Хроніку",
    },
  }[focus.status]
  const heroIcon = focus.status === 'searching'
    ? 'compass-outline'
    : focus.status === 'discovery_ready'
      ? 'mail-unread-outline'
      : focus.status === 'reconstruction'
        ? 'git-merge-outline'
        : 'flag'

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(320, {
        duration: 2600,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
    iconLift.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1200, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      true,
    )
  }, [iconLift, shimmerX])

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shimmerX.value },
      { rotate: "14deg" },
    ],
  }))

  const heroIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconLift.value }],
  }))

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.selectionAsync()
        onPress()
      }}
      onPressIn={() => {
        pressScale.value = withSpring(0.982, Motion.spring)
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, Motion.spring)
      }}
      style={[{ width: "100%", alignItems: "center" }, pressStyle]}
    >
      <FocusCard
        colors={[appTheme.card, appTheme.shopCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <FocusGlow pointerEvents="none" />
        <FocusShimmer pointerEvents="none" style={shimmerStyle} />
        <FocusHeroIcon pointerEvents="none" style={heroIconStyle}>
          <Ionicons name={heroIcon} size={74} color={Theme.primary} />
        </FocusHeroIcon>

        <FocusTopRow>
          <FocusEyebrow>{content.eyebrow}</FocusEyebrow>
          <FocusPill>
            <Ionicons name="map-outline" size={16} color={Theme.primary} />
            <FocusPillText>{content.pill}</FocusPillText>
          </FocusPill>
        </FocusTopRow>

        <FocusTitle numberOfLines={2}>{content.title}</FocusTitle>
        <FocusSubtitle>{content.subtitle}</FocusSubtitle>

        <FocusBottomRow>
          <FocusHint>{content.hint}</FocusHint>
          <FocusButton>
            <FocusButtonText>{content.cta}</FocusButtonText>
            <Ionicons name="arrow-forward" size={15} color={Theme.background} />
          </FocusButton>
        </FocusBottomRow>
      </FocusCard>
    </AnimatedPressable>
  )
}
