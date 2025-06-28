
export class AIService {
  static async generateSummary(text: string, provider: string, apiKey: string): Promise<string> {
    if (!apiKey || !text) {
      return '';
    }

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that creates concise summaries of voice notes. Keep summaries under 100 words and highlight key points.'
              },
              {
                role: 'user',
                content: `Please summarize this voice note: ${text}`
              }
            ],
            max_tokens: 150,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const result = await response.json();
        return result.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      return '';
    }

    return '';
  }
}
