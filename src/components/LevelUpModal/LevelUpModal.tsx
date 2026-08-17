import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'

type LevelUpState = {
  previousLevel: number
  nextLevel: number
}

type LevelUpModalProps = {
  levelUp: LevelUpState | null
  onClose: () => void
}

export function LevelUpModal({ levelUp, onClose }: LevelUpModalProps) {
  const Theme = useAppTheme()

  return (
    <Modal
      visible={Boolean(levelUp)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: Theme.card,
              borderColor: '#5B4A8A',
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              {
                borderColor: `${Theme.exp}42`,
                backgroundColor: `${Theme.exp}24`,
              },
            ]}
          >
            <Ionicons name="sparkles" size={28} color={Theme.exp} />
          </View>
          <Text style={[styles.title, { color: Theme.text }]}>Новий рівень!</Text>
          <Text style={[styles.levelText, { color: Theme.exp }]}>
            Рівень {levelUp?.nextLevel ?? 1}
          </Text>
          <Text style={[styles.subtitle, { color: Theme.textSecondary }]}>
            Ви піднялися з {levelUp?.previousLevel ?? 1} на {levelUp?.nextLevel ?? 1} рівень
          </Text>
          <Pressable style={[styles.button, { backgroundColor: Theme.exp }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: Theme.background }]}>Круто</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 12, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
  },
  levelText: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
})
