import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { rateLimit } from 'express-rate-limit';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Variables de entorno cargadas via import 'dotenv/config'

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de seguridad
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Gareth AI API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      stream: '/api/chat/stream',
      models: '/api/models'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (debe ir al final)
app.use((err, req, res, next) => errorHandler(err, req, res, next));

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🤖 Gareth AI Server                ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`\n🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log('\n✨ Esperando conexiones...\n');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});
