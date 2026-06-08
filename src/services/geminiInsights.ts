import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

type CacheEntry<T> = { data: T; timestamp: number };
const TIP_CACHE_KEY = 'daily_tip';
const NEWS_CACHE_KEY = 'daily_news';
const QUOTE_CACHE_KEY = 'daily_quote';
const CACHE_TTL = 30 * 60 * 1000;

const cache: Record<string, CacheEntry<string>> = {};

function getCached(key: string): string | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: string) {
  cache[key] = { data, timestamp: Date.now() };
}

const TIP_MODEL = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  systemInstruction: `You are a nursing education specialist for Nigerian nursing students.
Give ONE concise, practical nursing tip relevant to Nigerian healthcare settings.
Maximum 2 sentences. Focus on clinical skills, exam prep, or career advice.
Never repeat the same tip twice across calls — vary the topic each time.`,
});

const NEWS_MODEL = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  systemInstruction: `You are a global nursing news curator.
Give 4 brief nursing/healthcare news headlines from around the world right now.
Each headline must be max 20 words. Cover different regions: Africa, Europe, Americas, Asia.
Prefix each with the region in brackets like "[Africa]" or "[Europe]".
Format: "- [Region] headline" on each line. No extra text.`,
});

const QUOTE_MODEL = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  systemInstruction: `You are a motivational speaker for Nigerian nurses.
Give ONE short, inspiring quote for nursing students in Nigeria.
Maximum 15 words. Include the author name. Example: "Nursing is an art — Florence Nightingale"`,
});

const INSIGHT_MODEL = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  systemInstruction: `You are a nursing career counselor for Nigerian nursing students.
Given a student's role, year, and institution, give ONE personalized career insight or next-step recommendation.
Maximum 2 sentences. Be specific and actionable for the Nigerian nursing context.`,
});

export async function fetchDailyTip(): Promise<string> {
  const cached = getCached(TIP_CACHE_KEY);
  if (cached) return cached;

  try {
    const result = await TIP_MODEL.generateContent('Give me a nursing tip for today');
    const text = result.response.text().trim();
    setCache(TIP_CACHE_KEY, text);
    return text;
  } catch {
    const fallback = 'Master the art of patient handoff — use the ISBAR format (Identify, Situation, Background, Assessment, Recommendation) for clear communication.';
    setCache(TIP_CACHE_KEY, fallback);
    return fallback;
  }
}

export async function fetchNursingNews(): Promise<string[]> {
  const cached = getCached(NEWS_CACHE_KEY);
  if (cached) return cached.split('\n').filter(Boolean);

  try {
    const result = await NEWS_MODEL.generateContent('What are recent nursing news headlines from around the world?');
    const text = result.response.text().trim();
    const lines = text.split('\n').filter(Boolean);
    setCache(NEWS_CACHE_KEY, lines.join('\n'));
    return lines;
  } catch {
    const fallback = [
      '[Africa] Nigeria launches national nursing workforce strategy 2026-2030',
      '[Europe] WHO Europe reports 1.2M nurse shortage across the region',
      '[Americas] US passes law to fast-track foreign nurse credentialing',
      '[Asia] Philippines deploys 500 nurses to rural underserved areas',
    ];
    setCache(NEWS_CACHE_KEY, fallback.join('\n'));
    return fallback;
  }
}

export async function fetchMotivationalQuote(): Promise<string> {
  const cached = getCached(QUOTE_CACHE_KEY);
  if (cached) return cached;

  try {
    const result = await QUOTE_MODEL.generateContent('Give me a motivational quote for a Nigerian nursing student');
    const text = result.response.text().trim();
    setCache(QUOTE_CACHE_KEY, text);
    return text;
  } catch {
    const fallback = 'Nursing is not just a profession, it is a calling to serve humanity — Nigerian Nurse Proverb';
    setCache(QUOTE_CACHE_KEY, fallback);
    return fallback;
  }
}

