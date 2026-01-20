import { mistralClient, DEFAULT_CONFIG, MODELS } from '../config/mistral.js';

/**
 * Algoritmo de deduplicación OPTIMIZADO para el backend.
 * Solo limpia artifacts - la deduplicación principal se hace en el frontend.
 */
function cleanReasoningArtifacts(reasoning) {
  if (!reasoning) return '';
  return reasoning
    .replace(/textthinking/gi, '')
    .replace(/\bthinking\b/gi, '')
    .replace(/([A-Za-z])\1{2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Limpieza rápida de texto visible
 */
function cleanVisibleArtifacts(visible) {
  if (!visible) return '';
  return visible
    .replace(/textthinking/gi, '')
    .replace(/\bthinking\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class MistralService {
  constructor() {
    this.systemPrompt = `Eres Gareth, un asistente de inteligencia artificial avanzado basado en Mistral AI. 
Tu objetivo es proporcionar información precisa, útil y detallada de manera profesional y amigable. 
Adapta tu lenguaje al idioma del usuario y ofrece respuestas claras, bien estructuradas y relevantes.

FORMATO MATEMÁTICO (LaTeX):
- Usa SIEMPRE delimitadores estándar para fórmulas matemáticas.
- Para fórmulas en línea (dentro del texto), usa un solo signo de dólar: $E = mc^2$
- Para fórmulas en bloque (centradas), usa doble signo de dólar: $$E = mc^2$$
- NO uses corchetes \\[...\\] ni paréntesis \\(...\\) para fórmulas.

Cuando proporciones código, asegúrate de explicarlo claramente y usar las mejores prácticas.
Si el usuario pregunta sobre programación, desarrollo web, o tecnología, proporciona ejemplos prácticos y útiles.`;
  }

  async generateResponse(messages, config = {}) {
    try {
      const attemptCall = async (callConfig) => {
        return await mistralClient.chat.complete(callConfig);
      };

      const baseConfig = {
        model: config.model || DEFAULT_CONFIG.model,
        messages: [{ role: 'system', content: this.systemPrompt }, ...messages],
        temperature: (config.temperature !== undefined) ? config.temperature : DEFAULT_CONFIG.temperature,
        topP: (config.topP !== undefined) ? config.topP : DEFAULT_CONFIG.topP,
        safePrompt: (config.safePrompt !== undefined) ? config.safePrompt : DEFAULT_CONFIG.safePrompt
      };

      if (config.maxTokens !== undefined) baseConfig.maxTokens = config.maxTokens;
      else if (DEFAULT_CONFIG.maxTokens !== undefined) baseConfig.maxTokens = DEFAULT_CONFIG.maxTokens;

      let lastError;
      let attempt = 0;
      const maxAttempts = 2;
      while (attempt < maxAttempts) {
        try {
          const response = await attemptCall(baseConfig);
          return response.choices[0].message.content;
        } catch (err) {
          lastError = err;
          attempt += 1;
          const status = err?.statusCode || err?.status || null;
          if (status === 429) {
            console.warn('Quota 429 on model', baseConfig.model, '- retrying with fallback model');
            baseConfig.model = (baseConfig.model === MODELS.SMALL) ? MODELS.SMALL : MODELS.SMALL;
            await new Promise(r => setTimeout(r, 500 * attempt));
            continue;
          }
          await new Promise(r => setTimeout(r, 300 * attempt));
        }
      }
      throw lastError;
    } catch (error) {
      console.error('Mistral API Error:', error);
      throw new Error('Error al generar respuesta de IA');
    }
  }

  async *generateStreamResponse(messages, config = {}) {
    try {
      const makeStream = async (callConfig) => await mistralClient.chat.stream(callConfig);

      const baseConfig = {
        model: config.model || DEFAULT_CONFIG.model,
        messages: [{ role: 'system', content: this.systemPrompt }, ...messages],
        temperature: (config.temperature !== undefined) ? config.temperature : DEFAULT_CONFIG.temperature,
        topP: (config.topP !== undefined) ? config.topP : DEFAULT_CONFIG.topP
      };

      if (config.maxTokens !== undefined) baseConfig.maxTokens = config.maxTokens;
      else if (DEFAULT_CONFIG.maxTokens !== undefined) baseConfig.maxTokens = DEFAULT_CONFIG.maxTokens;

      try {
        let stream = await makeStream(baseConfig);
        for await (const chunk of stream) {
          const delta = chunk.data?.choices?.[0]?.delta;
          const content = delta?.content;
          if (!content) continue;

          if (typeof content === 'string') {
            const isLikelyReasoning = (s) => {
              if (!s) return false;

              const latexPatterns = /\\(?:frac|int|sum|prod|sqrt|left|right|begin|end|text|mathbb|mathcal|ln|log|sin|cos|tan|lim|infty|alpha|beta|gamma|delta|pi|boxed|cdot|cdots|ldots|times|div|pm|mp|leq|geq|neq|approx|equiv|subset|supset|cap|cup|forall|exists|partial|nabla|vec|hat|bar|dot|ddot|overline|underline|overbrace|underbrace)/i;
              if (latexPatterns.test(s)) return false;

              if (/\$[^$]+\$/.test(s)) return false;
              if (/\{[^{}]*\}/.test(s) && !/^[\[{]\s*$/.test(s.trim())) return false;

              const lower = s.toLowerCase();
              if (lower.includes('textthinking')) return true;
              if (/\[\{.*"thinking"/.test(s)) return true;
              if (lower.includes('thinking') && !latexPatterns.test(s)) return true;

              if (s.length > 50) {
                if (lower.startsWith('ok,') || lower.startsWith('ok ')) return true;
                if (lower.includes('ok, el usuario') || lower.includes('ok el usuario')) return true;
              }
              return false;
            };

            if (isLikelyReasoning(content)) {
              yield { reasoning: content, visible: '' };
            } else {
              yield { visible: content, reasoning: '' };
            }
            continue;
          }

          let reasoning = '';
          let visible = '';

          const traverse = (node, inThinking = false) => {
            if (node == null) return;
            if (typeof node === 'string') {
              if (inThinking) reasoning += node;
              else visible += node;
              return;
            }
            if (Array.isArray(node)) {
              for (const item of node) traverse(item, inThinking);
              return;
            }
            if (typeof node === 'object') {
              if (Array.isArray(node.thinking)) {
                for (const part of node.thinking) {
                  traverse(part, true);
                }
              }
              if (!inThinking) {
                if (typeof node.text === 'string') visible += node.text;
                if (typeof node.value === 'string') visible += node.value;
              }
              for (const [k, v] of Object.entries(node)) {
                if (k === 'thinking') continue;
                traverse(v, inThinking);
              }
            }
          };

          traverse(content);

          const cleanedVisible = cleanVisibleArtifacts(visible);
          const cleanedReasoning = cleanReasoningArtifacts(reasoning);

          // IMPORTANTE: Enviar cadenas vacías, NUNCA undefined
          yield {
            reasoning: cleanedReasoning || '',
            visible: cleanedVisible || ''
          };
        }
      } catch (err) {
        const status = err?.statusCode || err?.status || null;
        if (status === 429) {
          console.warn('Stream 429 for model', baseConfig.model, '- falling back to', MODELS.SMALL);
          baseConfig.model = MODELS.SMALL;
          const stream = await makeStream(baseConfig);
          for await (const chunk of stream) {
            const delta = chunk.data?.choices?.[0]?.delta;
            const content = delta?.content;
            if (!content) continue;

            if (typeof content === 'string') {
              yield { visible: content, reasoning: '' };
              continue;
            }

            let reasoning = '';
            let visible = '';
            const extract = (node) => {
              if (node == null) return '';
              if (typeof node === 'string') return node;
              if (Array.isArray(node)) return node.map(extract).join('');
              if (typeof node === 'object') {
                let acc = '';
                if (Array.isArray(node.thinking)) {
                  for (const part of node.thinking) {
                    if (typeof part.text === 'string') acc += part.text;
                  }
                }
                if (typeof node.text === 'string') visible += node.text;
                if (typeof node.value === 'string') visible += node.value;
                for (const v of Object.values(node)) acc += extract(v);
                return acc;
              }
              return '';
            };

            reasoning += extract(content);
            // IMPORTANTE: Enviar cadenas vacías, NUNCA undefined
            yield {
              reasoning: reasoning || '',
              visible: visible || ''
            };
          }
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Mistral Stream Error:', error);
      throw new Error('Error en streaming de IA');
    }
  }

  async listAvailableModels() {
    try {
      const models = await mistralClient.models.list();
      return models.data;
    } catch (error) {
      console.error('Error listing models:', error);
      throw new Error('Error al listar modelos');
    }
  }
}

export default new MistralService();
