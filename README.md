<div align="center">

# 🤖 Gareth AI

### Asistente de Inteligencia Artificial Avanzado

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-FF4F00?style=for-the-badge&logo=mistralai&logoColor=white)](https://mistral.ai/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

Una aplicación web moderna de chat conversacional impulsada por **Mistral AI**, diseñada con una arquitectura full-stack profesional y una interfaz glassmorphism púrpura elegante.

[Demo](#-demo) • [Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación)

</div>

---

## 📖 Descripción

**Gareth AI** es un chatbot inteligente de última generación que utiliza los modelos de lenguaje de **Mistral AI** para proporcionar respuestas precisas, contextuales y útiles. Con una arquitectura moderna separada en frontend (React) y backend (Node.js), ofrece una experiencia de usuario fluida con streaming en tiempo real, renderizado de código con resaltado de sintaxis, soporte matemático LaTeX y más.

### 🎯 Propósito

Este proyecto demuestra cómo construir una aplicación de chat AI profesional con:
- Arquitectura cliente-servidor escalable
- Streaming de respuestas en tiempo real (SSE)
- Integración con APIs de LLMs modernas
- UI/UX de clase mundial con efectos glassmorphism
- Seguridad y rate limiting
- Código limpio y mantenible

---

## ✨ Características

### 🧠 Inteligencia Artificial
- **Múltiples modelos Mistral AI**: Small, Medium, Large y Codestral
- **Streaming en tiempo real**: Respuestas que se generan palabra por palabra
- **Configuración avanzada**: Control de temperatura, max tokens y más
- **Historial contextual**: Mantiene el contexto de la conversación

### 🎨 Interfaz de Usuario
- **Diseño Glassmorphism**: Efectos de vidrio esmerilado con gradientes púrpura
- **Tema oscuro elegante**: Optimizado para reducir fatiga visual
- **Responsive Design**: Funciona perfectamente en desktop, tablet y móvil
- **Animaciones suaves**: Transiciones fluidas y efectos visuales

### 💻 Renderizado Avanzado
- **Markdown completo**: Encabezados, listas, tablas, enlaces, citas
- **Resaltado de código**: Syntax highlighting con Prism.js para 100+ lenguajes
- **Matemáticas LaTeX**: Renderizado de fórmulas con KaTeX
- **Botón de copiar**: Copia código con un solo clic

### 🔧 Características Técnicas
- **Arquitectura RESTful**: API bien estructurada y documentada
- **Rate Limiting**: Protección contra abuso
- **Validación de datos**: Validación robusta con Joi
- **Manejo de errores**: Sistema completo de error handling
- **CORS configurado**: Seguridad en comunicación cliente-servidor

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19.2.0 | Framework UI principal |
| **Vite** | 7.2.5 | Build tool ultra-rápido |
| **Axios** | 1.13.2 | Cliente HTTP |
| **Zustand** | 5.0.10 | State management |
| **React Markdown** | 10.1.0 | Renderizado de markdown |
| **React Syntax Highlighter** | 16.1.0 | Resaltado de código |
| **KaTeX** | 0.16.27 | Renderizado de matemáticas |
| **SweetAlert2** | 11.26.17 | Modales y alertas |
| **Framer Motion** | 12.26.2 | Animaciones |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 20+ | Runtime de JavaScript |
| **Express** | 5.2.1 | Framework web |
| **Mistral AI SDK** | 1.11.0 | Integración con Mistral AI |
| **Helmet** | 8.1.0 | Seguridad HTTP headers |
| **Express Rate Limit** | 8.2.1 | Rate limiting |
| **Joi** | 18.0.2 | Validación de schemas |
| **Winston** | 3.19.0 | Logging |
| **Socket.io** | 4.8.3 | WebSocket (futuro) |

---

## 📦 Instalación

### Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** v20 o superior ([Descargar](https://nodejs.org/))
- **npm** v9 o superior (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **Cuenta Mistral AI** ([Registrarse gratis](https://console.mistral.ai/))

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Fceli6787/Gareth-AI.git
cd Gareth-AI
```

### Paso 2: Configurar el Backend

```bash
# Navegar a la carpeta del servidor
cd server

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env y agregar tu API Key de Mistral AI
nano .env  # o usa tu editor favorito
```

**Configuración del archivo `.env`:**

```env
MISTRAL_API_KEY=tu_api_key_de_mistral_aqui
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> 💡 **Obtén tu API Key**: Ve a https://console.mistral.ai/ → API Keys → Create new key

### Paso 3: Configurar el Frontend

```bash
# Navegar a la carpeta del cliente
cd ../client

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env (opcional, valores por defecto funcionan)
nano .env
```

**Configuración del archivo `.env`:**

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🚀 Uso

### Desarrollo

Necesitarás **dos terminales abiertas** simultáneamente:

#### Terminal 1 - Backend

```bash
cd server
npm run dev
```

Deberías ver:

```
╔═══════════════════════════════════════╗
║   🤖 Gareth AI Server                ║
╚═══════════════════════════════════════╝

🚀 Servidor corriendo en: http://localhost:3001
🌍 Entorno: development
📡 API disponible en: http://localhost:3001/api
💚 Health check: http://localhost:3001/api/health

✨ Esperando conexiones...
```

#### Terminal 2 - Frontend

```bash
cd client
npm run dev
```

Deberías ver:

```
ROLLDOWN-VITE v7.2.5  ready in 280 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173/**

---

## 📁 Estructura del Proyecto

```
gareth-ai/
├── client/                      # Frontend React
│   ├── public/                  # Archivos estáticos
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── Chat/
│   │   │   │   ├── ChatHeader.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── WelcomeCard.jsx
│   │   │   │   └── ThinkingIndicator.jsx
│   │   │   ├── Sidebar/
│   │   │   │   └── Sidebar.jsx
│   │   │   └── Modal/
│   │   │       └── ConfigModal.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useChat.js
│   │   ├── services/            # API services
│   │   │   └── api.js
│   │   ├── styles/              # CSS global
│   │   │   └── globals.css
│   │   ├── App.jsx              # Componente principal
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Variables de entorno
│   ├── vite.config.js           # Configuración Vite
│   └── package.json
│
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── config/              # Configuraciones
│   │   │   └── mistral.js
│   │   ├── controllers/         # Controladores
│   │   │   └── chatController.js
│   │   ├── services/            # Lógica de negocio
│   │   │   └── mistralService.js
│   │   ├── routes/              # Rutas API
│   │   │   └── chatRoutes.js
│   │   ├── middlewares/         # Middlewares
│   │   │   └── errorHandler.js
│   │   └── server.js            # Entry point
│   ├── .env                     # Variables de entorno
│   └── package.json
│
└── README.md                    # Este archivo
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3001/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/chat` | Enviar mensaje (sin streaming) |
| `POST` | `/chat/stream` | Enviar mensaje (con streaming SSE) |
| `GET` | `/models` | Obtener lista de modelos disponibles |
| `GET` | `/health` | Health check del servidor |

### Ejemplo de Request

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hola, ¿cómo estás?"}
    ],
    "config": {
      "model": "mistral-large-latest",
      "temperature": 0.7,
      "maxTokens": 2048
    }
  }'
```

### Ejemplo de Response

```json
{
  "response": "¡Hola! Estoy funcionando perfectamente. ¿En qué puedo ayudarte hoy?",
  "model": "mistral-large-latest",
  "timestamp": "2026-01-17T19:50:30.000Z"
}
```

---

## 🎨 Capturas de Pantalla

*(Agrega capturas de pantalla aquí cuando las tengas)*

### Pantalla Principal
![Gareth AI Main](./screenshots/main.png)

### Chat en Acción
![Chat Interface](./screenshots/chat.png)

### Configuración de Modelos
![Config Modal](./screenshots/config.png)

---

## 🔧 Configuración Avanzada

### Modelos Disponibles

```javascript
// mistral-small-latest: Rápido y eficiente
// mistral-medium-latest: Equilibrado
// mistral-large-latest: Máximo rendimiento (recomendado)
// codestral-latest: Especializado en código
```

### Parámetros de Configuración

- **Temperature** (0.0 - 2.0): Controla la creatividad
  - 0.0 = Preciso y determinista
  - 1.0 = Balanceado (recomendado)
  - 2.0 = Muy creativo

- **Max Tokens** (256 - 16384): Longitud máxima de respuesta
  - 2048 = Respuestas cortas
  - 4096 = Respuestas medias (recomendado)
  - 8192+ = Respuestas largas

---

## 📚 Scripts Disponibles

### Frontend (client/)

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Construye para producción
npm run preview   # Preview de build de producción
npm run lint      # Linter de código
```

### Backend (server/)

```bash
npm run dev       # Inicia servidor con nodemon
npm start         # Inicia servidor en producción
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Despliega la carpeta dist/
```

**Variables de entorno en producción:**
```
VITE_API_URL=https://tu-api-backend.com/api
```

### Backend (Railway/Render/Heroku)

```bash
cd server
npm install
npm start
```

**Variables de entorno en producción:**
```
MISTRAL_API_KEY=tu_api_key
PORT=3001
CLIENT_URL=https://tu-frontend.com
NODE_ENV=production
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

- [x] Integración con Mistral AI
- [x] Streaming en tiempo real
- [x] Resaltado de sintaxis
- [x] Soporte matemático LaTeX
- [ ] Historial de conversaciones persistente
- [ ] Autenticación de usuarios
- [ ] Soporte para imágenes (Multimodal)
- [ ] Exportar conversaciones a PDF/Markdown
- [ ] Modo de voz (Speech-to-Text)
- [ ] Plugin system para extensiones
- [ ] Soporte para múltiples LLMs (OpenAI, Anthropic, etc.)

---

## 🐛 Troubleshooting

### Error 401 Unauthorized

**Problema:** La API Key de Mistral AI es inválida.

**Solución:**
1. Verifica que tu API Key esté correcta en `server/.env`
2. Asegúrate de no tener espacios o comillas extra
3. Reinicia el servidor backend

### Puerto en uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solución:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

### CORS Error

**Problema:** Error de CORS al hacer requests.

**Solución:** Verifica que `CLIENT_URL` en `server/.env` coincida con la URL del frontend.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Créditos

### Modelos de IA
- **Mistral AI** - Por sus increíbles modelos de lenguaje de código abierto
  - [Mistral AI](https://mistral.ai/)
  - [Documentación Mistral](https://docs.mistral.ai/)

### Tecnologías
- **React Team** - Por el mejor framework UI
- **Vite Team** - Por el build tool más rápido
- **Express.js** - Por el framework backend más popular

### Inspiración
- Diseño inspirado en las mejores prácticas de UI/UX modernas
- Glassmorphism design trend

---

## 👨‍💻 Autor

**Fernando Celi**
- GitHub: [@Fceli6787](https://github.com/Fceli6787)
- Proyecto: [Gareth-AI](https://github.com/Fceli6787/Gareth-AI)

---

## 💬 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la sección de [Troubleshooting](#-troubleshooting)
2. Busca en [Issues existentes](https://github.com/Fceli6787/Gareth-AI/issues)
3. Crea un [nuevo Issue](https://github.com/Fceli6787/Gareth-AI/issues/new)

---

<div align="center">

### ⭐ Si te gusta este proyecto, dale una estrella en GitHub!

**¡Gracias por usar Gareth AI!** 🤖💜

Made with ❤️ and ☕ by [Andres Felipe Celi](https://github.com/AndresFelipeCeli)

</div>
```

***

## 📸 Bonus: Archivos Opcionales

También puedes crear estos archivos adicionales:

### `.env.example` (para client/)
```env
VITE_API_URL=http://localhost:3001/api
```

### `.env.example` (para server/)
```env
MISTRAL_API_KEY=tu_api_key_aqui
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### `CONTRIBUTING.md`

# Guía de Contribución

Gracias por tu interés en contribuir a Gareth AI...

### `LICENSE`
MIT License

Copyright (c) 2026 Andres Felipe Celi
