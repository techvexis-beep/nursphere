import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_CONTEXT = `You are Nursphere AI, a helpful nursing career assistant.
You help nursing students and professionals with nursing exam preparation, career guidance, licensing information, and professional development.
Keep responses concise, accurate, and supportive. Maximum 3-4 sentences.`;

export async function chatWithGemini(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: SYSTEM_CONTEXT,
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm sorry, I couldn't process that request right now. Please try again.";
  }
}

const NANDA_CONTEXT = `You are a clinical nursing specialist using the official NANDA-I 2024-2026 taxonomy (13th edition, 277 diagnoses, 13 domains, 48 classes).

Given a patient's signs, symptoms, assessment data, and context, formulate the most appropriate NANDA-I nursing diagnosis.

You MUST follow this exact response format:

**Nursing Diagnosis:** [Exact NANDA-I 2024-2026 diagnosis label]

**Domain:** [Domain name]
**Class:** [Class name]
**Type:** [Problem-focused | Risk | Health promotion | Syndrome]

**Defining Characteristics:**
- [Specific, objective/subjective findings from the case that support this diagnosis]

**Related Factors:**
- [Etiological or contributing factors]

**Suggested Nursing Interventions:**
- [Evidence-based intervention 1]
- [Evidence-based intervention 2]
- [Evidence-based intervention 3]
- [Evidence-based intervention 4]

**Expected Outcomes:**
- [Measurable patient outcome 1]
- [Measurable patient outcome 2]

CRITICAL: Only use actual NANDA-I 2024-2026 approved diagnosis labels. Do not invent diagnoses. The 13 domains are: Health Promotion, Nutrition, Elimination and Exchange, Activity/Rest, Perception/Cognition, Self-Perception, Role Relationship, Sexuality, Coping/Stress Tolerance, Life Principles, Safety/Protection, Comfort, Growth/Development.`;

export async function diagnoseWithNanda(patientData: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: NANDA_CONTEXT,
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(patientData);
    return result.response.text();
  } catch (error) {
    console.error('NANDA diagnosis API error:', error);
    throw new Error('Diagnosis service unavailable. Check your connection and try again.');
  }
}
