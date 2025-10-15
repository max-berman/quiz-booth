import * as functions from 'firebase-functions';
import { LLMProvider } from './types';
import { getForcedProvider, setForcedProvider } from './utils';
import { handleLLMError } from './error-handler';
import { DeepSeekProvider } from './providers/deepseek-provider';
import { OpenAIProvider } from './providers/openai-provider';

// LLM Service for managing multiple providers with prioritization
class LLMService {
  private providers: LLMProvider[] = [];
  private forcedProvider: string | null = null;
  private lastUsedProvider: string | null = null;

  constructor() {
    // Initialize providers with proper prioritization
    this.initializeProviders();

    // Load forced provider from Firestore on initialization
    // Note: This is async but constructor can't be async
    // The forced provider will be loaded when first used
  }

  private async loadForcedProviderFromFirestore(): Promise<void> {
    try {
      const forcedProvider = await getForcedProvider();
      console.log(`Firestore forced provider check: ${forcedProvider}`);
      if (forcedProvider) {
        this.forcedProvider = forcedProvider;
        console.log(`Loaded forced provider from Firestore: ${forcedProvider}`);
      } else {
        console.log('No forced provider found in Firestore');
      }
    } catch (error) {
      console.error('Error loading forced provider from Firestore:', error);
    }
  }

