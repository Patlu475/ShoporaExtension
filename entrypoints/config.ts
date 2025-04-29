import { defineUnlistedScript } from 'wxt/sandbox';

/**
 * Configuration for OpenAI service - UI Only Version
 * This is just a placeholder with no actual functionality
 */
export interface OpenAIConfig {
  API_URL: string;
  API_KEY: string;
  DEFAULT_MODEL: string;
}

/**
 * Default configuration - UI Only Version
 */
export const OPENAI_CONFIG: OpenAIConfig = {
  API_URL: 'https://api.openai.com/v1',
  API_KEY: '',
  DEFAULT_MODEL: 'gpt-3.5-turbo'
};

/**
 * Update configuration (UI-only placeholder)
 */
export function updateConfig<T>(config: T, values: Partial<T>): T {
  return { ...config, ...values };
}

// Add default export using defineUnlistedScript
export default defineUnlistedScript(() => {
  // UI-only placeholder
}); 