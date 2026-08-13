import React, { useCallback, useMemo, useState } from 'react'
import { Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Avatar } from '@nexo/components/Home/Avatar'
import { NexonsIcon } from '@nexo/components/Currency/NexonsIcon'
import {
  AvatarPreview,
  BackButton,
  BalancePill,
  BalanceValue,
  CosmeticCard,
  CosmeticCopy,
  CosmeticDescription,
  CosmeticFooter,
  CosmeticsList,
  CosmeticTitle,
  ContentScroll,
  CountPill,
  CountText,
  GearCard,
  GearEffect,
  GearFooter,
  GearIcon,
  GearRow,
  GearTitle,
  HeaderCopy,
  HeaderEyebrow,
  HeaderTitle,
  HeroBadge,
  HeroBadgeText,
  HeroCopy,
  HeroMessage,
  HeroTitle,
  ModalActions,
  ModalButton,
  ModalButtonText,
  ModalCard,
  ModalDescription,
  ModalEyebrow,
  ModalIcon,
  ModalOverlay,
  ModalSummary,
  ModalTitle,
  NestorImage,
  OwnedLabel,
  PreviewAccent,
  PreviewCard,
  PreviewTopLine,
  PriceGroup,
  PriceText,
  SafeAreaShell,
  ScreenGradient,
  Section,
  SectionHeader,
  SectionIcon,
  SectionSubtitle,
  SectionTitle,
  SectionTitleRow,
  SmallBadge,
  SmallBadgeText,
  SummaryLabel,
  SummaryRow,
  SummaryValue,
  ThemePreview,
  TopBar,
  WorkshopHero,
} from '@nexo/components/Shop/Shop.styled'
import {
  SHOP_AVATAR_ITEMS,
  SHOP_GEAR_ITEMS,
  SHOP_THEME_ITEMS,
  type ShopItem,
  type ShopItemIcon,
} from '@nexo/constants/shop'
import { getThemeOption } from '@nexo/constants/themes'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { purchaseShopItem } from '@nexo/services/shop.service'
import { getAvatarSeed } from '@nexo/utils/profile-customization'

const nestorSource = require('../../assets/images/nestor-focused.png')

type OwnedCountGetter = (item: ShopItem) => number
type OpenPurchaseHandler = (item: ShopItem) => void

export default function ShopScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const { userId, userProfile, refreshUserProfile } = useAuth()
  const { showModal, showToast } = useFeedback()
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const userCoins = userProfile?.coins ?? 0
  const inventory = useMemo(() => new Set(userProfile?.inventory ?? []), [userProfile?.inventory])
  const consumables = useMemo(() => userProfile?.consumables ?? {}, [userProfile?.consumables])

  const getOwnedCount = useCallback((item: ShopItem) => {
    if (item.type === 'cosmetic') {
      return inventory.has(item.id) ? 1 : 0
    }

    return Math.max(0, Number(consumables[item.id] ?? 0))
  }, [consumables, inventory])

  const openPurchase = useCallback((item: ShopItem) => {
    if (!userId) {
      showModal({
        type: 'warning',
        title: 'Потрібен акаунт',
        message: 'Увійдіть в акаунт, щоб користуватися Майстернею.',
      })
      return
    }

    const ownedCount = getOwnedCount(item)
    if (item.type === 'cosmetic' && ownedCount > 0) {
      showToast({ type: 'info', message: 'Цей предмет уже є у вашій колекції.' })
      return
    }

    if (item.maxOwned && ownedCount >= item.maxOwned) {
      showToast({
        type: 'info',
        message: `Рюкзак заповнений: максимум ${item.maxOwned} шт.`,
      })
      return
    }

    if (userCoins < item.price) {
      showToast({
        type: 'warning',
        message: `Не вистачає ${item.price - userCoins} Nexons.`,
      })
      return
    }

    setSelectedItem(item)
  }, [getOwnedCount, showModal, showToast, userCoins, userId])

  const confirmPurchase = useCallback(async () => {
    if (!selectedItem || !userId || isPurchasing) return

    const purchasedItem = selectedItem
    try {
      setIsPurchasing(true)
      await purchaseShopItem(purchasedItem.id)
      await refreshUserProfile()
      setSelectedItem(null)

      showToast({
        type: 'success',
        message:
          purchasedItem.type === 'cosmetic'
            ? `${purchasedItem.name} додано до колекції.`
            : `${purchasedItem.name} додано до рюкзака.`,
      })
    } catch (error) {
      showModal({
        type: 'error',
        title: 'Не вдалося завершити покупку',
        message: error instanceof Error ? error.message : 'Спробуйте ще раз трохи пізніше.',
      })
    } finally {
      setIsPurchasing(false)
    }
  }, [isPurchasing, refreshUserProfile, selectedItem, showModal, showToast, userId])

  const closePurchaseModal = useCallback(() => {
    if (!isPurchasing) setSelectedItem(null)
  }, [isPurchasing])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  return (
    <ScreenGradient colors={[theme.background, theme.card]}>
      <SafeAreaShell edges={['top']}>
        <TopBar>
          <BackButton accessibilityRole="button" accessibilityLabel="Назад" onPress={handleBack}>
            <Ionicons name="chevron-back" size={23} color={theme.text} />
          </BackButton>

          <HeaderCopy>
            <HeaderEyebrow>ЕКСПЕДИЦІЙНЕ СХОВИЩЕ</HeaderEyebrow>
            <HeaderTitle>Майстерня Нестора</HeaderTitle>
          </HeaderCopy>

          <BalancePill>
            <NexonsIcon size={21} />
            <BalanceValue numberOfLines={1}>{userCoins}</BalanceValue>
          </BalancePill>
        </TopBar>

        <ContentScroll>
          <ShopHero />
          <GearSection
            userCoins={userCoins}
            getOwnedCount={getOwnedCount}
            onOpenPurchase={openPurchase}
          />
          <ThemeSection
            userCoins={userCoins}
            getOwnedCount={getOwnedCount}
            onOpenPurchase={openPurchase}
          />
          <AvatarSection
            userCoins={userCoins}
            getOwnedCount={getOwnedCount}
            onOpenPurchase={openPurchase}
          />
        </ContentScroll>

        <PurchaseModal
          item={selectedItem}
          coins={userCoins}
          ownedCount={selectedItem ? getOwnedCount(selectedItem) : 0}
          isPurchasing={isPurchasing}
          onClose={closePurchaseModal}
          onConfirm={confirmPurchase}
        />
      </SafeAreaShell>
    </ScreenGradient>
  )
}

