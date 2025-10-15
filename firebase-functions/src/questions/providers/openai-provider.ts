import { LLMProvider } from '../types';
import { OPENAI_API_CONFIG, API_HEADERS, LLM_PROVIDER_PRIORITIES } from '../../config/api-config';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  priority = LLM_PROVIDER_PRIORITIES.OPENAI; // Lower priority than DeepSeek

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateQuestions(prompt: string, batchSize: number): Promise<any[]> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${OPENAI_API_CONFIG.BASE_URL}${OPENAI_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': API_HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify({
          model: OPENAI_API_CONFIG.DEFAULT_MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: OPENAI_API_CONFIG.DEFAULT_TEMPERATURE,
          max_tokens: OPENAI_API_CONFIG.DEFAULT_MAX_TOKENS,
          top_p: OPENAI_API_CONFIG.DEFAULT_TOP_P,
          frequency_penalty: OPENAI_API_CONFIG.DEFAULT_FREQUENCY_PENALTY,
          presence_penalty: OPENAI_API_CONFIG.DEFAULT_PRESENCE_PENALTY
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      const dataResponse = await response.json() as any;
      const content = dataResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from OpenAI API: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Handle different response formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      } else if (parsed.question || parsed.questionText) {
        return [parsed];
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateSingleQuestion(prompt: string): Promise<any> {
    return this.generateQuestions(prompt, 1).then(questions => questions[0]);
  }

  async generatePlainText(prompt: string): Promise<string> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${OPENAI_API_CONFIG.BASE_URL}${OPENAI_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': API_HEADERS.CONTENT_TYPE,
      },
      body: JSON.stringify({
        model: OPENAI_API_CONFIG.DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100, // Short response for titles
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }

    const dataResponse = await response.json() as any;
    const content = dataResponse.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    return content.trim();
  }
}
