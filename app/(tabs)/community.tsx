import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, NigeriaColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useStats } from '../../src/context/StatsContext';
import { useResponsiveCtx } from '../../src/context/ResponsiveContext';
import { scale, verticalScale, moderateScale, responsiveFontSize } from '../../src/utils/responsive';

type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  online: boolean;
};

type Message = {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  reactions: string[];
};

type Channel = {
  id: string;
  name: string;
  category: string;
  description: string;
};

const mockUsers: UserProfile[] = [
  { id: 'u1', name: 'Sarah Adekunle', avatar: 'SA', role: 'BSN Student', online: true },
  { id: 'u2', name: 'Chidi Okonkwo', avatar: 'CO', role: 'Registered Nurse', online: true },
  { id: 'u3', name: 'Fatima Bello', avatar: 'FB', role: 'Midwife', online: false },
  { id: 'u4', name: 'Emeka Okafor', avatar: 'EO', role: 'Nursing Educator', online: true },
  { id: 'u5', name: 'Amara Obi', avatar: 'AO', role: 'BSN Student', online: false },
  { id: 'u6', name: 'Tunde Balogun', avatar: 'TB', role: 'RN, ICU Specialist', online: true },
  { id: 'u7', name: 'Ngozi Eze', avatar: 'NE', role: 'Public Health Nurse', online: false },
];

const channels: Channel[] = [
  { id: 'general', name: 'general', category: 'TEXT CHANNELS', description: 'General nursing discussions, announcements, and welcome' },
  { id: 'study-corner', name: 'study-corner', category: 'TEXT CHANNELS', description: 'Study groups, exam prep, and academic resources' },
  { id: 'clinical-discussions', name: 'clinical-discussions', category: 'TEXT CHANNELS', description: 'Clinical cases, procedures, and best practices' },
  { id: 'job-board', name: 'job-board', category: 'RESOURCES', description: 'Job opportunities, internships, and postings in Nigeria' },
  { id: 'student-connect', name: 'student-connect', category: 'RESOURCES', description: 'Connect with fellow nursing students across Nigeria' },
];

const userNames = ['Chidi Okonkwo', 'Fatima Bello', 'Emeka Okafor', 'Amara Obi', 'Tunde Balogun', 'Ngozi Eze'];

function randomUser() {
  const u = mockUsers.find(m => m.name === userNames[Math.floor(Math.random() * userNames.length)]);
  return u || mockUsers[1];
}

