import { THEME_COSMETICS } from '@nexo/constants/themes'

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'powerup' | 'cosmetic' | 'booster';
  category: 'hints' | 'skip' | 'multiplier' | 'theme' | 'avatar';
  price: number;
  icon: string;
  effect?: string;
  uses?: number; 
}

const THEME_SHOP_ITEMS: ShopItem[] = THEME_COSMETICS.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  type: 'cosmetic',
  category: 'theme',
  price: item.price ?? 0,
  icon: item.icon,
  effect: item.effect,
}))

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hint_reveal',
    name: '💡 Підказка',
    description: 'Показати підказку для поточного питання',
    type: 'powerup',
    category: 'hints',
    price: 30,
    icon: 'bulb',
    effect: 'Отримайте підказку, яка допоможе з відповіддю',
    uses: 1,
  },
  {
    id: 'fifty_fifty',
    name: '✂️ 50/50',
    description: 'Видалити 2 неправильні відповіді',
    type: 'powerup',
    category: 'hints',
    price: 50,
    icon: 'cut',
    effect: 'Залишає тільки 2 варіанти відповіді',
    uses: 1,
  },
  {
    id: 'skip_question',
    name: '⏭️ Пропуск',
    description: 'Пропустити складне питання',
    type: 'powerup',
    category: 'skip',
    price: 40,
    icon: 'play-skip-forward',
    effect: 'Пропустіть питання без втрати балів',
    uses: 1,
  },
  {
    id: 'time_freeze',
    name: '⏸️ Заморозка часу',
    description: 'Додатково +30 секунд на питання',
    type: 'powerup',
    category: 'skip',
    price: 35,
    icon: 'time',
    effect: 'Отримайте більше часу для роздумів',
    uses: 1,
  },
  {
    id: 'answer_reveal',
    name: '🎯 Правильна відповідь',
    description: 'Показати правильну відповідь',
    type: 'powerup',
    category: 'hints',
    price: 100,
    icon: 'checkmark-done-circle',
    effect: 'Миттєво дізнайтесь правильну відповідь',
    uses: 1,
  },
  
  {
    id: 'double_coins',
    name: '💰 Подвійні монети',
    description: 'Отримуйте x2 Nexons за вікторину',
    type: 'booster',
    category: 'multiplier',
    price: 150,
    icon: 'cash',
    effect: 'Подвоює винагороду за вікторину',
    uses: 3,
  },
  {
    id: 'double_exp',
    name: '⭐ Подвійний досвід',
    description: 'Отримуйте x2 EXP за вікторину',
    type: 'booster',
    category: 'multiplier',
    price: 150,
    icon: 'star',
    effect: 'Подвоює досвід за вікторину',
    uses: 3,
  },
  
  ...THEME_SHOP_ITEMS,
  {
    id: 'avatar_scholar',
    name: '🎓 Аватар Вчений',
    description: 'Ексклюзивний аватар для профілю',
    type: 'cosmetic',
    category: 'avatar',
    price: 300,
    icon: 'school',
    effect: 'Покажіть свою ерудованість',
  },
  {
    id: 'avatar_champion',
    name: '👑 Аватар Чемпіон',
    description: 'Легендарний аватар переможця',
    type: 'cosmetic',
    category: 'avatar',
    price: 1000,
    icon: 'trophy',
    effect: 'Тільки для найкращих!',
  },
];

export const SHOP_CATEGORIES = [
  { id: 'all', name: 'Всі', icon: 'grid' },
  { id: 'hints', name: 'Підказки', icon: 'bulb' },
  { id: 'skip', name: 'Пропуски', icon: 'play-skip-forward' },
  { id: 'multiplier', name: 'Бустери', icon: 'flash' },
  { id: 'theme', name: 'Теми', icon: 'color-palette' },
  { id: 'avatar', name: 'Аватари', icon: 'person' },
];