function ShopHero() {
  const theme = useAppTheme()

  return (
    <WorkshopHero colors={[theme.cardBackground, theme.shopCard]}>
      <HeroCopy>
        <HeroBadge>
          <Ionicons name="construct-outline" size={13} color={theme.primary} />
          <HeroBadgeText>НЕСТОР · МАЙСТЕРНЯ</HeroBadgeText>
        </HeroBadge>
        <HeroTitle>Спорядження для відновлення історії</HeroTitle>
        <HeroMessage>
          Я зібрав лише те, що допоможе в експедиції, але не виконає роботу за тебе.
        </HeroMessage>
      </HeroCopy>
      <NestorImage source={nestorSource} resizeMode="contain" />
    </WorkshopHero>
  )
}

function GearSection({
  userCoins,
  getOwnedCount,
  onOpenPurchase,
}: {
  userCoins: number
  getOwnedCount: OwnedCountGetter
  onOpenPurchase: OpenPurchaseHandler
}) {
  const theme = useAppTheme()

  return (
    <Section>
      <ShopSectionHeader
        icon="briefcase-outline"
        title="Польове спорядження"
        subtitle="Допомагає у Spark. У Trial спорядження не працює. У рюкзаку — максимум 3 кожного виду."
      />
      <GearRow>
        {SHOP_GEAR_ITEMS.map((item) => {
          const count = getOwnedCount(item)
          const full = count >= (item.maxOwned ?? Number.POSITIVE_INFINITY)
          const unavailable = full || userCoins < item.price

          return (
            <GearCard
              key={item.id}
              $disabled={unavailable}
              onPress={() => onOpenPurchase(item)}
            >
              <GearIcon>
                <Ionicons name={item.icon} size={23} color={theme.primary} />
              </GearIcon>
              <GearTitle numberOfLines={2}>{item.name}</GearTitle>
              <GearEffect numberOfLines={2}>{item.effect}</GearEffect>
              <GearFooter>
                <Price item={item} />
                <CountPill $full={full}>
                  <CountText $full={full}>
                    {count}/{item.maxOwned}
                  </CountText>
                </CountPill>
              </GearFooter>
            </GearCard>
          )
        })}
      </GearRow>
    </Section>
  )
}

