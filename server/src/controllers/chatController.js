import mistralService from '../services/mistralService.js';
import Joi from 'joi';

const messageSchema = Joi.object({
  messages: Joi.array().items(
    Joi.object({
      role: Joi.string().valid('user', 'assistant', 'system').required(),
      content: Joi.string().required()
    })
  ).required(),
  config: Joi.object({
    model: Joi.string().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    // Permitimos maxTokens sin límite superior; validamos solo que sea número positivo si se provee
    maxTokens: Joi.number().min(1).optional(),
    topP: Joi.number().min(0).max(1).optional()
  }).optional()
});

export const chatController = {
  // POST /api/chat - Sin streaming
  async sendMessage(req, res) {
    try {
      const { error, value } = messageSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          details: error.details 
        });
      }

      const { messages, config } = value;
      const response = await mistralService.generateResponse(messages, config);

      res.json({ 
        response,
        model: config?.model || 'magistral-medium-latest',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Error al procesar mensaje',
        message: error.message 
      });
    }
  },

  // POST /api/chat/stream - Con streaming via Server-Sent Events
  async streamMessage(req, res) {
    try {
      const { error, value } = messageSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          details: error.details 
        });
      }

      const { messages, config } = value;

      // Configurar SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Para nginx

      try {
        for await (const chunk of mistralService.generateStreamResponse(messages, config)) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (streamError) {
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('Stream error:', error);
      res.status(500).json({ 
        error: 'Error en streaming',
        message: error.message 
      });
    }
  },

  // GET /api/models
  async getModels(req, res) {
    try {
      const models = await mistralService.listAvailableModels();
      res.json({ 
        models,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Models error:', error);
      res.status(500).json({ 
        error: 'Error al obtener modelos',
        message: error.message 
      });
    }
  },

  // GET /api/health
  healthCheck(req, res) {
    res.json({
      status: 'OK',
      service: 'Gareth AI API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
};
