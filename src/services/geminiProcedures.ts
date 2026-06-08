import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const PROCEDURE_CONTEXT = `You are a clinical nursing procedures specialist. Given a nursing procedure name, provide a detailed step-by-step guide.

You MUST follow this exact format:

**Procedure:** [Full procedure name]

**Purpose:** [Brief purpose statement]

**Equipment Needed:**
- [Item 1]
- [Item 2]
- ...

**Steps:**
1. [Step 1]
2. [Step 2]
...

**Nursing Considerations:**
- [Consideration 1]
- [Consideration 2]
- ...

**Complications to Watch For:**
- [Complication 1]
- [Complication 2]
- ...

Provide comprehensive, evidence-based steps suitable for nursing students and professionals. Include relevant safety checks and patient communication steps.`;

const SEARCH_CONTEXT = `You are a nursing procedures database. Given a search query, return a list of relevant nursing procedure titles that match.

Return the results as a JSON array of strings, like: ["Procedure 1", "Procedure 2", "Procedure 3", ...]

Include both common and specialized nursing procedures. Aim for 5-10 results.`;

type ProcedureResult = {
  title: string;
  purpose: string;
  equipment: string[];
  steps: string[];
  considerations: string[];
  complications: string[];
};

function parseProcedure(raw: string): ProcedureResult {
  const lines = raw.split('\n').filter((l) => l.trim());

  const getField = (keyword: string): string => {
    const line = lines.find(
      (l) =>
        l.toLowerCase().startsWith('**' + keyword.toLowerCase()) ||
        l.toLowerCase().includes('**' + keyword.toLowerCase())
    );
    if (line) {
      const val = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '').trim();
      return val;
    }
    return '';
  };

  const findSection = (keywords: string[]): string[] => {
    const startIdx = lines.findIndex((l) =>
      keywords.some((k) => l.toLowerCase().includes(k.toLowerCase()))
    );
    if (startIdx === -1) return [];
    const nextSectionHeaders = lines.slice(startIdx + 1).filter((l) => /^\*\*/.test(l.trim()));
    const nextHeaderIdx =
      nextSectionHeaders.length > 0
        ? lines.indexOf(nextSectionHeaders[0], startIdx + 1)
        : -1;
    const end = nextHeaderIdx === -1 ? lines.length : nextHeaderIdx;
    return lines
      .slice(startIdx + 1, end)
      .map((l) =>
        l.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^\d+\)\s*/, '').trim()
      )
      .filter((l) => l.length > 2);
  };

  return {
    title: getField('procedure') || 'Nursing Procedure',
    purpose: getField('purpose') || '',
    equipment: findSection(['equipment needed', 'equipment']),
    steps: findSection(['steps', 'procedure steps']),
    considerations: findSection(['nursing considerations', 'considerations']),
    complications: findSection(['complications', 'complications to watch']),
  };
}

export async function fetchProcedure(query: string): Promise<ProcedureResult> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: PROCEDURE_CONTEXT,
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(`Describe the nursing procedure: ${query}`);
    return parseProcedure(result.response.text());
  } catch (error) {
    console.error('Gemini procedure error:', error);
    throw new Error('Failed to fetch procedure. Check your connection.');
  }
}

export async function searchProcedures(query: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: SEARCH_CONTEXT,
    });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(`Search for nursing procedures related to: ${query}`);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return text.split('\n').filter((l) => /^\d+[\.\)]/.test(l)).map((l) => l.replace(/^\d+[\.\)]\s*/, '')).filter(Boolean);
  } catch (error) {
    console.error('Gemini search error:', error);
    return [];
  }
}
