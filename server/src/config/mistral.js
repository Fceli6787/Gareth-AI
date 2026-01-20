import { Mistral } from '@mistralai/mistralai';

export const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

export const MODELS = {
  SMALL: 'magistral-small-latest',
  MEDIUM: 'magistral-medium-latest',
  CODESTRAL: 'codestral-latest'
};
  
export const DEFAULT_CONFIG = {
  model: MODELS.MEDIUM,
  temperature: 0.7,
  // No imponemos un límite por defecto de tokens aquí. Si se necesita forzar
  // un límite, pasar `maxTokens` explícitamente en `config`.
  topP: 1,
  safePrompt: false
};