  private initializeProviders(): void {
    // Add providers in priority order (lower priority number = higher priority)
    this.providers = [
      new DeepSeekProvider(),  // Priority 1 - Highest priority
      new OpenAIProvider()     // Priority 2 - Fallback provider
    ];

    // Sort providers by priority to ensure correct order
    this.providers.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));

    console.log(`Initialized LLM providers in priority order: ${this.providers.map(p => p.name).join(' -> ')}`);
  }

  // Method to force a specific provider for testing
  forceProvider(providerName: string): void {
    this.forcedProvider = providerName;
    console.log(`Forced provider set to: ${providerName}`);
  }

  // Method to clear forced provider
  clearForcedProvider(): void {
    this.forcedProvider = null;
    console.log('Forced provider cleared');
  }

  async generateQuestionsWithFallback(
    prompt: string,
    batchSize: number,
    onProviderSwitch?: (from: string, to: string) => void
  ): Promise<any[]> {
    // Load forced provider from Firestore before checking
    await this.loadForcedProviderFromFirestore();

    // If a provider is forced, use only that provider
    if (this.forcedProvider) {
      const forcedProvider = this.providers.find(p => p.name === this.forcedProvider);
      if (!forcedProvider) {
        throw new Error(`Forced provider '${this.forcedProvider}' not found`);
      }
      if (!forcedProvider.isAvailable()) {
        throw new Error(`Forced provider '${this.forcedProvider}' is not available`);
      }

      console.log(`Using forced provider: ${forcedProvider.name}`);
      this.lastUsedProvider = forcedProvider.name;
      return forcedProvider.generateQuestions(prompt, batchSize);
    }

    let lastError: Error | null = null;
    let currentProviderIndex = 0;

    while (currentProviderIndex < this.providers.length) {
      const provider = this.providers[currentProviderIndex];

      if (!provider.isAvailable()) {
        console.log(`Provider ${provider.name} is not available, skipping`);
        currentProviderIndex++;
        continue;
      }

      try {
        console.log(`Attempting to generate questions with ${provider.name} (priority: ${(provider as any).priority || 'N/A'})`);
        const questions = await provider.generateQuestions(prompt, batchSize);
        console.log(`Successfully generated ${questions.length} questions with ${provider.name}`);
        this.lastUsedProvider = provider.name;
        return questions;
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        lastError = error as Error;

        // Check if we should try next provider
        const errorInfo = handleLLMError(error, { providerName: provider.name });
        if (errorInfo.fallbackPossible && currentProviderIndex < this.providers.length - 1) {
          const nextProvider = this.providers[currentProviderIndex + 1];
          console.log(`Falling back to ${nextProvider.name} (priority: ${(nextProvider as any).priority || 'N/A'}) due to error: ${errorInfo.errorType}`);
          onProviderSwitch?.(provider.name, nextProvider.name);
          currentProviderIndex++;
          continue;
        }

        // If no fallback possible or last provider, throw the error
        throw error;
      }
    }

    throw lastError || new Error('No LLM providers available');
  }

  async generateSingleQuestionWithFallback(
    prompt: string,
    onProviderSwitch?: (from: string, to: string) => void
  ): Promise<any> {
    const questions = await this.generateQuestionsWithFallback(prompt, 1, onProviderSwitch);
    return questions[0];
  }

  async generatePlainTextWithFallback(
    prompt: string,
    onProviderSwitch?: (from: string, to: string) => void
  ): Promise<string> {
    // Load forced provider from Firestore before checking
    await this.loadForcedProviderFromFirestore();

    // If a provider is forced, use only that provider
    if (this.forcedProvider) {
      const forcedProvider = this.providers.find(p => p.name === this.forcedProvider);
      if (!forcedProvider) {
        throw new Error(`Forced provider '${this.forcedProvider}' not found`);
      }
      if (!forcedProvider.isAvailable()) {
        throw new Error(`Forced provider '${this.forcedProvider}' is not available`);
      }

      console.log(`Using forced provider for plain text: ${forcedProvider.name}`);
      this.lastUsedProvider = forcedProvider.name;
      return forcedProvider.generatePlainText(prompt);
    }

    let lastError: Error | null = null;
    let currentProviderIndex = 0;

    while (currentProviderIndex < this.providers.length) {
      const provider = this.providers[currentProviderIndex];

      if (!provider.isAvailable()) {
        console.log(`Provider ${provider.name} is not available for plain text, skipping`);
        currentProviderIndex++;
        continue;
      }

      try {
        console.log(`Attempting to generate plain text with ${provider.name} (priority: ${(provider as any).priority || 'N/A'})`);
        const text = await provider.generatePlainText(prompt);
        console.log(`Successfully generated plain text with ${provider.name}`);
        this.lastUsedProvider = provider.name;
        return text;
      } catch (error) {
        console.error(`Provider ${provider.name} failed for plain text:`, error);
        lastError = error as Error;

        // Check if we should try next provider
        const errorInfo = handleLLMError(error, { providerName: provider.name });
        if (errorInfo.fallbackPossible && currentProviderIndex < this.providers.length - 1) {
          const nextProvider = this.providers[currentProviderIndex + 1];
          console.log(`Falling back to ${nextProvider.name} (priority: ${(nextProvider as any).priority || 'N/A'}) for plain text due to error: ${errorInfo.errorType}`);
          onProviderSwitch?.(provider.name, nextProvider.name);
          currentProviderIndex++;
          continue;
        }

        // If no fallback possible or last provider, throw the error
        throw error;
      }
    }

    throw lastError || new Error('No LLM providers available for plain text generation');
  }

  // Method to add additional providers in the future
  addProvider(provider: LLMProvider): void {
    this.providers.push(provider);
    // Re-sort providers to maintain priority order
    this.providers.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999));
    console.log(`Added provider ${provider.name} with priority ${(provider as any).priority || 'N/A'}`);
  }

  // Method to get current provider priority order
  getProviderOrder(): string[] {
    return this.providers.map(p => `${p.name} (priority: ${(p as any).priority || 'N/A'})`);
  }

  // Method to get the last used provider
  getLastUsedProvider(): string | null {
    return this.lastUsedProvider;
  }
}

// Global LLM service instance - using module-level state
let llmService: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmService) {
    llmService = new LLMService();
  }
  return llmService;
}

// Test function to force specific LLM provider for testing
export const forceLLMProvider = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { providerName } = data;

  if (!providerName) {
    throw new functions.https.HttpsError('invalid-argument', 'providerName is required');
  }

  if (providerName === 'clear') {
    await setForcedProvider(null);
    getLLMService().clearForcedProvider();
    return { success: true, message: 'Forced provider cleared' };
  }

  const validProviders = ['DeepSeek', 'OpenAI'];
  if (!validProviders.includes(providerName)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid provider name. Must be one of: ${validProviders.join(', ')}`);
  }

  await setForcedProvider(providerName);
  getLLMService().forceProvider(providerName);

  return {
    success: true,
    message: `Forced provider set to: ${providerName}`,
    providerOrder: getLLMService().getProviderOrder()
  };
});
