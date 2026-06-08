import { useState, useEffect } from 'react';
import { fetchDailyTip, fetchNursingNews, fetchMotivationalQuote } from '../services/geminiInsights';

export type NewsItem = {
  region: string;
  headline: string;
};

function parseNews(lines: string[]): NewsItem[] {
  return lines.map(line => {
    const match = line.match(/^[-–]?\s*\[(\w+)\]\s*(.+)/);
    if (match) return { region: match[1], headline: match[2] };
    return { region: 'Global', headline: line.replace(/^[-–]\s*/, '') };
  });
}

export function useAIInsights() {
  const [tip, setTip] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [tipResult, newsResult, quoteResult] = await Promise.all([
      fetchDailyTip(),
      fetchNursingNews(),
      fetchMotivationalQuote(),
    ]);
    setTip(tipResult);
    setNews(parseNews(newsResult));
    setQuote(quoteResult);
    setLoading(false);
  };

  const refresh = async () => {
    await loadAll();
  };

  useEffect(() => { loadAll(); }, []);

  return { tip, news, quote, loading, refresh };
}
