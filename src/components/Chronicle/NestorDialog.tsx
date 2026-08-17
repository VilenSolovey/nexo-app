import React, { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@nexo/contexts/AppThemeProvider";

const TYPE_CHUNK_SIZE = 1;
const TYPE_INTERVAL_MS = 16;

type Props = {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss: () => void;
  mode?: "discovery" | "spark" | "archive";
  mood?: "neutral" | "happy" | "focused";
};

export function NestorDialog({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
  mode = "archive",
  mood,
}: Props) {
  const theme = useAppTheme();
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const resolvedMood = mood ?? (mode === "spark" ? "focused" : "neutral");
  const isTyping = visible && visibleCharacters < message.length;
  const typedMessage = message.slice(0, visibleCharacters);
  const icon =
    resolvedMood === "focused"
      ? "flash-outline"
      : resolvedMood === "happy"
        ? "sparkles-outline"
        : mode === "discovery"
          ? "search-outline"
          : "file-tray-outline";
  const avatarSource = useMemo(() => {
    if (resolvedMood === "happy")
      return require("../../../assets/images/nestor-happy.png");
    if (resolvedMood === "focused")
      return require("../../../assets/images/nestor-focused.png");
    return require("../../../assets/images/nestor-neutral.png");
  }, [resolvedMood]);

  useEffect(() => {
    setVisibleCharacters(
      visible ? Math.min(TYPE_CHUNK_SIZE, message.length) : 0,
    );
  }, [message, visible]);

  useEffect(() => {
    if (!visible || visibleCharacters >= message.length) return;

    const timer = setTimeout(() => {
      setVisibleCharacters((current) =>
        Math.min(current + TYPE_CHUNK_SIZE, message.length),
      );
    }, TYPE_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [message.length, visible, visibleCharacters]);

  const revealMessage = () => setVisibleCharacters(message.length);

  const handlePrimary = () => {
    if (isTyping) {
      revealMessage();
      return;
    }
    onDismiss();
    onPrimary();
  };

  const handleSecondary = () => {
    if (isTyping) {
      revealMessage();
      return;
    }
    onDismiss();
    onSecondary?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: theme.card, borderColor: `${theme.primary}54` },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View
            style={[
              styles.avatarAura,
              {
                backgroundColor: `${theme.primary}18`,
                borderColor: `${theme.primary}42`,
              },
            ]}
          >
            <Image
              source={avatarSource}
              style={styles.avatarImage}
              resizeMode="contain"
            />
            <View
              style={[styles.activityMark, { backgroundColor: theme.primary }]}
            >
              <Ionicons name={icon} size={13} color={theme.background} />
            </View>
          </View>

          <View style={styles.identity}>
            <Text style={[styles.name, { color: theme.text }]}>Нестор</Text>
            <Text style={[styles.role, { color: theme.primary }]}>
              НАВІГАТОР АРХІВУ
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isTyping ? "Показати повідомлення повністю" : undefined
            }
            onPress={revealMessage}
            style={[
              styles.messageCard,
              {
                backgroundColor: `${theme.primary}0d`,
                borderColor: `${theme.primary}2d`,
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <View style={styles.messageBody}>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.message, styles.messageSizer]}
              >
                {message}
              </Text>
              <Text
                style={[
                  styles.message,
                  styles.typedMessage,
                  { color: theme.textSecondary },
                ]}
              >
                {typedMessage}
                {isTyping ? (
                  <Text style={{ color: theme.primary }}>▍</Text>
                ) : null}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handlePrimary}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.primaryText, { color: theme.background }]}>
              {primaryLabel}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={theme.background} />
          </Pressable>

          {secondaryLabel ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleSecondary}
              style={styles.secondaryButton}
            >
              <Text
                style={[styles.secondaryText, { color: theme.textSecondary }]}
              >
                {secondaryLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(3, 10, 8, 0.76)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 410,
    alignSelf: "center",
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 62,
    paddingBottom: 20,
  },
  avatarAura: {
    position: "absolute",
    top: -50,
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 110, height: 110 },
  activityMark: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { alignItems: "center" },
  name: { fontSize: 20, fontWeight: "900" },
  role: { fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 3 },
  messageCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    minHeight: 116,
  },
  title: { fontSize: 19, lineHeight: 25, fontWeight: "900" },
  messageBody: { position: "relative", marginTop: 8 },
  message: { fontSize: 15, lineHeight: 22 },
  messageSizer: { opacity: 0 },
  typedMessage: { position: "absolute", top: 0, right: 0, left: 0 },
  primaryButton: {
    minHeight: 54,
    borderRadius: 17,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryText: { fontSize: 14, fontWeight: "800" },
});
