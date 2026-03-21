import React, { useMemo, useState } from 'react'
import { Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  BalanceCard,
  BalanceValue,
  CardFooter,
  CategoriesScroll,
  CategoryChip,
  CategoryText,
  CornerBadge,
  CountTag,
  CountText,
  Header,
  HeaderCopy,
  HeaderSubtitle,
  HeaderTitle,
  IconWrap,
  ItemCard,
  ItemDescription,
  ItemEffect,
  ItemsGrid,
  ItemsScroll,
  ItemTitle,
  ModalActions,
  ModalButton,
  ModalButtonText,
  ModalCard,
  ModalDescription,
  ModalIconWrap,
  ModalInfoLabel,
  ModalInfoRow,
  ModalInfoValue,
  ModalItemName,
  ModalOverlay,
  ModalTitle,
  OwnedTag,
  OwnedTagText,
  PriceTag,
  PriceText,
  SafeAreaShell,
  ScreenGradient,
} from '@nexo/components/Shop/Shop.styled'
import { SHOP_CATEGORIES, SHOP_ITEMS, type ShopItem } from '@nexo/constants/shop'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { db } from '@nexo/services/firebase'
import { registerDailyActivity } from '@nexo/services/user.service'
import { doc, runTransaction } from 'firebase/firestore'

