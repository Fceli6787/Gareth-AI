document.addEventListener('DOMContentLoaded', () => {
    // Importaciones de las bibliotecas necesarias
    import('https://cdn.jsdelivr.net/npm/@huggingface/inference/+esm').then(({ HfInference }) => {
        import('https://cdn.jsdelivr.net/npm/openai@4.76.3/+esm').then(({ OpenAI }) => {
            const inference = new HfInference("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");
            const client = new OpenAI({
                baseURL: "https://api-inference.huggingface.co/v1/",
                apiKey: "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",
                dangerouslyAllowBrowser: true
            });

            // Elementos del DOM
            const chatMessages = document.getElementById('chat-messages');
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');
            const modelSwitch = document.getElementById('model-switch');
            const switchHandle = modelSwitch.querySelector('div');
            const newChatButton = document.getElementById('new-chat-button');
            const configButton = document.getElementById('config-button');
            const configModal = document.getElementById('config-modal');
            const closeModal = document.getElementById('close-modal');
            const applyChanges = document.getElementById('apply-changes');
            const modelSelect = document.getElementById('model-select');

            // Variables para el estado del chat
            let chatHistory = [];
            let currentModel = 'text';
            let thinkingInterval;
            let isOn = false;
            let selectedModel = 'Qwen/QwQ-32B-Preview';

            // Función principal para manejar la entrada del usuario
            async function handleUserInput() {
                const userMessage = messageInput.value.trim();
                if (userMessage !== '') {
                    // Agrega el mensaje del usuario al chat
                    agregarMensaje(userMessage, true);
                    messageInput.value = '';

                    if (currentModel === 'text') {
                        // Si es texto, añade al historial y envía la petición
                        chatHistory.push({ role: "user", content: userMessage });

                        // Muestra el mensaje de "Gareth thinking..."
                        const thinkingMessage = agregarMensajeThinking();

                        try {
                            // Obtiene la respuesta del modelo de texto
                            const botResponse = await getChatCompletion(chatHistory);
                            // Reemplaza el mensaje de "Gareth thinking..." con la respuesta real
                            reemplazarMensajeThinking(thinkingMessage, botResponse);
                            chatHistory.push({ role: "assistant", content: botResponse });
                        } catch (error) {
                            console.error('Error al obtener respuesta del modelo:', error);
                            reemplazarMensajeThinking(thinkingMessage, 'Lo siento, hubo un error al procesar tu solicitud.');
                        }
                    } else {
                        // Si es imagen, genera la imagen
                        try {
                            const imageBlob = await query({ inputs: userMessage });
                            const imageUrl = URL.createObjectURL(imageBlob);
                            agregarImagen(imageUrl);
                        } catch (error) {
                            console.error('Error al generar la imagen:', error);
                            agregarMensaje('Lo siento, hubo un error al generar la imagen.', false);
                        }
                    }
                }
            }

            // Función para agregar mensajes al chat
            function agregarMensaje(mensaje, isUser = false) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add(isUser ? 'user-message' : 'bot-message');

                messageElement.innerHTML = isUser ? `<strong>Tú:</strong> ${mensaje}` : `<strong>Gareth:</strong> <span class="bot-response">${mensaje}</span>`;

                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                if (!isUser) {
                    aplicarFormatoEspecial(messageElement);
                }

                return messageElement;
            }

            // Función para mostrar el mensaje "Gareth thinking..."
            function agregarMensajeThinking() {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add('bot-message');
                messageElement.classList.add('thinking');

                messageElement.innerHTML = `<strong>Gareth:</strong> <span class="thinking-message">Iniciando Pensamiento</span>`;

                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Inicia la animación de carga
                let dots = 0;
                thinkingInterval = setInterval(() => {
                    dots = (dots % 4) + 1;
                    messageElement.querySelector('.thinking-message').innerText = `Iniciando Pensamiento${'.'.repeat(dots)}`;
                }, 500);

                return messageElement;
            }

            // Función para reemplazar el mensaje "Gareth thinking..." con la respuesta real
            function reemplazarMensajeThinking(thinkingMessage, botResponse) {
                clearInterval(thinkingInterval);
                thinkingMessage.classList.remove('thinking');
                thinkingMessage.innerHTML = `<strong>Gareth:</strong> <span class="bot-response">${botResponse}</span>`;
                aplicarFormatoEspecial(thinkingMessage);
            }

            // Función para aplicar formato especial al contenido del mensaje
            function aplicarFormatoEspecial(element) {
                let content = element.innerHTML;

                // Reemplazar ### por un estilo de encabezado
                content = content.replace(/### (.+)/g, '<h3>$1</h3>');

                // Detectar bloques de código
                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                content = content.replace(codeBlockRegex, (match, language, code) => {
                    language = language || 'text';
                    code = code.trim();

                    if (code) {
                        return `<div class="code-block">
                                    <div class="code-header">
                                        <span class="language">${language}</span>
                                        <button class="copy-button">Copiar</button>
                                    </div>
                                    <pre><code class="language-${language}">${code}</code></pre>
                                </div>`;
                    }
                    return match;
                });

                // Aplicar formato de negrita
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                element.innerHTML = content;

                // Renderizar LaTeX si es necesario
                if (content.includes('\\(')) {
                    renderMathInElement(element);
                }

                // Aplicar resaltado de sintaxis a los bloques de código
                Prism.highlightAllUnder(element);

                // Agregar funcionalidad de copia a los botones de código
                const codeBlocks = element.querySelectorAll('.code-block');
                codeBlocks.forEach(block => {
                    const copyButton = block.querySelector('.copy-button');
                    const codeElement = block.querySelector('code');

                    copyButton.addEventListener('click', async () => {
                        const codigoParaCopiar = codeElement.textContent;

                        try {
                            await navigator.clipboard.writeText(codigoParaCopiar);
                            copyButton.innerText = '¡Copiado!';
                            setTimeout(() => copyButton.innerText = 'Copiar', 2000);
                        } catch (err) {
                            console.error('Error al copiar:', err);
                            alert('No se pudo copiar. Inténtalo de nuevo o copia manualmente.');
                        }
                    });
                });
            }

            // Función para obtener la respuesta del modelo de texto
            async function getChatCompletion(history) {
                const systemPrompt = "Eres Gareth, un asistente de inteligencia artificial basado en Qwen, desarrollado por Alibaba. Tu objetivo es proporcionar información precisa y útil, interactuando de manera amigable y profesional. Hablaras únicamente el idioma que el usuario se dirija a ti y adáptate a sus necesidades, ofreciendo respuestas claras y relevantes en cada conversación.";

                let maxTokens = selectedModel === 'Qwen/QwQ-32B-Preview' ? 8192 : 16384;

                const chatCompletion = await client.chat.completions.create({
                    model: selectedModel,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history
                    ],
                    max_tokens: maxTokens
                });

                return chatCompletion.choices[0].message.content;
            }

            // Función para renderizar LaTeX en el mensaje
            function renderizarLaTeX(elemento) {
                const textoOriginal = elemento.innerHTML;
                const regex = /(\\$$[\s\S]*?\\$$|\\\[[\s\S]*?\\\]|\\\(.*?\\\)|\\\[.*?\\\])/g;
                let resultado = '';
                let ultimoIndice = 0;

                textoOriginal.replace(regex, (match, formula, indice) => {
                    resultado += textoOriginal.slice(ultimoIndice, indice);

                    try {
                        const esDisplayMode = formula.startsWith('\\[') || formula.startsWith('\\(');
                        const formulaLimpia = formula.slice(esDisplayMode ? 2 : 1, -1 * (esDisplayMode ? 2 : 1));

                        const formulaRendered = katex.renderToString(formulaLimpia, {
                            displayMode: esDisplayMode,
                            throwOnError: false
                        });
                        resultado += formulaRendered;
                    } catch (error) {
                        console.error('Error al renderizar LaTeX:', error);
                        resultado += formula;
                    }

                    ultimoIndice = indice + formula.length;
                });

                resultado += textoOriginal.slice(ultimoIndice);
                elemento.innerHTML = resultado;
            }

            // Función para agregar la imagen generada al chat
            function agregarImagen(imageUrl) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add('bot-message');

                const imageElement = document.createElement('img');
                imageElement.src = imageUrl;
                imageElement.alt = 'Imagen generada por IA';

                // Ajustar el tamaño de la imagen después de cargarla
                imageElement.onload = function() {
                    adjustImageSize(imageElement);
                };

                messageElement.appendChild(imageElement);

                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            // Función para ajustar el tamaño de la imagen
            function adjustImageSize(image) {
                const maxWidth = image.parentElement.offsetWidth; // Ancho máximo del contenedor
                const maxHeight = 300; // Altura máxima (ajusta según tus necesidades)

                if (image.width > maxWidth || image.height > maxHeight) {
                    if (image.width / image.height > maxWidth / maxHeight) {
                        image.style.width = maxWidth + 'px';
                        image.style.height = 'auto';
                    } else {
                        image.style.width = 'auto';
                        image.style.height = maxHeight + 'px';
                    }
                }
            }

            // Función para realizar la consulta a la API de generación de imágenes
            async function query(data) {
                const response = await fetch(
                    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
                    {
                        headers: {
                            Authorization: "Bearer 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",
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify(data),
                    }
                );
                const result = await response.blob();
                return result;
            }

            // Eventos de escucha
            sendButton.addEventListener('click', handleUserInput);
            messageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    handleUserInput();
                }
            });

            // Evento para cambiar de modelo (texto a imagen)
            modelSwitch.addEventListener('click', () => {
                isOn = !isOn;

                if (isOn) {
                    // Modelo activado (derecha)
                    switchHandle.style.transform = 'translateX(100%)';
                    modelSwitch.classList.remove('bg-white', 'bg-opacity-30');
                    modelSwitch.classList.add('bg-green-500');
                    currentModel = 'image';
                    messageInput.placeholder = 'Describe la imagen que deseas generar...';
                } else {
                    // Modelo desactivado (izquierda)
                    switchHandle.style.transform = 'translateX(0)';
                    modelSwitch.classList.remove('bg-green-500');
                    modelSwitch.classList.add('bg-white', 'bg-opacity-30');
                    currentModel = 'text';
                    messageInput.placeholder = 'Introduce una petición aquí...';
                }
            });

            // Evento para iniciar un nuevo chat
            newChatButton.addEventListener('click', () => {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: '¿Deseas iniciar una nueva conversación?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            });

            // Evento para abrir el modal de configuración
            configButton.addEventListener('click', () => {
                configModal.classList.remove('hidden');
            });

            // Evento para cerrar el modal de configuración
            closeModal.addEventListener('click', () => {
                configModal.classList.add('hidden');
            });

            // Evento para aplicar los cambios de configuración
            applyChanges.addEventListener('click', () => {
                selectedModel = modelSelect.value;

                // Mostrar SweetAlert2
                Swal.fire({
                    title: 'Cambio de Modelo',
                    text: 'Se requiere reiniciar la conversación para cambiar el modelo.',
                    icon: 'info',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            });

            // Ajustar el padding inferior del área de chat para no superponerse con el input
            function adjustChatAreaPadding() {
                const inputArea = document.querySelector('.input-container');
                const chatArea = document.querySelector('.chat-area');

                if (inputArea && chatArea) {
                    const inputAreaHeight = inputArea.offsetHeight;
                    chatArea.style.paddingBottom = inputAreaHeight + 10 + 'px';
                }
            }

            window.addEventListener('load', adjustChatAreaPadding);
            window.addEventListener('resize', adjustChatAreaPadding);

            const observer = new MutationObserver(adjustChatAreaPadding);
            observer.observe(document.body, { childList: true, subtree: true });
        });
    });
});