const seedMessages: Record<string, Message[]> = {
  general: [
    { id: 'g1', userId: 'u2', text: 'Good morning everyone! Hope you all had a great weekend. Any interesting cases to discuss?', timestamp: new Date(Date.now() - 3600000 * 5), reactions: ['❤️', '👍'] },
    { id: 'g2', userId: 'u4', text: 'Morning! Just finished a workshop on advanced wound care at LUTH. Happy to share notes if anyone is interested.', timestamp: new Date(Date.now() - 3600000 * 4.5), reactions: ['👍', '🔥'] },
    { id: 'g3', userId: 'u6', text: 'That sounds amazing Emeka! I would love those notes. I have a patient with a chronic diabetic ulcer right now.', timestamp: new Date(Date.now() - 3600000 * 4), reactions: [] },
    { id: 'g4', userId: 'u3', text: 'Good morning from ABU Zaria! Has anyone here taken the NMCN exam recently? I need advice on the best study materials.', timestamp: new Date(Date.now() - 3600000 * 3), reactions: ['🙏'] },
    { id: 'g5', userId: 'u1', text: 'Hi Fatima! I took it last year. I used the past questions app and the Fundamentals of Nursing textbook. Focus on pharmacology and community health — those sections carry a lot of marks.', timestamp: new Date(Date.now() - 3600000 * 2.5), reactions: ['👍', '❤️'] },
  ],
  'study-corner': [
    { id: 's1', userId: 'u5', text: 'Hey team! Anyone studying for the pathophysiology exam? I am struggling with the renal system.', timestamp: new Date(Date.now() - 7200000), reactions: ['🙋'] },
    { id: 's2', userId: 'u1', text: 'Same here Amara! The RAAS pathway is confusing. Let me share a mnemonic I found: "Never Aid Sick Kidneys" — Natriuresis, Aldosterone, Sympathetic, K+ excretion. DM me for the full breakdown!', timestamp: new Date(Date.now() - 6000000), reactions: ['🔥', '👍'] },
    { id: 's3', userId: 'u6', text: 'I can join a study session this evening if you guys are meeting on WhatsApp. Let me know!', timestamp: new Date(Date.now() - 3600000), reactions: ['🙏'] },
  ],
  'clinical-discussions': [
    { id: 'c1', userId: 'u6', text: 'Just managed a pre-eclamptic patient in the labour ward. BP was 180/110, gave MgSO4 per protocol. Anyone else dealt with this recently?', timestamp: new Date(Date.now() - 10800000), reactions: ['💪'] },
    { id: 'c2', userId: 'u3', text: 'Great job Tunde! Yes, we see this a lot in the North. Remember to monitor reflexes and respiratory rate closely. Also ensure calcium gluconate is on standby as the antidote.', timestamp: new Date(Date.now() - 9000000), reactions: ['❤️', '👍'] },
    { id: 'c3', userId: 'u2', text: 'Important point Fatima! I would add — always check patellar reflex before each dose and hold if reflex is absent. That saved my patient last month.', timestamp: new Date(Date.now() - 7200000), reactions: ['🔥'] },
  ],
  'job-board': [
    { id: 'j1', userId: 'u4', text: 'Job alert! LUTH is hiring 20 staff nurses. Applications close June 15. Requirements: BSc Nursing, NMCN license, at least 2 years experience. Link in bio.', timestamp: new Date(Date.now() - 86400000), reactions: ['🔥', '👍', '❤️'] },
    { id: 'j2', userId: 'u7', text: 'Also saw that Reddington Hospital in VI, Lagos is looking for ICU nurses. Competitive pay and accommodation allowance included!', timestamp: new Date(Date.now() - 43200000), reactions: ['👍'] },
  ],
  'student-connect': [
    { id: 'sc1', userId: 'u5', text: 'Hi everyone! I am a 200-level nursing student at UNIBEN. Looking to connect with other nursing students for study groups and mentorship.', timestamp: new Date(Date.now() - 14400000), reactions: ['👋', '❤️'] },
    { id: 'sc2', userId: 'u1', text: 'Welcome Amara! I am at UNILAG for my 4th year. Happy to mentor! Feel free to DM me anytime.', timestamp: new Date(Date.now() - 10800000), reactions: ['🙏'] },
    { id: 'sc3', userId: 'u2', text: 'Great initiative! I am a practicing RN in Abuja. If anyone needs shadowing experience or career guidance, I am open to helping.', timestamp: new Date(Date.now() - 7200000), reactions: ['🔥', '❤️'] },
  ],
};

const reactionsList = ['👍', '❤️', '🔥', '😂', '🙏', '💪'];

function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getUser(id: string) {
  return mockUsers.find(u => u.id === id) || mockUsers[0];
}

