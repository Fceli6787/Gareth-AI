import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api';

/**
 * Algoritmo de deduplicación OPTIMIZADO - solo se ejecuta al final del stream.
 * Detecta si el razonamiento es duplicado del texto visible.
 */
function deduplicateReasoningFromVisible(reasoning, visible) {
  if (!reasoning || !visible) return reasoning || '';

  // Limpieza rápida de artifacts
  const cleanReasoning = reasoning
    .replace(/textthinking/gi, '')
    .replace(/\bthinking\b/gi, '')
    .replace(/([A-Za-z])\1{2,}/g, '$1') // "VV" -> "V"
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanReasoning || cleanReasoning.length < 5) return '';

  const cleanVisible = visible.toLowerCase().replace(/\s+/g, ' ');
  const normalizedReasoning = cleanReasoning.toLowerCase();

  // Verificación rápida: si está contenido, eliminar
  if (cleanVisible.includes(normalizedReasoning)) {
    return '';
  }

  // Verificación rápida de similitud: primeras y últimas 3 palabras
  const words = normalizedReasoning.split(' ').filter(w => w.length > 2);
  if (words.length > 5) {
    const firstPart = words.slice(0, 3).join(' ');
    const lastPart = words.slice(-3).join(' ');

    if (cleanVisible.includes(firstPart) && cleanVisible.includes(lastPart)) {
      return '';
    }
  }

  return cleanReasoning;
}

/**
 * Limpieza RÁPIDA de artifacts - para usar en tiempo real durante el stream
 */
function quickClean(text) {
  if (!text) return '';
  return text.replace(/textthinking/gi, '').replace(/\bthinking\b/gi, '');
}

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
  const [currentReasoning, setCurrentReasoning] = useState('');
  const [eventSource, setEventSource] = useState(null);

  const sendMessage = useCallback(async (userMessage, config, useStreaming = true) => {
    if (!userMessage.trim()) return;

    // Agregar mensaje del usuario y asegurar que usamos el estado más reciente
    const newUserMessage = { role: 'user', content: userMessage };
    let updatedMessages;
    setMessages(prev => {
      updatedMessages = [...prev, newUserMessage];
      return updatedMessages;
    });

    if (useStreaming) {
      // Streaming con Server-Sent Events
      setIsLoading(true);
      setCurrentStreamedMessage('');

      try {
        const url = new URL(`${import.meta.env.VITE_API_URL}/chat/stream`);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            config
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedMessage = '';
        let accumulatedReasoning = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);

            if (data === '[DONE]') {
              // Aplicar deduplicación final antes de guardar el mensaje
              const cleanedVisible = quickClean(accumulatedMessage).replace(/\s+/g, ' ').trim();
              const cleanedReasoning = deduplicateReasoningFromVisible(accumulatedReasoning, cleanedVisible);

              setMessages(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content: cleanedVisible,
                  reasoning: cleanedReasoning || undefined
                }
              ]);
              setCurrentStreamedMessage('');
              setCurrentReasoning('');
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content !== undefined) {
                const c = parsed.content;
                if (typeof c === 'string') {
                  accumulatedMessage += c;
                  setCurrentStreamedMessage(accumulatedMessage);
                } else if (typeof c === 'object' && c !== null) {
                  if (typeof c.visible === 'string') {
                    // Filtrar string "undefined" por seguridad
                    if (c.visible && c.visible !== 'undefined') {
                      accumulatedMessage += c.visible;
                      // Limpieza RÁPIDA en tiempo real (sin deduplicación pesada)
                      setCurrentStreamedMessage(quickClean(accumulatedMessage));
                    }
                  }
                  if (typeof c.reasoning === 'string') {
                    // Filtrar string "undefined" por seguridad
                    if (c.reasoning && c.reasoning !== 'undefined') {
                      accumulatedReasoning += c.reasoning;
                      // Solo limpieza rápida en tiempo real
                      setCurrentReasoning(quickClean(accumulatedReasoning));
                    }
                  }
                }
              }

              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.'
          }
        ]);
        setCurrentStreamedMessage('');
        setIsLoading(false);
      }
    } else {
      // Petición normal sin streaming
      setIsLoading(true);
      try {
        const response = await chatAPI.sendMessage(updatedMessages, config);
        const botMessage = { role: 'assistant', content: response.response };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Send message error:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${error.message || 'No se pudo procesar tu solicitud'}`
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentStreamedMessage('');
    setCurrentReasoning('');
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  }, [eventSource]);

  const stopGeneration = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsLoading(false);
    setCurrentStreamedMessage('');
    setCurrentReasoning('');
  }, [eventSource]);

  return {
    messages,
    isLoading,
    currentStreamedMessage,
    currentReasoning,
    sendMessage,
    clearChat,
    stopGeneration
  };
};