export default function ShopScreen() {
  const Theme = useAppTheme()
  const { userProfile, refreshUserProfile } = useAuth()
  const userId = userProfile?.uid ?? userProfile?.id
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const userCoins = userProfile?.coins ?? 0
  const userInventory = userProfile?.inventory ?? []
  const userConsumables = userProfile?.consumables ?? {}

  const filteredItems = useMemo(
    () =>
      SHOP_ITEMS.filter((item) => selectedCategory === "all" || item.category === selectedCategory),
    [selectedCategory],
  )

  const getOwnedCount = (item: ShopItem) => {
    if (item.type === "cosmetic") {
      return userInventory.includes(item.id) ? 1 : 0
    }

    const consumableCount = Number(userConsumables[item.id] ?? 0)
    const legacyCount = userInventory.includes(item.id) ? 1 : 0
    return consumableCount + legacyCount
  }

  const isOwnedCosmetic = (item: ShopItem) => item.type === "cosmetic" && getOwnedCount(item) > 0

  const handlePurchase = (item: ShopItem) => {
    if (!userId) {
      Alert.alert('Потрібен акаунт', 'Увійдіть в акаунт, щоб купувати предмети.')
      return
    }

    if (item.type === "cosmetic" && isOwnedCosmetic(item)) {
      Alert.alert('Уже у власності', 'Цей предмет у вас уже відкритий.')
      return
    }

    if (userCoins < item.price) {
      Alert.alert('Недостатньо Nexons', 'Потрібно більше монет для цієї покупки.')
      return
    }

    setSelectedItem(item)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!selectedItem || !userId) return

    try {
      setIsPurchasing(true)

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId)
        const userSnap = await transaction.get(userRef)

        if (!userSnap.exists()) {
          throw new Error('User profile not found')
        }

        const data = userSnap.data()
        const currentCoins = Number(data.coins ?? 0)
        const inventory = Array.isArray(data.inventory) ? data.inventory.map(String) : []
        const consumables =
          typeof data.consumables === 'object' && data.consumables !== null
            ? (data.consumables as Record<string, unknown>)
            : {}

        if (currentCoins < selectedItem.price) {
          throw new Error('Недостатньо Nexons')
        }

        if (selectedItem.type === "cosmetic") {
          if (inventory.includes(selectedItem.id)) {
            throw new Error('Предмет уже куплений')
          }

          transaction.update(userRef, {
            coins: currentCoins - selectedItem.price,
            inventory: [...inventory, selectedItem.id],
          })

          return
        }

        const currentCount = Number(consumables[selectedItem.id] ?? 0)
        transaction.update(userRef, {
          coins: currentCoins - selectedItem.price,
          [`consumables.${selectedItem.id}`]: currentCount + (selectedItem.uses ?? 1),
        })
      })

      await registerDailyActivity(userId)
      await refreshUserProfile()

      setShowPurchaseModal(false)
      setSelectedItem(null)

      const amountLabel =
        selectedItem.type === 'cosmetic'
          ? 'Предмет доступний у профілі.'
          : `Додано ${selectedItem.uses ?? 1} використ.`

      Alert.alert('Покупка успішна', `${selectedItem.name}\n${amountLabel}`)
    } catch (error: any) {
      Alert.alert('Помилка покупки', error?.message ?? 'Не вдалося завершити покупку.')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <ScreenGradient colors={[Theme.background, Theme.card]}>
      <SafeAreaShell edges={['top']}>
        <Header>
          <HeaderCopy>
            <HeaderTitle>Магазин</HeaderTitle>
            <HeaderSubtitle>Купуй power-up-и, бустери та косметику</HeaderSubtitle>
          </HeaderCopy>

          <BalanceCard>
            <Ionicons name="cash-outline" size={18} color={Theme.coin} />
            <BalanceValue>{userCoins}</BalanceValue>
          </BalanceCard>
        </Header>

        <CategoriesScroll>
          {SHOP_CATEGORIES.map((category) => {
            const active = selectedCategory === category.id

            return (
              <CategoryChip
                key={category.id}
                $active={active}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={active ? Theme.background : Theme.textSecondary}
                />
                <CategoryText $active={active}>{category.name}</CategoryText>
              </CategoryChip>
            )
          })}
        </CategoriesScroll>

        <ItemsScroll>
          <ItemsGrid>
            {filteredItems.map((item) => {
              const ownedCount = getOwnedCount(item)
              const ownedCosmetic = isOwnedCosmetic(item)
              const canAfford = userCoins >= item.price

              return (
                <ItemCard
                  key={item.id}
                  $owned={ownedCosmetic}
                  $locked={!canAfford}
                  onPress={() => handlePurchase(item)}
                >
                  {ownedCosmetic ? (
                    <CornerBadge>
                      <Ionicons name="checkmark-circle" size={18} color={Theme.success} />
                    </CornerBadge>
                  ) : null}

                  <IconWrap>
                    <Ionicons name={item.icon as any} size={28} color={Theme.primary} />
                  </IconWrap>

                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemDescription numberOfLines={3}>{item.description}</ItemDescription>

                  {item.effect ? (
                    <ItemEffect numberOfLines={2}>{item.effect}</ItemEffect>
                  ) : null}

                  <CardFooter>
                    {item.type === 'cosmetic' ? (
                      ownedCosmetic ? (
                        <OwnedTag>
                          <OwnedTagText>У власності</OwnedTagText>
                        </OwnedTag>
                      ) : (
                        <PriceTag>
                          <Ionicons name="cash-outline" size={14} color={Theme.coin} />
                          <PriceText>{item.price}</PriceText>
                        </PriceTag>
                      )
                    ) : (
                      <>
                        <PriceTag>
                          <Ionicons name="cash-outline" size={14} color={Theme.coin} />
                          <PriceText>{item.price}</PriceText>
                        </PriceTag>
                        <CountTag>
                          <CountText>x{ownedCount}</CountText>
                        </CountTag>
                      </>
                    )}
                  </CardFooter>
                </ItemCard>
              )
            })}
          </ItemsGrid>
        </ItemsScroll>

        <Modal
          visible={showPurchaseModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPurchaseModal(false)}
        >
          <ModalOverlay>
            <ModalCard>
              {selectedItem ? (
                <>
                  <ModalIconWrap>
                    <Ionicons name={selectedItem.icon as any} size={36} color={Theme.primary} />
                  </ModalIconWrap>

                  <ModalTitle>Підтвердити покупку</ModalTitle>
                  <ModalItemName>{selectedItem.name}</ModalItemName>
                  <ModalDescription>{selectedItem.description}</ModalDescription>

                  <ModalInfoRow>
                    <ModalInfoLabel>Ціна</ModalInfoLabel>
                    <ModalInfoValue>{selectedItem.price} Nexons</ModalInfoValue>
                  </ModalInfoRow>

                  {selectedItem.type !== 'cosmetic' ? (
                    <ModalInfoRow>
                      <ModalInfoLabel>Отримаєш</ModalInfoLabel>
                      <ModalInfoValue>+{selectedItem.uses ?? 1} використ.</ModalInfoValue>
                    </ModalInfoRow>
                  ) : null}

                  <ModalInfoRow>
                    <ModalInfoLabel>Після покупки</ModalInfoLabel>
                    <ModalInfoValue>{Math.max(userCoins - selectedItem.price, 0)}</ModalInfoValue>
                  </ModalInfoRow>

                  <ModalActions>
                    <ModalButton
                      $variant="secondary"
                      onPress={() => setShowPurchaseModal(false)}
                    >
                      <ModalButtonText $variant="secondary">Скасувати</ModalButtonText>
                    </ModalButton>

                    <ModalButton
                      $variant="primary"
                      onPress={confirmPurchase}
                      disabled={isPurchasing}
                    >
                      <ModalButtonText $variant="primary">
                        {isPurchasing ? 'Купуємо...' : 'Купити'}
                      </ModalButtonText>
                    </ModalButton>
                  </ModalActions>
                </>
              ) : null}
            </ModalCard>
          </ModalOverlay>
        </Modal>
      </SafeAreaShell>
    </ScreenGradient>
  )
}