function ReactionPicker({ onSelect, onClose }: { onSelect: (r: string) => void; onClose: () => void }) {
  return (
    <View style={reactionStyles.container}>
      {reactionsList.map(r => (
        <TouchableOpacity key={r} style={reactionStyles.item} onPress={() => { onSelect(r); onClose(); }}>
          <Text style={reactionStyles.emoji}>{r}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const reactionStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: BorderRadius.full },
  item: { padding: 4 },
  emoji: { fontSize: 20 },
});

export default function CommunityScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const resp = useResponsiveCtx();
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<Record<string, Message[]>>(seedMessages);
  const [input, setInput] = useState('');
  const [showChannelList, setShowChannelList] = useState(false);
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const slideAnim = useRef(new RNAnimated.Value(-300)).current;
  const flatListRef = useRef<FlatList>(null);
  const { addConnection, removeConnection, startStudyTimer, stopStudyTimer } = useStats();

  const sidebarWidth = resp.isTablet ? moderateScale(320) : moderateScale(280);

  useFocusEffect(
    useCallback(() => {
      startStudyTimer();
      return () => stopStudyTimer();
    }, [])
  );

  const toggleConnect = (userId: string) => {
    setConnectedUsers(prev => {
      if (prev.includes(userId)) {
        removeConnection();
        return prev.filter(id => id !== userId);
      }
      addConnection();
      return [...prev, userId];
    });
  };

  useEffect(() => {
    RNAnimated.timing(slideAnim, {
      toValue: showChannelList ? 0 : -sidebarWidth,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showChannelList, slideAnim, sidebarWidth]);

  const currentMessages = messages[activeChannel] || [];

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !user) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      userId: 'u1',
      text,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => {
      const channelMsgs = [...(prev[activeChannel] || [])];
      const idx = channelMsgs.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      const msg = { ...channelMsgs[idx] };
      const has = msg.reactions.includes(emoji);
      msg.reactions = has ? msg.reactions.filter(r => r !== emoji) : [...msg.reactions, emoji];
      channelMsgs[idx] = msg;
      return { ...prev, [activeChannel]: channelMsgs };
    });
    setReactingTo(null);
  };

  const channel = channels.find(c => c.id === activeChannel) || channels[0];
  const onlineCount = mockUsers.filter(u => u.online).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Channel sidebar overlay */}
      {showChannelList && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowChannelList(false)}>
          <RNAnimated.View
            style={[styles.sidebar, { backgroundColor: isDark ? '#0d1124' : '#1a1a2e', width: sidebarWidth, transform: [{ translateX: slideAnim }] }]}
          >
            <View style={[styles.sidebarHeader, { marginBottom: resp.scale(Spacing.md), paddingBottom: resp.scale(Spacing.lg) }]}>
              <Text style={[styles.sidebarTitle, { fontSize: resp.responsiveFontSize(FontSize.xl) }]}>Nursphere</Text>
              <Text style={[styles.sidebarSubtitle, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{onlineCount} online</Text>
            </View>

            {['TEXT CHANNELS', 'RESOURCES'].map(cat => (
              <View key={cat}>
                <Text style={[styles.channelCategory, { fontSize: resp.responsiveFontSize(FontSize.xs), marginTop: resp.scale(Spacing.md), marginBottom: resp.scale(Spacing.xs) }]}>{cat}</Text>
                {channels.filter(c => c.category === cat).map(ch => (
                  <TouchableOpacity
                    key={ch.id}
                    style={[styles.channelItem, activeChannel === ch.id && { backgroundColor: 'rgba(255,255,255,0.1)' }, { paddingVertical: resp.scale(Spacing.sm), paddingHorizontal: resp.scale(Spacing.sm), borderRadius: resp.scale(BorderRadius.md), marginBottom: 2 }]}
                    onPress={() => { setActiveChannel(ch.id); setShowChannelList(false); }}
                  >
                    <Text style={[styles.channelHash, activeChannel === ch.id && styles.channelHashActive, { fontSize: resp.responsiveFontSize(FontSize.lg), marginRight: resp.scale(Spacing.sm) }]}>#</Text>
                    <Text style={[styles.channelName, activeChannel === ch.id && { color: '#FFFFFF' }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>{ch.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={[styles.sidebarUsers, { marginTop: resp.scale(Spacing.lg) }]}>
              <Text style={[styles.channelCategory, { fontSize: resp.responsiveFontSize(FontSize.xs), marginBottom: resp.scale(Spacing.xs) }]}>ONLINE — {onlineCount}</Text>
              {mockUsers.filter(u => u.online).map(u => (
                <View key={u.id} style={[styles.userRow, { paddingVertical: resp.scale(Spacing.xs), paddingHorizontal: resp.scale(Spacing.xs) }]}>
                  <View style={[styles.userAvatarSmall, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14), marginRight: resp.scale(Spacing.sm) }]}>
                    <Text style={[styles.userAvatarSmallText, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{u.avatar}</Text>
                    <View style={[styles.onlineDot, { backgroundColor: NigeriaColors.green }, { width: resp.scale(8), height: resp.scale(8), borderRadius: resp.scale(4) }]} />
                  </View>
                  <View style={styles.userRowInfo}>
                    <Text style={[styles.userNameSmall, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{u.name}</Text>
                    <Text style={[styles.userRoleSmall, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{u.role}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.connectBtn, connectedUsers.includes(u.id) && styles.connectBtnActive, { width: resp.scale(28), height: resp.scale(28), borderRadius: resp.scale(14) }]}
                    onPress={() => toggleConnect(u.id)}
                  >
                    <Ionicons
                      name={connectedUsers.includes(u.id) ? 'checkmark-circle' : 'person-add-outline'}
                      size={resp.scale(16)}
                      color={connectedUsers.includes(u.id) ? '#FFFFFF' : NigeriaColors.green}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </RNAnimated.View>
        </TouchableOpacity>
      )}

      {/* Main chat area */}
      <View style={[styles.chatHeader, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderBottomColor: colors.border }, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm) }]}>
        <TouchableOpacity style={[styles.channelToggle, { padding: resp.scale(Spacing.xs), marginRight: resp.scale(Spacing.sm) }]} onPress={() => setShowChannelList(true)}>
          <Ionicons name="menu" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.channelInfo}>
          <Text style={[styles.channelTitle, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md) }]}>#{channel.name}</Text>
          <Text style={[styles.channelDesc, { color: colors.textSecondary }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{channel.description}</Text>
        </View>
        <TouchableOpacity style={[styles.channelInfoBtn, { padding: resp.scale(Spacing.xs) }]}>
          <Ionicons name="information-circle-outline" size={moderateScale(22)} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <FlatList
          ref={flatListRef}
          data={currentMessages}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.messagesList, { padding: resp.scale(Spacing.md), paddingBottom: resp.verticalScale(Spacing.xxxl + Spacing.xl) }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mu = getUser(item.userId);
            const isMine = item.userId === 'u1';
            return (
              <Animated.View entering={FadeInDown.springify()} style={[styles.messageRow, isMine && styles.messageRowMine, { marginBottom: resp.scale(Spacing.md) }]}>
                {!isMine && (
                  <View style={[styles.msgAvatar, { backgroundColor: 'rgba(0,135,81,0.15)' }, { width: resp.scale(36), height: resp.scale(36), borderRadius: resp.scale(18), marginRight: resp.scale(Spacing.sm), marginTop: 2 }]}>
                    <Text style={[styles.msgAvatarText, { fontSize: resp.responsiveFontSize(FontSize.sm) }]}>{mu.avatar}</Text>
                  </View>
                )}
                <View style={[styles.msgContent, { maxWidth: resp.isTablet ? '75%' : '82%' }]}>
                  {!isMine && (
                    <View style={styles.msgMeta}>
                      <Text style={[styles.msgAuthor, { color: colors.primary }, { fontSize: resp.responsiveFontSize(FontSize.sm), marginRight: resp.scale(Spacing.sm) }]}>{mu.name}</Text>
                      <Text style={[styles.msgTime, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{formatTime(item.timestamp)}</Text>
                    </View>
                  )}
                  {isMine && (
                    <View style={styles.msgMetaRight}>
                      <Text style={[styles.msgTime, { color: colors.textLight }, { fontSize: resp.responsiveFontSize(FontSize.xs) }]}>{formatTime(item.timestamp)}</Text>
                    </View>
                  )}
                  <Text style={[styles.msgText, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), lineHeight: resp.verticalScale(20) }]}>{item.text}</Text>
                  {item.reactions.length > 0 && (
                    <View style={[styles.reactionsRow, { gap: resp.scale(4), marginTop: resp.scale(4) }]}>
                      {item.reactions.map((r: string, i: number) => (
                        <TouchableOpacity key={i} style={[styles.reactionBadge, { backgroundColor: 'rgba(0,135,81,0.1)' }, { paddingHorizontal: resp.scale(6), paddingVertical: resp.scale(2), borderRadius: resp.scale(BorderRadius.full) }]} onPress={() => toggleReaction(item.id, r)}>
                          <Text style={[styles.reactionEmoji, { fontSize: resp.moderateScale(14) }]}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.reactionAdd, { padding: resp.scale(2) }]} onPress={() => setReactingTo(reactingTo === item.id ? null : item.id)}>
                        <Ionicons name="add-circle-outline" size={resp.scale(16)} color={colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {!item.reactions.length && (
                    <TouchableOpacity style={[styles.reactionAddStandalone, { padding: resp.scale(2), marginTop: resp.scale(2) }]} onPress={() => setReactingTo(reactingTo === item.id ? null : item.id)}>
                      <Ionicons name="add-circle-outline" size={resp.moderateScale(14)} color={colors.textLight} />
                    </TouchableOpacity>
                  )}
                  {reactingTo === item.id && (
                    <ReactionPicker onSelect={(emoji) => toggleReaction(item.id, emoji)} onClose={() => setReactingTo(null)} />
                  )}
                </View>
              </Animated.View>
            );
          }}
        />

        <View style={[styles.inputContainer, { backgroundColor: isDark ? '#151b2e' : '#ffffff', borderTopColor: colors.border }, { paddingHorizontal: resp.scale(Spacing.md), paddingVertical: resp.scale(Spacing.sm), paddingBottom: resp.verticalScale(Spacing.xxxl + Spacing.md) }]}>
          <View style={[styles.inputWrap, { backgroundColor: isDark ? '#0d1124' : '#f0f0f5' }, { borderRadius: resp.scale(BorderRadius.full), paddingLeft: resp.scale(Spacing.md), paddingRight: resp.scale(4), paddingVertical: resp.scale(4) }]}>
            <TextInput
              style={[styles.input, { color: colors.text }, { fontSize: resp.responsiveFontSize(FontSize.md), maxHeight: resp.verticalScale(80), paddingVertical: resp.scale(Spacing.xs) }]}
              value={input}
              onChangeText={setInput}
              placeholder={`Message #${channel.name}`}
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={1000}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: NigeriaColors.green }, !input.trim() && { opacity: 0.4 }, { width: resp.scale(34), height: resp.scale(34), borderRadius: resp.scale(17) }]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={resp.scale(16)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  /* Overlay + Sidebar */
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100,
  },
  sidebar: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    paddingTop: Spacing.xl, paddingHorizontal: Spacing.md,
  },
  sidebarHeader: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  sidebarTitle: { fontFamily: FontFamily.display, color: '#FFFFFF' },
  sidebarSubtitle: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  channelCategory: {
    fontFamily: FontFamily.bodySemiBold,
    color: 'rgba(255,255,255,0.5)', letterSpacing: 1,
    paddingLeft: Spacing.xs,
  },
  channelItem: {
    flexDirection: 'row', alignItems: 'center',
  },
  channelHash: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.4)' },
  channelHashActive: { color: '#FFFFFF' },
  channelName: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.7)' },
  sidebarUsers: {},
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userAvatarSmall: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,135,81,0.2)' },
  userAvatarSmallText: { fontFamily: FontFamily.bodyBold, color: NigeriaColors.green },
  onlineDot: { position: 'absolute', bottom: 0, right: -1, borderWidth: 2, borderColor: '#0d1124' },
  userRowInfo: { flex: 1 },
  userNameSmall: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.8)' },
  userRoleSmall: { fontFamily: FontFamily.body, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  connectBtn: { borderWidth: 1.5, borderColor: NigeriaColors.green, justifyContent: 'center', alignItems: 'center' },
  connectBtnActive: { backgroundColor: NigeriaColors.green, borderColor: NigeriaColors.green },

  /* Chat header */
  chatHeader: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1,
  },
  channelToggle: {},
  channelInfo: { flex: 1 },
  channelTitle: { fontFamily: FontFamily.heading },
  channelDesc: { fontFamily: FontFamily.body, marginTop: 1 },
  channelInfoBtn: {},

  /* Messages */
  messagesList: {},
  messageRow: { flexDirection: 'row', alignItems: 'flex-start' },
  messageRowMine: { justifyContent: 'flex-end' },
  msgAvatar: {
    justifyContent: 'center', alignItems: 'center',
  },
  msgAvatarText: { fontFamily: FontFamily.bodyBold, color: NigeriaColors.green },
  msgContent: {},
  msgMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  msgMetaRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
  msgAuthor: { fontFamily: FontFamily.bodySemiBold },
  msgTime: { fontFamily: FontFamily.body },
  msgText: { fontFamily: FontFamily.body },

  /* Reactions */
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  reactionBadge: {},
  reactionEmoji: {},
  reactionAdd: {},
  reactionAddStandalone: { alignSelf: 'flex-start' },

  /* Input */
  inputContainer: {
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end',
  },
  input: {
    flex: 1, fontFamily: FontFamily.body,
  },
  sendBtn: {
    justifyContent: 'center', alignItems: 'center',
  },
});
