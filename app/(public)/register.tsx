import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@nexo/contexts/AuthProvider'
import { useFeedback } from '@nexo/contexts/FeedbackProvider'
import { Theme } from '@nexo/constants/theme'
import { AuthLayout } from '@nexo/components/Auth/AuthLayout'
import { AuthHeader } from '@nexo/components/Auth/AuthHeader'
import { AuthLink } from '@nexo/components/Auth/AuthLink'
import { AuthButton } from '@nexo/components/Auth/AuthButton'
import {
  AuthForm,
  AuthInputContainer,
} from '@nexo/components/Auth/AuthGeneral.styled'
import {
  AuthInputIcon,
  AuthInput,
} from '@nexo/components/Auth/AuthGeneral.styled'

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { showModal, showToast } = useFeedback()
  const router = useRouter()

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showToast({
        type: 'warning',
        message: 'Будь ласка, заповніть всі поля.',
      })
      return
    }

    if (password !== confirmPassword) {
      showToast({
        type: 'warning',
        message: 'Паролі не співпадають.',
      })
      return
    }

    if (password.length < 6) {
      showToast({
        type: 'warning',
        message: 'Пароль повинен бути мінімум 6 символів.',
      })
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, name)
      showToast({
        type: 'success',
        message: 'Акаунт створено. Тепер можна увійти.',
      })
      router.push('/(public)/login')
    } catch (error: any) {
      showModal({
        type: 'error',
        title: 'Не вдалося зареєструватися',
        message: error.message || 'Спробуйте ще раз трохи пізніше.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Реєстрація"
        subtitle="Приєднуйтесь до Nexo!"
      />

      <AuthForm>
        <AuthInputContainer>
          <AuthInputIcon
            name="person-outline"
            size={24}
            color={Theme.textSecondary}
          />
          <AuthInput
            placeholder="Ім'я"
            placeholderTextColor={Theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </AuthInputContainer>

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

        <AuthInputContainer>
          <AuthInputIcon
            name="lock-closed-outline"
            size={24}
            color={Theme.textSecondary}
          />
          <AuthInput
            placeholder="Підтвердіть пароль"
            placeholderTextColor={Theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </AuthInputContainer>

       <AuthButton onPress={handleRegister} disabled={loading}>
          {loading ? 'Завантаження...' : 'Зареєструватися'}
       </AuthButton>

        <AuthLink
          text="Вже є акаунт?"
          action="Увійти"
          onPress={() => router.push('/(public)/login')}
        />
      </AuthForm>
    </AuthLayout>
  )
}
