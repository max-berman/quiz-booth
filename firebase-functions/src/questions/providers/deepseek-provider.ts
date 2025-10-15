import { LLMProvider } from '../types';
import { DEEPSEEK_API_CONFIG, API_HEADERS, LLM_PROVIDER_PRIORITIES } from '../../config/api-config';

export class DeepSeekProvider implements LLMProvider {
  name = 'DeepSeek';
  priority = LLM_PROVIDER_PRIORITIES.DEEPSEEK; // Highest priority

  isAvailable(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  async generateQuestions(prompt: string, batchSize: number): Promise<any[]> {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': API_HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify({
          model: DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      const dataResponse = await response.json() as any;
      const content = dataResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from DeepSeek API: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
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
    // Use DeepSeek as primary provider for plain text generation
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch(`${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': API_HEADERS.CONTENT_TYPE,
      },
      body: JSON.stringify({
        model: DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100, // Short response for titles
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }

    const dataResponse = await response.json() as any;
    const content = dataResponse.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    return content.trim();
  }
}
