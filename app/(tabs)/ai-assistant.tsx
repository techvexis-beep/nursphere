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
  return (
    <View style={[indicatorStyles.row, { alignSelf: 'flex-start' }]}>
      <View style={[indicatorStyles.avatar, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="sparkles" size={12} color={colors.primary} />
      </View>
      <View style={[indicatorStyles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={indicatorStyles.dots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 150).springify()}
              style={[indicatorStyles.dot, { backgroundColor: colors.primary }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const indicatorStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 6, marginBottom: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

export default function AIAssistantScreen() {
  const { colors, isDark } = useTheme();
  const { incrementQuestions, startStudyTimer, stopStudyTimer } = useStats();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlowGlass variant="subtle" blurIntensity={60} glowIntensity="low">
        <View style={styles.headerContent}>
          <View style={[styles.headerIconWrap, { backgroundColor: NigeriaColors.green + '15' }]}>
            <Ionicons name="sparkles" size={20} color={NigeriaColors.green} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: NigeriaColors.green }]}>Powered by Google Gemini</Text>
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
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="sparkles" size={14} color={NigeriaColors.green} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'user' ? [styles.userBubble, { backgroundColor: NigeriaColors.green }] : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
          ListHeaderComponent={
            messages.length === 1 ? (
              <GlowGlass variant="subtle" blurIntensity={50} glowIntensity="low">
                <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>Try asking:</Text>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => sendMessage(s)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={NigeriaColors.green} style={{ marginRight: 6 }} />
                    <Text style={[styles.suggestionText, { color: colors.primary }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </GlowGlass>
            ) : null
          }
        />

        <GlowGlass variant="subtle" blurIntensity={60} glowIntensity="low" style={{ marginBottom: Spacing.xxxl + Spacing.md }}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
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
              style={[styles.sendButton, { backgroundColor: NigeriaColors.green }, !input.trim() && { backgroundColor: colors.textLight }]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={18} color={colors.white} />
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
  headerIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  headerTitle: { fontFamily: FontFamily.heading, fontSize: FontSize.lg },
  headerSubtitle: { fontFamily: FontFamily.body, fontSize: FontSize.xs, marginTop: 1 },
  messagesList: { padding: Spacing.md, paddingBottom: Spacing.xxxl + Spacing.xl },
  messageRow: { flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.xs, marginBottom: 4 },
  messageBubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontFamily: FontFamily.body, fontSize: FontSize.md, lineHeight: 22 },
  suggestions: { marginBottom: Spacing.md },
  suggestionsTitle: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, marginBottom: Spacing.xs, borderWidth: 1, ...Shadow.sm,
  },
  suggestionText: { fontFamily: FontFamily.body, fontSize: FontSize.sm, flexShrink: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderTopWidth: 1,
  },
  input: {
    flex: 1, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2, fontFamily: FontFamily.body, fontSize: FontSize.md,
    maxHeight: 100, borderWidth: 1,
  },
  sendButton: { width: 42, height: 42, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
});
