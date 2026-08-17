import React, { useEffect } from 'react';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '@nexo/constants/motion';
import { NexonsIcon } from '@nexo/components/Currency/NexonsIcon';
import type { Quiz } from '@nexo/types/quiz.types';
import type { UserQuizProgress } from '@nexo/types/result.types';
import { useAuth } from '@nexo/contexts/AuthProvider';
import { useAppTheme } from '@nexo/contexts/AppThemeProvider';
import {
  canStartQuiz,
  getQuizMaxAttempts,
  getQuizRewardMultiplier,
  PERFECT_QUIZ_SCORE,
} from '@nexo/utils/quiz-progress';
import { formatQuizDurationShort, getQuizDurationSeconds } from '@nexo/utils/quiz-time';
import { useQuizLaunchSequence } from '@nexo/components/Quiz/Discovery/useQuizLaunchSequence';
import {
  ModalOverlay,
  ModalContent,
  ModalGradient,
  ModalIconContainer,
  ModalTitle,
  ModalSubtitle,
  RewardsPreview,
  RewardPreviewItem,
  RewardLabel,
  RewardValue,
  RewardText,
  RewardTextSuccess,
  ModalInfo,
  ModalInfoText,
  ModalActions,
  ModalButtonPrimary,
  ModalButtonContent,
  ModalButtonPrimaryText,
  ModalButtonProgressFill,
  ModalButtonSecondary,
  ModalButtonSecondaryText,
  CountdownOverlay,
  CountdownText,
} from '@nexo/components/Quiz/Discovery/QuizStartModal.styled';

interface QuizStartModalProps {
  visible: boolean;
  quiz: Quiz | null;
  progress: UserQuizProgress | null;
  onClose: () => void;
}

