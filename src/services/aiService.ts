// src/services/aiService.ts
export const AIService = {
  async summary(text: string, key: string) {
    try {
      const res = await fetch("/api/summary", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        method: "POST",
        body: JSON.stringify({ text })
      }).then(r => r.json());
      return { summary: res.summary, error: null };
    } catch (e) {
      return { summary: "", error: (e as Error).message };
    }
  }
};
