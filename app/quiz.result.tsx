import React, { useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@nexo/constants/theme';
import { useAuth } from '@nexo/contexts/AuthProvider';
import { getQuizById } from '@nexo/services/quiz.service';
import { getQuizProgress, saveQuizAttempt } from '@nexo/services/progress.service';
import { completeQuizSession } from '@nexo/services/quiz-session.service';
import { applyUserRewards, registerDailyActivity } from '@nexo/services/user.service';
import { getQuizRewardMultiplier, isQuizCompleted, MAX_QUIZ_ATTEMPTS } from '@nexo/utils/quiz-progress';
import {
  Container,
  SafeArea,
  ScrollContent,
} from '@nexo/components/Quiz/Result/QuizResult.styled';
import { ResultBanner } from '@nexo/components/Quiz/Result/ResultBanner';
import { ResultHero } from '@nexo/components/Quiz/Result/ResultHero';
import { ScoreSummaryCard } from '@nexo/components/Quiz/Result/ScoreSummaryCard';
import { RewardsSummaryCard } from '@nexo/components/Quiz/Result/RewardsSummaryCard';
import { ResultActions } from '@nexo/components/Quiz/Result/ResultActions';

export default function QuizResultScreen() {
  const {
    quizId,
    correct,
    total,
    passed,
    timeExpired,
    quitEarly,
    timeSpent,
    sessionId,
    leftAppDuringQuiz,
    backgroundCount,
    backgroundDurationMs,
    coinsBoostMultiplier,
    expBoostMultiplier,
  } = useLocalSearchParams();
  const router = useRouter();
  const { userProfile, refreshUserProfile } = useAuth();
  const userId = userProfile?.uid ?? userProfile?.id;

  const [quiz, setQuiz] = React.useState<any | null>(null);
  const [mastered, setMastered] = React.useState(false);
  const [attempt, setAttempt] = React.useState<number | null>(null);
 
  const savedRef = React.useRef(false);

  const isTimeExpired = timeExpired === 'true';
  const isQuitEarly = quitEarly === 'true';
  const didLeaveAppDuringQuiz = leftAppDuringQuiz === 'true';
  const correctCount = parseInt(correct as string) || 0;
  const totalCount = parseInt(total as string) || 1;
  const isPassed = passed === 'true';
  const resolvedTimeSpent = parseInt(timeSpent as string) || 0;
  const resolvedBackgroundCount = parseInt(backgroundCount as string) || 0;
  const resolvedBackgroundDurationMs = parseInt(backgroundDurationMs as string) || 0;
  const resolvedCoinsBoost = Math.max(parseInt(coinsBoostMultiplier as string) || 1, 1);
  const resolvedExpBoost = Math.max(parseInt(expBoostMultiplier as string) || 1, 1);
  const percentage = Math.round((correctCount / totalCount) * 100);
  const resolvedAttempt = attempt ?? 1;

  const rewardMultiplier = getQuizRewardMultiplier(resolvedAttempt);
  const isReducedReward = resolvedAttempt > 1;
  const canRetake = !isQuizCompleted(resolvedAttempt);
  const baseCoins = Number(quiz?.coinReward ?? quiz?.reward ?? 0);
  const baseExp = Number(quiz?.expReward ?? quiz?.exp ?? 0);
  const boostedCoinsBase = baseCoins * resolvedCoinsBoost;
  const boostedExpBase = baseExp * resolvedExpBoost;
  const earnedCoins = Math.floor(boostedCoinsBase * rewardMultiplier);
  const earnedExp = Math.floor(boostedExpBase * rewardMultiplier);

  useEffect(() => {
    if (!quizId) return;
    getQuizById(String(quizId)).then(setQuiz).catch(console.error);
  }, [quizId]);

  useEffect(() => {
    if (!userId || !quiz?.id) return;

    getQuizProgress(userId, quiz.id)
      .then((progress) => {
        setAttempt((progress?.attempts ?? 0) + 1);
      })
      .catch(() => {
        setAttempt(1);
      });
  }, [quiz?.id, userId]);

  const updateUserRewards = useCallback(async () => {
    if (!userId || !quiz) return;

    try {
      const effectiveAttempt = attempt ?? 1;
      const effectiveRewardMultiplier = getQuizRewardMultiplier(effectiveAttempt);
      const baseCoins = Number(quiz.coinReward ?? quiz.reward ?? 0);
      const baseExp = Number(quiz.expReward ?? quiz.exp ?? 0);
      const finalCoins = Math.floor(baseCoins * resolvedCoinsBoost * effectiveRewardMultiplier);
      const finalExp = Math.floor(baseExp * resolvedExpBoost * effectiveRewardMultiplier);

      if (typeof sessionId === 'string' && sessionId.trim()) {
        await completeQuizSession({
          sessionId,
          score: correctCount,
          total: totalCount,
          timeSpent: resolvedTimeSpent,
          passed: isPassed,
          timeExpired: isTimeExpired,
          quitEarly: isQuitEarly,
          backgroundCount: resolvedBackgroundCount,
          backgroundDurationMs: resolvedBackgroundDurationMs,
        });
      }

      const progressResult = await saveQuizAttempt({
        userId,
        quizId: quiz.id,
        score: correctCount,
        total: totalCount,
        earnedCoins: isPassed ? finalCoins : 0,
        earnedExp: isPassed ? finalExp : 0,
        timeSpent: resolvedTimeSpent,
        passed: isPassed,
        timeExpired: isTimeExpired,
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        leftAppDuringQuiz: didLeaveAppDuringQuiz,
        backgroundCount: resolvedBackgroundCount,
        backgroundDurationMs: resolvedBackgroundDurationMs,
      });

      setMastered(progressResult.mastered);

      if (isPassed) {
        await applyUserRewards(userId, {
          coinsDelta: finalCoins,
          expDelta: finalExp,
        })
      }

      await registerDailyActivity(userId)

      await refreshUserProfile();
    } catch (error) {
      console.error('Error updating rewards:', error);
    }
  }, [
    attempt,
    correctCount,
    isPassed,
    isQuitEarly,
    isTimeExpired,
    quiz,
    resolvedTimeSpent,
    resolvedBackgroundCount,
    resolvedBackgroundDurationMs,
    resolvedCoinsBoost,
    resolvedExpBoost,
    didLeaveAppDuringQuiz,
    sessionId,
    totalCount,
    refreshUserProfile,
    userId,
  ]);

  useEffect(() => {
    if (userId && quiz && attempt !== null && !savedRef.current) {
      savedRef.current = true;
      updateUserRewards();
    }
  }, [attempt, quiz, updateUserRewards, userId]);

  const getResultEmoji = () => {
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  const getResultTitle = () => {
    if (percentage === 100) return 'Ідеально!';
    if (percentage >= 80) return 'Чудово!';
    if (percentage >= 60) return 'Добре!';
    return 'Спробуй ще раз!';
  };

  const getResultMessage = () => {
    if (percentage === 100) return 'Ви відповіли на всі питання правильно! Ви справжній експерт!';
    if (percentage >= 80) return 'Відмінний результат! Продовжуйте в тому ж дусі!';
    if (percentage >= 60) return 'Хороша робота! Можна і краще, але це вже успіх!';
    return 'Не засмучуйтесь! Практика робить майстра. Спробуйте ще раз!';
  };

  return (
    <Container colors={[Theme.background, Theme.card]}>
      <SafeArea>
        <ScrollContent>

          {isTimeExpired && (
            <ResultBanner
              variant="time"
              icon="time-outline"
              text="Час вийшов! Ось скільки ви встигли"
            />
          )}
          {isQuitEarly && (
            <ResultBanner
              variant="attempt"
              icon="exit-outline"
              text="Ви завершили квіз достроково. Спроба зарахована, але нагорода не нараховується."
            />
          )}
          {isReducedReward && (
            <ResultBanner
              variant="attempt"
              icon="information-circle-outline"
              text={`Спроба ${resolvedAttempt} — нагорода зменшена до ${Math.round(rewardMultiplier * 100)}%`}
            />
          )}

          {resolvedAttempt === 1 && (
            <ResultBanner
              variant="attempt"
              icon="ribbon-outline"
              iconColor={Theme.primary}
              text="Нагорода нараховується лише за 100% правильних відповідей"
            />
          )}

          {mastered && (
            <ResultBanner
              variant="mastered"
              icon="trophy"
              text={`🎓 Квіз завершено! Використано ${MAX_QUIZ_ATTEMPTS} спроби.`}
            />
          )}

          <ResultHero
            emoji={getResultEmoji()}
            title={getResultTitle()}
            message={getResultMessage()}
          />

          <ScoreSummaryCard
            percentage={percentage}
            correctCount={correctCount}
            totalCount={totalCount}
          />

          {isPassed && quiz && (
            <RewardsSummaryCard
              coins={earnedCoins}
              exp={earnedExp}
              originalCoins={boostedCoinsBase}
              originalExp={boostedExpBase}
              isReducedReward={isReducedReward}
            />
          )}

          <ResultActions
            canRetake={Boolean(quiz && canRetake)}
            retryLabel={resolvedAttempt === 1 ? 'Навчальна перездача' : 'Спробувати ще раз'}
            onRetry={() => router.replace(`/quiz-play/${quiz.id}` as any)}
            onHome={() => router.replace('/(tabs)')}
          />
        </ScrollContent>
      </SafeArea>
    </Container>
  );
}
