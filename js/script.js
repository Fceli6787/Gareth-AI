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

function escapeHTML(html) {
    const div = document.createElement('div');
    div.innerText = html;
    return div.innerHTML;
}

function agregarMensaje(mensaje, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble');
    messageElement.classList.add(isUser ? 'user' : 'bot'); 

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
        codeContent.textContent = escapeHTML(codigo); // Escapar el código aquí
        codeElement.appendChild(codeContent);
        codeBlock.appendChild(codeElement);

        // Evento para copiar el código
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
                    alert('No se pudo copiar el código. Intenta de nuevo.');
                });
        });

        return codeBlock.outerHTML;
    });

    // Escapar el HTML del mensaje para evitar que se renderice
    mensaje = escapeHTML(mensaje);

    // Mensaje normal o con código ya formateado
    if (!isUser) {
        mensaje = mensaje.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    }
    messageElement.innerHTML = isUser ? `<strong>Tú:</strong> ${mensaje}` : `<strong>Gareth:</strong> ${mensaje}`;

    if (!isUser && mensaje.includes('\\(')) { 
        renderizarLaTeX(messageElement);
    }

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

// Manejar clic en el botón "Nueva conversación"
newConversationButton.addEventListener('click', () => {
    console.log("Nueva conversación");
    // Aquí puedes agregar el código para limpiar el área de chat y reiniciar la conversación.
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

    if (inputArea && chatArea) { // Verificar que ambos elementos existan
        const inputAreaHeight = inputArea.offsetHeight;
        chatArea.style.paddingBottom = inputAreaHeight + 10 + 'px'; // Agregar 10px extra para mayor espacio
    }
}

// Llamar la función al cargar la página y al redimensionar la ventana
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
        backdrop: 'rgba(0,0,123,0.4)' // Puedes ajustar el color de fondo
    });
});
