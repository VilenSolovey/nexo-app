import React from 'react'
import { Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppTheme } from '@nexo/contexts/AppThemeProvider'
import type { ChronicleFragment } from '@nexo/types/chronicle.types'
import { getArchiveMeta } from '@nexo/utils/chronicle-route'
import {
  ArchiveEntry,
  ArchiveEntryBody,
  ArchiveEntryIcon,
  ArchiveEntryTitle,
  ArchiveEntryType,
  ArchiveList,
  ArchiveModalContent,
  ArchiveWorkshopAvatar,
  ArchiveWorkshopCopy,
  ArchiveWorkshopNotice,
  ArchiveWorkshopText,
  ArchiveWorkshopTitle,
  CloseButton,
  Eyebrow,
  Header,
  ModalHeader,
  ModalOverlay,
  Subtitle,
  Title,
} from '@nexo/components/Chronicle/Chronicle.styled'

const nestorSource = require('../../../assets/images/nestor-focused.png')

type ChronicleArchiveModalProps = {
  visible: boolean
  fragments: ChronicleFragment[]
  discoveredFragmentIds: ReadonlySet<string>
  onClose: () => void
  onOpenFragment: (fragment: ChronicleFragment) => void
}

export function ChronicleArchiveModal({
  visible,
  fragments,
  discoveredFragmentIds,
  onClose,
  onOpenFragment,
}: ChronicleArchiveModalProps) {
  const theme = useAppTheme()
  const discoveredCount = fragments.filter((fragment) =>
    discoveredFragmentIds.has(fragment.id),
  ).length

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ArchiveModalContent>
          <ModalHeader>
            <Header style={{ flex: 1, marginBottom: 0 }}>
              <Eyebrow>Твоя колекція</Eyebrow>
              <Title style={{ fontSize: 24 }}>Архів епохи</Title>
              <Subtitle>{discoveredCount} з {fragments.length} знахідок відкрито</Subtitle>
            </Header>
            <CloseButton onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.text} />
            </CloseButton>
          </ModalHeader>

          <ArchiveList>
            <ArchiveWorkshopNotice>
              <ArchiveWorkshopAvatar source={nestorSource} resizeMode="contain" />
              <ArchiveWorkshopCopy>
                <ArchiveWorkshopTitle>Нестор готує реставраційну майстерню</ArchiveWorkshopTitle>
                <ArchiveWorkshopText>
                  Скоро відкриті портрети, документи й карти можна буде реставрувати за Nexons та виставляти у власній колекції.
                </ArchiveWorkshopText>
              </ArchiveWorkshopCopy>
            </ArchiveWorkshopNotice>

            {fragments.map((fragment) => {
              const discovered = discoveredFragmentIds.has(fragment.id)
              const meta = getArchiveMeta(fragment)

              return (
                <Pressable
                  key={fragment.id}
                  accessibilityRole={discovered ? 'button' : undefined}
                  accessibilityLabel={
                    discovered
                      ? `Відкрити запис ${fragment.title}`
                      : 'Невідома знахідка під туманом'
                  }
                  disabled={!discovered}
                  onPress={() => onOpenFragment(fragment)}
                >
                  <ArchiveEntry $locked={!discovered}>
                    <ArchiveEntryIcon $locked={!discovered}>
                      <Ionicons
                        name={discovered ? meta.icon : 'help-outline'}
                        size={19}
                        color={discovered ? theme.primary : theme.textTertiary}
                      />
                    </ArchiveEntryIcon>
                    <ArchiveEntryBody>
                      <ArchiveEntryType $locked={!discovered}>
                        {discovered ? meta.label : 'Слід приховано'}
                      </ArchiveEntryType>
                      <ArchiveEntryTitle $locked={!discovered}>
                        {discovered ? fragment.title : 'Невідома знахідка'}
                      </ArchiveEntryTitle>
                    </ArchiveEntryBody>
                    <Ionicons
                      name={discovered ? 'checkmark-circle' : 'cloud-outline'}
                      size={20}
                      color={discovered ? theme.success : theme.textTertiary}
                    />
                  </ArchiveEntry>
                </Pressable>
              )
            })}
          </ArchiveList>
        </ArchiveModalContent>
      </ModalOverlay>
    </Modal>
  )
}
