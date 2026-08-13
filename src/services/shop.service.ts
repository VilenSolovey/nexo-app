import { callAuthenticatedFunction } from '@nexo/services/authenticated-function.service'

export type PurchaseShopItemResult = {
  itemId: string
  itemType: 'consumable' | 'cosmetic'
  coins: number
  ownedCount: number
}

export function purchaseShopItem(itemId: string) {
  return callAuthenticatedFunction<{ itemId: string }, PurchaseShopItemResult>(
    'purchaseShopItemHttp',
    { itemId },
  )
}
