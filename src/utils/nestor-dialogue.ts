export type NestorMood = 'neutral' | 'happy' | 'focused'
export type NestorMode = 'discovery' | 'spark' | 'archive'
export type NestorEvent =
  | 'fragment_discovered'
  | 'theory_completed'
  | 'spark_ready'
  | 'trial_ready'
  | 'challenge_passed'
  | 'challenge_failed'
  | 'discovery_search_started'
  | 'reconstruction_ready'
  | 'discovery_ready'
  | 'chapter_completed'

type DialogueContext = {
  recordTitle?: string
  readyAtLabel?: string
}

export type NestorDialogue = {
  title: string
  message: string
  mode: NestorMode
  mood: NestorMood
}

export function getNestorDialogue(event: NestorEvent, context: DialogueContext = {}): NestorDialogue {
  const record = context.recordTitle ? ` «${context.recordTitle}»` : ''

  switch (event) {
    case 'fragment_discovered':
      return {
        title: context.recordTitle ?? 'Знайдено новий запис',
        message: `У Архіві з’явився новий слід${record}. Досліди його, щоб зрозуміти, як він змінює хід епохи.`,
        mode: 'discovery',
        mood: 'neutral',
      }
    case 'theory_completed':
      return {
        title: 'Матеріал досліджено',
        message: `Тепер перевіримо, чи зможеш відновити запис${record} без підказок.`,
        mode: 'spark',
        mood: 'focused',
      }
    case 'spark_ready':
      return {
        title: 'Spark готовий до запуску',
        message: `Запис${record} чекає на підтвердження. Відповідай уважно — це відкриє наступний слід.`,
        mode: 'spark',
        mood: 'focused',
      }
    case 'trial_ready':
      return {
        title: 'Архів готовий до Trial',
        message: 'Ти відновив усі потрібні записи. Тепер збереш їх в одну історичну картину.',
        mode: 'spark',
        mood: 'focused',
      }
    case 'challenge_passed':
      return {
        title: 'Фрагмент відновлено',
        message: 'Чудова робота. Результат збережено в Архіві, а маршрут епохи оновлено.',
        mode: 'archive',
        mood: 'happy',
      }
    case 'challenge_failed':
      return {
        title: 'Запис ще потребує уточнення',
        message: 'Це нормально: переглянь пояснення до відповідей і спробуй ще раз. Архів нікуди не зникне.',
        mode: 'spark',
        mood: 'focused',
      }
    case 'discovery_search_started':
      return {
        title: 'Новий слід знайдено',
        message: `Запис підтверджено. У ньому є слід до наступного фрагмента. Я вирушаю на пошуки${context.readyAtLabel ? ` і повернуся ${context.readyAtLabel}` : ''}.`,
        mode: 'discovery',
        mood: 'focused',
      }
    case 'reconstruction_ready':
      return {
        title: 'Сліди треба з’єднати',
        message: 'Цей запис відновлено, але наступний маршрут розірваний. Повернися до Хроніки — разом складемо знайдені матеріали у цілісну справу.',
        mode: 'archive',
        mood: 'focused',
      }
    case 'discovery_ready':
      return {
        title: context.recordTitle ?? 'Нестор повернувся',
        message: `Я повернувся. Слід привів до нового запису${record}. Матеріал пошкоджений, але тепер ми можемо почати його відновлення.`,
        mode: 'discovery',
        mood: 'happy',
      }
    case 'chapter_completed':
      return {
        title: 'Епоху підтверджено',
        message: 'Ти зібрав цілісну картину. Відновлений Архів цієї епохи тепер збережено назавжди.',
        mode: 'archive',
        mood: 'happy',
      }
  }
}
