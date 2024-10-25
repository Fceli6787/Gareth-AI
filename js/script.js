import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference@2.8.1/+esm';

const inference = new HfInference("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");
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const inputArea = document.querySelector('.input-area');
const newConversationButton = document.getElementById('new-conversation');

let chatHistory = [];

async function handleUserInput() {
    const userMessage = messageInput.value.trim();
    if (userMessage !== '') {
        agregarMensaje(userMessage, true);
        messageInput.value = '';
        inputArea.classList.add('loading');

        // Agregar el mensaje del usuario al historial
        chatHistory.push({ role: "user", content: userMessage });

        try {
            const botResponse = await getChatCompletion(chatHistory);
            agregarMensaje(botResponse, false);
            // Agregar la respuesta del bot al historial
            chatHistory.push({ role: "assistant", content: botResponse });
        } catch (error) {
            console.error('Error al obtener respuesta del modelo:', error);
            agregarMensaje('Lo siento, hubo un error al procesar tu solicitud.', false);
        } finally {
            inputArea.classList.remove('loading');
        }
    }
}

function agregarMensaje(mensaje, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble');
    messageElement.classList.add(isUser ? 'user' : 'bot');

    // Reemplazar ### por un estilo de encabezado
    mensaje = mensaje.replace(/### (.+)/g, '<h3>$1</h3>');

    // Detectar bloques de código con la expresión regular
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    mensaje = mensaje.replace(regex, (match, lenguaje, codigo) => {
        const codeBlock = document.createElement('div');
        codeBlock.classList.add('code-block');

        const codeHeader = document.createElement('div');
        codeHeader.classList.add('code-header');
        codeHeader.innerHTML = `<span class="language">${lenguaje || ''}</span><button class="copy-button">Copiar</button>`;
        codeBlock.appendChild(codeHeader);

        const codeElement = document.createElement('pre');
        const codeContent = document.createElement('code');
        codeContent.classList.add(`language-${lenguaje || ''}`);
        codeContent.textContent = codigo;
        codeElement.appendChild(codeContent);
        codeBlock.appendChild(codeElement);

        return codeBlock.outerHTML;
    });

    if (!isUser) {
        mensaje = mensaje.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    messageElement.innerHTML = isUser ? `<strong>Tú:</strong> ${mensaje}` : `<strong>Gareth:</strong> ${mensaje}`;

    if (!isUser && mensaje.includes('\\(')) {
        renderizarLaTeX(messageElement);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    Prism.highlightAll();

    const codeBlocks = messageElement.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        const copyButton = block.querySelector('.copy-button');
        const codeElement = block.querySelector('code');

        copyButton.addEventListener('click', async () => {
            const codigoParaCopiar = codeElement.textContent;

            try {
                await navigator.permissions.query({ name: 'clipboard-write' });
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

async function getChatCompletion(history) {
    const model = "Qwen/Qwen2.5-72B-Instruct";
    const systemPrompt = "Eres Gareth, un asistente de inteligencia artificial basado en Qwen, desarrollado por Alibaba. Tu objetivo es proporcionar información precisa y útil, interactuando de manera amigable y profesional. Habla únicamente el idioma que el usuario se dirija a ti y adáptate a sus necesidades, ofreciendo respuestas claras y relevantes en cada conversación.";

    const response = await inference.chatCompletion({
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            ...history // Enviar el historial de mensajes
        ],
        max_tokens: 16384
    });

    return response.choices[0].message.content;
}

function renderizarLaTeX(elemento) {
    const textoOriginal = elemento.innerHTML;
    const regex = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\(\\[^\)]*?\)\)|\\\([^\)]*\\\))/g;
    let resultado = '';
    let ultimoIndice = 0;

    textoOriginal.replace(regex, (match, formula, indice) => {
        resultado += textoOriginal.slice(ultimoIndice, indice);

        try {
            const esDisplayMode = formula.startsWith('\\[') || formula.startsWith('(\\[');
            const formulaLimpia = formula.slice(esDisplayMode ? (formula.startsWith('(\\[') ? 3 : 2) : (formula.startsWith('\\(') ? 2 : 1), -1 * (esDisplayMode ? (formula.startsWith('(\\[') ? 3 : 2) : (formula.startsWith('\\(') ? 2 : 1)));

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

newConversationButton.addEventListener('click', () => {
    console.log("Nueva conversación");
    location.reload();
});

sendButton.addEventListener('click', handleUserInput);
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleUserInput();
    }
});

function adjustChatAreaPadding() {
    const inputArea = document.querySelector('.input-area');
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

document.getElementById('about').addEventListener('click', function() {
Swal.fire({
    title: 'Acerca de Gareth AI',
    html: 'Gareth AI está impulsado por el modelo de lenguaje de gran tamaño (LLM) Qwen2.5, desarrollado por QwenLM. Qwen2.5 es reconocido por su arquitectura avanzada y su excepcional capacidad para comprender y procesar lenguaje natural en múltiples idiomas.<br><br>Créditos a los creadores de Qwen2.5 por su arduo trabajo y dedicación en el desarrollo de este innovador modelo. Para más detalles, puedes visitar el <a href="https://github.com/QwenLM/Qwen2.5" target="_blank">repositorio de GitHub de Qwen2.5</a>.<br><br>Desarrollado por Andres Felipe Celi.',
    icon: 'info',
    confirmButtonText: 'Aceptar',
    width: '600px',
    padding: '1em',
    backdrop: 'rgba(0,0,123,0.4)'
});



window.addEventListener('load', () => {
    adjustChatAreaPadding();
    const audio = document.getElementById('audio');
    audio.play().catch(error => {
        console.error('Error al reproducir el audio:', error);
    });
});