export function QuizStartModal({ visible, quiz, progress, onClose }: QuizStartModalProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const modalScale = useSharedValue(0.92);
  const modalOpacity = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const {
    countdownAnimatedStyle,
    countdownStep,
    isLaunching,
    launchMessage,
    launchProgress,
    resetLaunch,
    startLaunch,
  } = useQuizLaunchSequence();

  useEffect(() => {
    if (!visible) {
      resetLaunch();
      cancelAnimation(iconScale);
      modalScale.value = 0.92;
      modalOpacity.value = 0;
      iconScale.value = 1;
      return;
    }

    void Haptics.selectionAsync();
    modalOpacity.value = withTiming(1, { duration: Motion.duration.fast });
    modalScale.value = withSpring(1, Motion.spring);
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 720, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 720, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [iconScale, modalOpacity, modalScale, resetLaunch, visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!quiz) return null;

  const estimatedTime = getQuizDurationSeconds(quiz);
  const currentCoins = userProfile?.coins || 0;
  const quizReward = quiz.reward ?? 0;
  const maxAttempts = getQuizMaxAttempts(quiz.maxAttempts);
  const nextAttempt = (progress?.attempts ?? 0) + 1;
  const isLocked = !canStartQuiz(progress, maxAttempts);
  const hasPerfectScore =
    Math.max(progress?.bestScore ?? 0, progress?.officialScore ?? 0) >= PERFECT_QUIZ_SCORE;
  const rewardMultiplier = getQuizRewardMultiplier(nextAttempt);
  const adjustedReward = Math.floor(quizReward * rewardMultiplier);
  const potentialCoins = isLocked ? currentCoins : currentCoins + adjustedReward;

  const handleStartQuiz = async () => {
    if (isLocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onClose();
      return;
    }

    if (isLaunching) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await startLaunch(() => {
      onClose();
      router.push(`/quiz-play/${quiz.id}`);
    });
  };

  const itemEntering = (index: number) =>
    FadeInDown
      .delay(110 + index * 70)
      .duration(Motion.duration.normal)
      .springify()
      .damping(Motion.spring.damping)
      .stiffness(Motion.spring.stiffness);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <Animated.View style={[{ width: '100%', maxWidth: 400 }, modalAnimatedStyle]}>
          <ModalContent>
            <ModalGradient colors={[theme.background, theme.card]}>
              <Animated.View entering={itemEntering(0)} style={iconAnimatedStyle}>
                <ModalIconContainer>
                  <Ionicons name="rocket" size={48} color={theme.primary} />
                </ModalIconContainer>
              </Animated.View>

              {isLaunching ? (
                <CountdownOverlay>
                  <Animated.View style={countdownAnimatedStyle}>
                    <CountdownText>{countdownStep}</CountdownText>
                  </Animated.View>
                </CountdownOverlay>
              ) : (
                <>
                  <Animated.View entering={itemEntering(1)}>
                    <ModalTitle>Готові розпочати?</ModalTitle>
                    <ModalSubtitle>{quiz.title}</ModalSubtitle>
                  </Animated.View>

                  <Animated.View entering={itemEntering(2)}>
                    <ModalInfo>
                      <ModalInfoText>
                        {isLocked
                          ? hasPerfectScore
                            ? 'Квіз пройдено на 100%'
                            : 'Квіз вже завершено'
                          : `🎯 Спроба ${nextAttempt} з ${maxAttempts}`}
                      </ModalInfoText>
                      <ModalInfoText>📝 {quiz.questions?.length || quiz.questionsCount} питань</ModalInfoText>
                    </ModalInfo>
                  </Animated.View>

                  <Animated.View entering={itemEntering(3)}>
                    <RewardsPreview>
                      <RewardPreviewItem>
                        <RewardLabel>Поточний баланс</RewardLabel>
                        <RewardValue>
                          <NexonsIcon size={23} />
                          <RewardText>{currentCoins}</RewardText>
                        </RewardValue>
                      </RewardPreviewItem>
                      <Ionicons name="arrow-forward" size={24} color={theme.textSecondary} />
                      <RewardPreviewItem>
                        <RewardLabel>{isLocked ? 'Квіз завершено' : 'Після вікторини'}</RewardLabel>
                        <RewardValue>
                          <NexonsIcon size={23} />
                          <RewardTextSuccess>{potentialCoins}</RewardTextSuccess>
                        </RewardValue>
                      </RewardPreviewItem>
                    </RewardsPreview>
                  </Animated.View>

                  <Animated.View entering={itemEntering(4)}>
                    <ModalInfo>
                      <ModalInfoText>⏱ {formatQuizDurationShort(estimatedTime)}</ModalInfoText>
                      {!isLocked && <ModalInfoText>Нагорода за 100%: +{adjustedReward}</ModalInfoText>}
                    </ModalInfo>
                  </Animated.View>
                </>
              )}

              <Animated.View entering={itemEntering(5)}>
                <ModalActions>
                  {!isLaunching && (
                    <ModalButtonSecondary onPress={onClose}>
                      <ModalButtonSecondaryText>Ще не готовий</ModalButtonSecondaryText>
                    </ModalButtonSecondary>
                  )}
                  <ModalButtonPrimary
                    onPress={handleStartQuiz}
                    disabled={isLocked || isLaunching}
                    style={{ opacity: isLocked ? 0.5 : 1 }}
                  >
                    {isLaunching && (
                      <ModalButtonProgressFill style={{ width: `${launchProgress}%` }} />
                    )}
                    <ModalButtonContent>
                      {isLaunching && (
                        <Ionicons name="sparkles" size={18} color={theme.card} />
                      )}
                      <ModalButtonPrimaryText>
                        {isLaunching
                          ? `${launchMessage} ${launchProgress}%`
                          : isLocked
                            ? 'Квіз завершено'
                            : 'Так, почнімо!'}
                      </ModalButtonPrimaryText>
                    </ModalButtonContent>
                  </ModalButtonPrimary>
                </ModalActions>
              </Animated.View>
            </ModalGradient>
          </ModalContent>
        </Animated.View>
      </ModalOverlay>
    </Modal>
  );
}
