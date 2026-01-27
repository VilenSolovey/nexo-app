import { Redirect, useRouter } from 'expo-router'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { AuthLayout } from '@nexo/components/Auth/AuthLayout'
import { AuthHeader } from '@nexo/components/Auth/AuthHeader'
import { AuthButton } from '@nexo/components/Auth/AuthButton'
import { AuthLink } from '@nexo/components/Auth/AuthLink'
import { AuthFeature } from '@nexo/components/Auth/AuthFeature'
import styled from 'styled-components/native'

export const FeatureList = styled.View`
  margin: 32px 0;
  width: 100%;
`

export default function WelcomeScreen() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (!loading && user) {
    return <Redirect href="/(tabs)" />
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Вітаємо в Nexo"
        subtitle="Вивчайте та проходьте вікторини з нами"
      />

      <FeatureList>
        <AuthFeature
          icon="flash-outline"
          text="Грайте в щоденні вікторини"
        />
        <AuthFeature
          icon="trending-up-outline"
          text="Створюйте навчальні серії"
        />
        <AuthFeature
          icon="trophy-outline"
          text="Отримуйте нагороди та досягнення"
        />
      </FeatureList>

      <AuthButton onPress={() => router.push('/(public)/login')}>
        Увійти
      </AuthButton>

      <AuthLink
        text="Новий користувач?"
        action="Створити акаунт"
        onPress={() => router.push('/(public)/register')}
      />
    </AuthLayout>
  )
}