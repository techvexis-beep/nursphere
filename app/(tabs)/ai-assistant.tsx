import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { chatWithGemini } from '../../src/services/gemini';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import GlowGlass from '../../src/components/GlowGlass';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const suggestions = [
  'How do I register for the NMCN licensure exam?',
  'Give me a practice NCLEX-RN question',
  'What nursing specialty is in demand in Nigeria?',
  'Tips for surviving nursing school in Nigeria',
];

function TypingIndicator() {
  const { colors } = useTheme();
  const resp = useResponsiveCtx();
  return (
    <View style={[indicatorStyles.row, { alignSelf: 'flex-start' }]}>
      <View style={[indicatorStyles.avatar, { backgroundColor: colors.primary + '15' }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}>
        <Ionicons name="sparkles" size={resp.scale(12)} color={colors.primary} />
      </View>
      <View style={[indicatorStyles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={indicatorStyles.dots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 150).springify()}
              style={[indicatorStyles.dot, { backgroundColor: colors.primary }, { width: resp.scale(8), height: resp.scale(8), borderRadius: resp.scale(4) }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const indicatorStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
  avatar: { justifyContent: 'center', alignItems: 'center', marginRight: 6, marginBottom: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: {},
});

export default function AIAssistantScreen() {
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();
  const resp = useResponsiveCtx();

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Hello! I'm your Nursphere AI assistant. I can help with NMCN exam prep, nursing school advice, and career guidance tailored to Nigeria. What would you like to know?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await chatWithGemini(text.trim());

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'ai',
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
    incrementQuestions();
  };

  const messageMaxWidth = resp.isTablet ? '70%' : '78%';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlowGlass variant="subtle" blurIntensity={60} glowIntensity="low">
        <View style={styles.headerContent}>
          <View style={[styles.headerIconWrap, { backgroundColor: NigeriaColors.green + '15' }, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(10) }]}>
            <Ionicons name="sparkles" size={resp.scale(20)} color={NigeriaColors.green} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.lg) }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: NigeriaColors.green }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>Powered by Google Gemini</Text>
          </View>
        </View>
      </GlowGlass>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.sender === 'user' && styles.userRow]}>
              {item.sender === 'ai' && (
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14), marginRight: resp.scale(4), marginBottom: resp.scale(4) }]}>
                  <Ionicons name="sparkles" size={resp.scale(14)} color={NigeriaColors.green} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  { maxWidth: messageMaxWidth, paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm + 2), borderRadius: resp.scale(BorderRadius.lg) },
                  item.sender === 'user' ? [styles.userBubble, { backgroundColor: NigeriaColors.green }] : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? '#FFFFFF' : colors.text },
                    { fontSize: resp.responsiveFontSize(FontSize.md), lineHeight: resp.verticalScale(22) },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={[styles.messagesList, { padding: resp.scale(Spacing.md), paddingBottom: resp.verticalScale(Spacing.xxxl + Spacing.xl) }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
          ListHeaderComponent={
            messages.length === 1 ? (
              <GlowGlass variant="subtle" blurIntensity={50} glowIntensity="low">
                <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>Try asking:</Text>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm), borderRadius: resp.scale(BorderRadius.full), marginBottom: resp.scale(Spacing.xs) }]}
                    onPress={() => sendMessage(s)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={resp.scale(14)} color={NigeriaColors.green} style={{ marginRight: resp.scale(6) }} />
                    <Text style={[styles.suggestionText, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </GlowGlass>
            ) : null
          }
        />

        <GlowGlass variant="subtle" blurIntensity={60} glowIntensity="low" style={{ marginBottom: resp.verticalScale(Spacing.xxxl + Spacing.md) }}>
          <View style={[styles.inputContainer, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm) }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }, { borderRadius: resp.scale(BorderRadius.lg), paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm + 2), fontSize: resp.responsiveFontSize(FontSize.md), maxHeight: resp.verticalScale(100) }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything about nursing..."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: NigeriaColors.green }, !input.trim() && { backgroundColor: colors.textLight }, { width: resp.scale(42), height: resp.scale(42), borderRadius: resp.scale(BorderRadius.full), marginLeft: resp.scale(Spacing.sm) }]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={resp.scale(18)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </GlowGlass>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, ...Shadow.sm },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerIconWrap: { justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  headerTitle: { fontFamily: FontFamily.heading },
  headerSubtitle: { fontFamily: FontFamily.body, marginTop: 1 },
  messagesList: {},
  messageRow: { flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiAvatar: { justifyContent: 'center', alignItems: 'center' },
  messageBubble: {},
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontFamily: FontFamily.body },
  suggestions: { marginBottom: Spacing.md },
  suggestionsTitle: { fontFamily: FontFamily.bodyMedium, marginBottom: Spacing.sm },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, ...Shadow.sm,
  },
  suggestionText: { fontFamily: FontFamily.body, flexShrink: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    borderWidth: 1,
  },
  sendButton: { alignItems: 'center', justifyContent: 'center' },
});
