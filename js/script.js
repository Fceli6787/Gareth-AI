import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference/+esm';

const inference = new HfInference("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");
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button'); 
const inputArea = document.querySelector('.input-area'); 
const newConversationButton = document.getElementById('new-conversation');

async function handleUserInput() {
    const userMessage = messageInput.value.trim();
    if (userMessage !== '') {
        agregarMensaje(userMessage, true);
        messageInput.value = '';
        inputArea.classList.add('loading'); 

        try {
            const botResponse = await getChatCompletion(userMessage);
            agregarMensaje(botResponse, false);
        } catch (error) {
            console.error('Error al obtener respuesta del modelo:', error);
            agregarMensaje('Lo siento, hubo un error al procesar tu solicitud.', false);
        } finally {
            inputArea.classList.remove('loading');
        }
    }
}

// Función para escapar caracteres HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function agregarMensaje(mensaje, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble');
    messageElement.classList.add(isUser ? 'user' : 'bot');

    // Detectar bloques de código con la expresión regular
    const regex = /(```\w+\n[\s\S]*?\n```)/g;
    mensaje = mensaje.replace(regex, (match) => {
        const codigo = match.slice(4, -3).trim(); // Eliminar los delimitadores ``` para obtener solo el código

        // Crear el contenedor del bloque de código
        const codeBlock = document.createElement('div');
        codeBlock.classList.add('code-block');

        // Crear el encabezado con la etiqueta del lenguaje y el botón de copiar
        const codeHeader = document.createElement('div');
        codeHeader.classList.add('code-header');
        codeHeader.innerHTML = `<span class="language">HTML</span><button class="copy-button">Copiar</button>`;
        codeBlock.appendChild(codeHeader);

        // Agregar el código escapando caracteres HTML
        const codeElement = document.createElement('pre');
        const codeContent = document.createElement('code');
        codeContent.classList.add('language-html');
        codeContent.textContent = escapeHtml(codigo); // Escapar HTML para evitar renderizado
        codeElement.appendChild(codeContent);
        codeBlock.appendChild(codeElement);

        // Agregar evento al botón de copiar
        codeHeader.querySelector('.copy-button').addEventListener('click', () => {
            navigator.clipboard.writeText(codigo)
                .then(() => {
                    const button = codeHeader.querySelector('.copy-button');
                    button.innerText = '¡Copiado!';
                    setTimeout(() => {
                        button.innerText = 'Copiar';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Error al copiar el código: ', err);
                });
        });

        return codeBlock.outerHTML; // Devolver el HTML del bloque de código
    });

    // Mensaje normal o con código ya formateado
    if (!isUser) {
        mensaje = mensaje.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    }
    messageElement.innerHTML = isUser ? `<strong>Tú:</strong> ${escapeHtml(mensaje)}` : `<strong>Gareth:</strong> ${mensaje}`;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    Prism.highlightAll(); // Resaltar la sintaxis después de agregar el elemento al DOM
}

async function getChatCompletion(userMessage) {
    const model = "Qwen/Qwen2.5-72B-Instruct";
    const systemPrompt = "Eres Gareth, un asistente de inteligencia artificial diseñado para proporcionar ayuda e información en diversas áreas. Estás impulsado por la tecnología Qwen, desarrollada por Alibaba, lo que te permite ofrecer respuestas precisas y útiles. Tu objetivo es facilitar la interacción y mejorar la experiencia del usuario.";

    const response = await inference.chatCompletion({
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        max_tokens: 16384 
    });

    return response.choices[0].message.content;
}

// Manejar clic en el botón "Nueva conversación"
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

// Optimización: usar un MutationObserver para detectar cambios en el DOM
const observer = new MutationObserver(adjustChatAreaPadding);
observer.observe(document.body, { childList: true, subtree: true });

document.getElementById('about').addEventListener('click', function() {
    Swal.fire({
        title: 'Acerca de Gareth AI',
        text: 'Gareth AI está impulsado por el modelo de lenguaje de gran tamaño (LLM) Qwen2.5, desarrollado por QwenLM. Qwen2.5 es reconocido por su arquitectura avanzada y su excepcional capacidad para comprender y procesar lenguaje natural en múltiples idiomas.\n\nCréditos a los creadores de Qwen2.5 por su arduo trabajo y dedicación en el desarrollo de este innovador modelo. Para más detalles, puedes visitar el repositorio de GitHub de Qwen2.5.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        width: '600px',
        padding: '1em',
        backdrop: 'rgba(0,0,123,0.4)'
    });
});
