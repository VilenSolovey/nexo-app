import React, { useState } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { Theme } from '@nexo/constants/theme'
import { AuthButton } from '@nexo/components/Auth/AuthButton'
import { AuthLayout } from '@nexo/components/Auth/AuthLayout'
import { AuthHeader } from '@nexo/components/Auth/AuthHeader'
import { AuthLink } from '@nexo/components/Auth/AuthLink'
import {
  AuthForm,
  AuthInputContainer,
} from '@nexo/components/Auth/AuthGeneral.styled'
import {
  AuthInputIcon,
  AuthInput,
} from '@nexo/components/Auth/AuthGeneral.styled'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { signInEmail } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля')
      return
    }

    setLoading(true)
    try {
      await signInEmail(email, password)
      router.push('/(tabs)')
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося увійти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Авторизація"
        subtitle="Вітаємо знову!"
      />

      <AuthForm>
        <AuthInputContainer>
          <AuthInputIcon
            name="mail-outline"
            size={24}
            color={Theme.textSecondary}
          />
          <AuthInput
            placeholder="Електронна пошта"
            placeholderTextColor={Theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </AuthInputContainer>

        <AuthInputContainer>
          <AuthInputIcon
            name="lock-closed-outline"
            size={24}
            color={Theme.textSecondary}
          />
          <AuthInput
            placeholder="Пароль"
            placeholderTextColor={Theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </AuthInputContainer>

        <AuthButton onPress={handleLogin} disabled={loading}>
         {loading ? 'Завантаження...' : 'Увійти'}
        </AuthButton>

        <AuthLink
          text="Немає акаунту?"
          action="Зареєструватися"
          onPress={() => router.push('/(public)/register')}
        />
      </AuthForm>
    </AuthLayout>
  )
}