import React from 'react';
import { Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@nexo/constants/theme';
import { Quiz } from '@nexo/types/quiz.types';
import { UserQuizProgress } from '@nexo/types/result.types';
import { useAuth } from '@nexo/contexts/AuthProvider';
import { canStartQuiz, getQuizRewardMultiplier, MAX_QUIZ_ATTEMPTS } from '@nexo/utils/quiz-progress';
import { formatQuizDurationShort, getQuizDurationSeconds } from '@nexo/utils/quiz-time';
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
  ModalButtonPrimaryText,
  ModalButtonSecondary,
  ModalButtonSecondaryText,
} from '@nexo/components/Quiz/Detail/QuizDetail.styled';

interface QuizStartModalProps {
  visible: boolean;
  quiz: Quiz | null;
  progress: UserQuizProgress | null;
  onClose: () => void;
}

export function QuizStartModal({ visible, quiz, progress, onClose }: QuizStartModalProps) {
  const router = useRouter();
  const { userProfile } = useAuth();

  if (!quiz) return null;

  const estimatedTime = getQuizDurationSeconds(quiz);
  const currentCoins = userProfile?.coins || 0;
  const quizReward = quiz.reward ?? 0;
  const nextAttempt = (progress?.attempts ?? 0) + 1;
  const isLocked = !canStartQuiz(progress);
  const rewardMultiplier = getQuizRewardMultiplier(nextAttempt);
  const adjustedReward = Math.floor(quizReward * rewardMultiplier);
  const potentialCoins = currentCoins + adjustedReward;

  const handleStartQuiz = () => {
    if (isLocked) {
      onClose();
      return;
    }

    onClose();
    router.push(`/quiz-play/${quiz.id}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalGradient colors={[Theme.background, Theme.card]}>
            <ModalIconContainer>
              <Ionicons name="rocket" size={48} color={Theme.primary} />
            </ModalIconContainer>

            <ModalTitle>Готові розпочати?</ModalTitle>
            <ModalSubtitle>{quiz.title}</ModalSubtitle>

            <ModalInfo>
              <ModalInfoText>
                {isLocked ? '✅ Квіз вже завершено' : `🎯 Спроба ${nextAttempt} з ${MAX_QUIZ_ATTEMPTS}`}
              </ModalInfoText>
              <ModalInfoText>📝 {quiz.questions?.length || quiz.questionsCount} питань</ModalInfoText>
            </ModalInfo>

         
            <RewardsPreview>
              <RewardPreviewItem>
                <RewardLabel>Поточний баланс</RewardLabel>
                <RewardValue>
                  <Ionicons name="cash" size={20} color={Theme.coin} />
                  <RewardText>{currentCoins}</RewardText>
                </RewardValue>
              </RewardPreviewItem>
              <Ionicons name="arrow-forward" size={24} color={Theme.textSecondary} />
              <RewardPreviewItem>
                <RewardLabel>{isLocked ? 'Квіз завершено' : 'Після вікторини'}</RewardLabel>
                <RewardValue>
                  <Ionicons name="cash" size={20} color={Theme.success} />
                  <RewardTextSuccess>{potentialCoins}</RewardTextSuccess>
                </RewardValue>
              </RewardPreviewItem>
            </RewardsPreview>

            <ModalInfo>
              <ModalInfoText>⏱ {formatQuizDurationShort(estimatedTime)}</ModalInfoText>
              {!isLocked && <ModalInfoText>💰 За 100%: +{adjustedReward}</ModalInfoText>}
            </ModalInfo>

    
            <ModalActions>
              <ModalButtonSecondary onPress={onClose}>
                <ModalButtonSecondaryText>Ще не готовий</ModalButtonSecondaryText>
              </ModalButtonSecondary>
              <ModalButtonPrimary onPress={handleStartQuiz} disabled={isLocked} style={{ opacity: isLocked ? 0.5 : 1 }}>
                <ModalButtonPrimaryText>{isLocked ? 'Ліміт спроб вичерпано' : 'Так, почнімо!'}</ModalButtonPrimaryText>
              </ModalButtonPrimary>
            </ModalActions>
          </ModalGradient>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}