function ThemeSection({
  userCoins,
  getOwnedCount,
  onOpenPurchase,
}: {
  userCoins: number
  getOwnedCount: OwnedCountGetter
  onOpenPurchase: OpenPurchaseHandler
}) {
  const theme = useAppTheme()

  return (
    <Section>
      <ShopSectionHeader
        icon="color-palette-outline"
        title="Оформлення Архіву"
        subtitle="Змінює атмосферу всього Nexo, не впливаючи на навчальний прогрес."
      />
      <CosmeticsList>
        {SHOP_THEME_ITEMS.map((item) => {
          const option = getThemeOption(item.id)
          const owned = getOwnedCount(item) > 0

          return (
            <CosmeticCard
              key={item.id}
              $owned={owned}
              $disabled={!owned && userCoins < item.price}
              onPress={() => onOpenPurchase(item)}
            >
              <ThemePreview colors={option.preview.colors}>
                <PreviewTopLine />
                <PreviewCard>
                  <PreviewAccent style={{ backgroundColor: option.preview.accent }} />
                </PreviewCard>
              </ThemePreview>
              <CosmeticCopy>
                <SmallBadge>
                  <SmallBadgeText>{item.featured ? 'ВИБІР НЕСТОРА' : 'ТЕМА АРХІВУ'}</SmallBadgeText>
                </SmallBadge>
                <CosmeticTitle>{item.name}</CosmeticTitle>
                <CosmeticDescription numberOfLines={2}>{item.description}</CosmeticDescription>
                <CosmeticFooter>
                  {owned ? <OwnedLabel>У колекції</OwnedLabel> : <Price item={item} />}
                  <Ionicons
                    name={owned ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={owned ? theme.success : theme.textSecondary}
                  />
                </CosmeticFooter>
              </CosmeticCopy>
            </CosmeticCard>
          )
        })}
      </CosmeticsList>
    </Section>
  )
}

function AvatarSection({
  userCoins,
  getOwnedCount,
  onOpenPurchase,
}: {
  userCoins: number
  getOwnedCount: OwnedCountGetter
  onOpenPurchase: OpenPurchaseHandler
}) {
  const theme = useAppTheme()

  return (
    <Section>
      <ShopSectionHeader
        icon="person-outline"
        title="Образ дослідника"
        subtitle="Постійні образи профілю, які залишаються у твоїй колекції."
      />
      <CosmeticsList>
        {SHOP_AVATAR_ITEMS.map((item) => {
          const owned = getOwnedCount(item) > 0

          return (
            <CosmeticCard
              key={item.id}
              $owned={owned}
              $disabled={!owned && userCoins < item.price}
              onPress={() => onOpenPurchase(item)}
            >
              <AvatarPreview>
                <Avatar seed={getAvatarSeed(item.id, 'nexo')} size={82} />
              </AvatarPreview>
              <CosmeticCopy>
                <SmallBadge>
                  <SmallBadgeText>КОЛЕКЦІЯ</SmallBadgeText>
                </SmallBadge>
                <CosmeticTitle>{item.name}</CosmeticTitle>
                <CosmeticDescription numberOfLines={2}>{item.description}</CosmeticDescription>
                <CosmeticFooter>
                  {owned ? <OwnedLabel>У колекції</OwnedLabel> : <Price item={item} />}
                  <Ionicons
                    name={owned ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={owned ? theme.success : theme.textSecondary}
                  />
                </CosmeticFooter>
              </CosmeticCopy>
            </CosmeticCard>
          )
        })}
      </CosmeticsList>
    </Section>
  )
}

function ShopSectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ShopItemIcon
  title: string
  subtitle: string
}) {
  const theme = useAppTheme()

  return (
    <SectionHeader>
      <SectionTitleRow>
        <SectionIcon>
          <Ionicons name={icon} size={16} color={theme.primary} />
        </SectionIcon>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleRow>
      <SectionSubtitle>{subtitle}</SectionSubtitle>
    </SectionHeader>
  )
}

function Price({ item }: { item: ShopItem }) {
  return (
    <PriceGroup>
      <NexonsIcon size={17} />
      <PriceText>{item.price}</PriceText>
    </PriceGroup>
  )
}

function PurchaseModal({
  item,
  coins,
  ownedCount,
  isPurchasing,
  onClose,
  onConfirm,
}: {
  item: ShopItem | null
  coins: number
  ownedCount: number
  isPurchasing: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const theme = useAppTheme()

  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <ModalOverlay>
        {item ? (
          <ModalCard>
            <ModalIcon>
              <Ionicons name={item.icon} size={31} color={theme.primary} />
            </ModalIcon>
            <ModalEyebrow>ПІДТВЕРДИТИ ОБМІН</ModalEyebrow>
            <ModalTitle>{item.name}</ModalTitle>
            <ModalDescription>{item.description}</ModalDescription>

            <ModalSummary>
              {item.type !== 'cosmetic' ? (
                <SummaryRow>
                  <SummaryLabel>У рюкзаку</SummaryLabel>
                  <SummaryValue>
                    {ownedCount} → {ownedCount + (item.uses ?? 1)} / {item.maxOwned}
                  </SummaryValue>
                </SummaryRow>
              ) : null}
              <SummaryRow>
                <SummaryLabel>Вартість</SummaryLabel>
                <SummaryValue>{item.price} Nexons</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Залишиться</SummaryLabel>
                <SummaryValue>{Math.max(0, coins - item.price)} Nexons</SummaryValue>
              </SummaryRow>
            </ModalSummary>

            <ModalActions>
              <ModalButton onPress={onClose} disabled={isPurchasing}>
                <ModalButtonText>Скасувати</ModalButtonText>
              </ModalButton>
              <ModalButton $primary onPress={onConfirm} disabled={isPurchasing}>
                <ModalButtonText $primary>
                  {isPurchasing ? 'Оформлюємо...' : 'Обміняти'}
                </ModalButtonText>
              </ModalButton>
            </ModalActions>
          </ModalCard>
        ) : null}
      </ModalOverlay>
    </Modal>
  )
}
