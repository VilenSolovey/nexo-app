import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import { THEME_COSMETICS } from '@nexo/constants/themes'

export type ShopItemType = 'powerup' | 'cosmetic' | 'booster'
export type ShopItemCategory = 'gear' | 'theme' | 'avatar' | 'legacy'
export type ShopItemIcon = ComponentProps<typeof Ionicons>['name']

export interface ShopItem {
  id: string
  name: string
  description: string
  type: ShopItemType
  category: ShopItemCategory
  price: number
  icon: ShopItemIcon
  effect?: string
  uses?: number
  maxOwned?: number
  availableForPurchase?: boolean
  featured?: boolean
}

const THEME_SHOP_ITEMS: ShopItem[] = THEME_COSMETICS.map((item, index) => ({
  id: item.id,
  name: item.name.replace(/^[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]+/, ''),
  description: item.description,
  type: 'cosmetic',
  category: 'theme',
  price: item.price ?? 0,
  icon: item.icon as ShopItemIcon,
  effect: item.effect,
  availableForPurchase: true,
  featured: index === THEME_COSMETICS.length - 1,
}))

const ACTIVE_GEAR: ShopItem[] = [
  {
    id: 'hint_reveal',
    name: 'Польова нотатка',
    description: 'Відкриває пояснення, яке допоможе пригадати матеріал.',
    type: 'powerup',
    category: 'gear',
    price: 18,
    icon: 'document-text-outline',
    effect: 'Підказка до одного питання',
    uses: 1,
    maxOwned: 3,
    availableForPurchase: true,
  },
  {
    id: 'fifty_fifty',
    name: 'Відсів версій',
    description: 'Прибирає два неправильні варіанти відповіді.',
    type: 'powerup',
    category: 'gear',
    price: 24,
    icon: 'git-compare-outline',
    effect: 'Працює у Spark із варіантами',
    uses: 1,
    maxOwned: 3,
    availableForPurchase: true,
  },
  {
    id: 'time_freeze',
    name: 'Запас часу',
    description: 'Додає ще 30 секунд, щоб спокійно обдумати відповідь.',
    type: 'powerup',
    category: 'gear',
    price: 14,
    icon: 'hourglass-outline',
    effect: '+30 секунд до таймера',
    uses: 1,
    maxOwned: 3,
    availableForPurchase: true,
  },
]

const LEGACY_POWER_UPS: ShopItem[] = [
  {
    id: 'skip_question',
    name: 'Пропуск',
    description: 'Архівний предмет, який більше не продається.',
    type: 'powerup',
    category: 'legacy',
    price: 0,
    icon: 'play-skip-forward-outline',
    uses: 1,
    availableForPurchase: false,
  },
  {
    id: 'answer_reveal',
    name: 'Правильна відповідь',
    description: 'Архівний предмет, який більше не продається.',
    type: 'powerup',
    category: 'legacy',
    price: 0,
    icon: 'checkmark-done-circle-outline',
    uses: 1,
    availableForPurchase: false,
  },
  {
    id: 'double_coins',
    name: 'Подвійні Nexons',
    description: 'Архівний бустер, який більше не продається.',
    type: 'booster',
    category: 'legacy',
    price: 0,
    icon: 'cash-outline',
    uses: 1,
    availableForPurchase: false,
  },
  {
    id: 'double_exp',
    name: 'Подвійний досвід',
    description: 'Архівний бустер, який більше не продається.',
    type: 'booster',
    category: 'legacy',
    price: 0,
    icon: 'star-outline',
    uses: 1,
    availableForPurchase: false,
  },
  {
    id: 'lucky_charm',
    name: 'Талісман',
    description: 'Архівний бустер, який більше не продається.',
    type: 'booster',
    category: 'legacy',
    price: 0,
    icon: 'sparkles-outline',
    uses: 1,
    availableForPurchase: false,
  },
]

const AVATAR_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'avatar_scholar',
    name: 'Дослідник',
    description: 'Образ для тих, хто відновлює Архів уважно й послідовно.',
    type: 'cosmetic',
    category: 'avatar',
    price: 180,
    icon: 'school-outline',
    effect: 'Новий образ профілю',
    availableForPurchase: true,
  },
  {
    id: 'avatar_champion',
    name: 'Хранитель',
    description: 'Рідкісний образ досвідченого хранителя історії.',
    type: 'cosmetic',
    category: 'avatar',
    price: 650,
    icon: 'shield-checkmark-outline',
    effect: 'Престижний образ профілю',
    availableForPurchase: true,
  },
]

export const SHOP_ITEMS: ShopItem[] = [
  ...ACTIVE_GEAR,
  ...THEME_SHOP_ITEMS,
  ...AVATAR_SHOP_ITEMS,
  ...LEGACY_POWER_UPS,
]

export const PURCHASABLE_SHOP_ITEMS = SHOP_ITEMS.filter(
  (item) => item.availableForPurchase === true,
)

export const SHOP_GEAR_ITEMS = PURCHASABLE_SHOP_ITEMS.filter(
  (item) => item.category === 'gear',
)

export const SHOP_THEME_ITEMS = PURCHASABLE_SHOP_ITEMS.filter(
  (item) => item.category === 'theme',
)

export const SHOP_AVATAR_ITEMS = PURCHASABLE_SHOP_ITEMS.filter(
  (item) => item.category === 'avatar',
)