export async function fetchCareerInsight(role: string, year: string, institution: string): Promise<string> {
  const key = `career_${role}_${year}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const prompt = `Student role: ${role}, Year: ${year}, Institution: ${institution}. Give one career insight.`;
    const result = await INSIGHT_MODEL.generateContent(prompt);
    const text = result.response.text().trim();
    setCache(key, text);
    return text;
  } catch {
    const fallback = 'Consider joining the Nigerian Nurses Association early — it opens doors for mentorship, scholarships, and job placements across the country.';
    setCache(key, fallback);
    return fallback;
  }
}

const CAREER_CACHE_KEY = 'career_roadmap';

export type CareerMilestone = {
  id: string;
  stage: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
};

const CAREER_MODEL = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  systemInstruction: `You are a Nigerian nursing career counselor. Generate a personalized career roadmap as a JSON array.

Rules:
- Return ONLY a valid JSON array of objects, no markdown formatting, no code fences, no explanation.
- Each milestone has: "stage" (short category like Education/Licensing/Specialization), "title" (specific milestone name), "description" (1-2 sentences), "status" ("completed", "in-progress", or "upcoming").
- Exactly 5 milestones.
- Status should reflect the user's current role and progress: if they are a student, first milestone is "completed" (enrolled), second is "in-progress" (current studies). If they are a registered nurse, first 2 are completed, third is in-progress.
- Make descriptions specific to nursing in Nigeria (mention NMCN, NYSC, Nigerian institutions, specialties in demand in Nigeria).`,
});

export async function fetchCareerRoadmap(
  role: string,
  year: string,
  institution: string,
  questionsDone: number
): Promise<CareerMilestone[]> {
  const key = `${CAREER_CACHE_KEY}_${role}_${year}`;
  const cached = getCached(key);
  if (cached) {
    try { return JSON.parse(cached) as CareerMilestone[]; }
    catch { /* fall through */ }
  }

  const prompt = `The user is a "${role}"${year ? ` in year "${year}"` : ''}${institution ? ` at "${institution}"` : ''}. They have completed ${questionsDone} practice questions. Generate a personalized 5-milestone career roadmap as a JSON array.`;

  try {
    const result = await CAREER_MODEL.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    const milestones = JSON.parse(text) as CareerMilestone[];
    const validated = milestones.map((m, i) => ({
      id: String(i + 1),
      stage: m.stage || 'Milestone',
      title: m.title || `Step ${i + 1}`,
      description: m.description || '',
      status: (['completed', 'in-progress', 'upcoming'].includes(m.status) ? m.status : 'upcoming') as CareerMilestone['status'],
    }));
    setCache(key, JSON.stringify(validated));
    return validated;
  } catch {
    const fallback: CareerMilestone[] = [
      { id: '1', stage: 'Education', title: role ? `${role} at ${institution || 'your institution'}` : 'Nursing Education', description: `Complete your ${role || 'nursing'} program with strong academic performance.`, status: 'completed' },
      { id: '2', stage: 'Licensing', title: 'NMCN Licensure Exam', description: 'Pass the Nursing and Midwifery Council of Nigeria licensing exam to become a Registered Nurse.', status: 'in-progress' },
      { id: '3', stage: 'Internship', title: 'NYSC / Clinical Internship', description: 'Complete a 1-year internship at a teaching hospital as part of mandatory licensing.', status: 'upcoming' },
      { id: '4', stage: 'Specialization', title: 'Choose a Nursing Specialty', description: 'Pursue ICU, Pediatrics, Public Health, or Perioperative Nursing through a PGD or MSc program.', status: 'upcoming' },
      { id: '5', stage: 'Advancement', title: 'Advanced Practice & Leadership', description: 'Earn an MSc/DNP and take on roles like Nurse Educator, Nurse Manager, or Consultant.', status: 'upcoming' },
    ];
    setCache(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function clearInsightsCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}
