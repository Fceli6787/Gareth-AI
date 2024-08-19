import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference/+esm';

const inference = new HfInference("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");

const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const modelSelect = document.getElementById('model-select');
const changeModelButton = document.getElementById('change-model-button');
const textToSpeechToggle = document.getElementById('text-to-speech-toggle');
const fileInput = document.getElementById('file-input');
const uploadDocumentButton = document.getElementById('upload-document-button');
const typingIndicator = document.getElementById('typing-indicator');
const ayudaButton = document.getElementById('ayuda');

let context = [];
let documentoContenido = '';

function mostrarTerminosYCondiciones() {
    Swal.fire({
        title: 'Términos y Condiciones',
        html: `
            <p>Aceptas los términos y condiciones de este bot.</p>
            <p>Que usa tecnología de empresas como Meta, OpenAI y Mistral AI los cuales impulsan el chat</p>
            <p>El contenido generado puede ser inexacto o falso en algunos casos
               por eso se requiere verificar con una segunda respuesta</p>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Acepto',
        cancelButtonText: 'No acepto',
        width: '70%',
        heightAuto: false,
        customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            content: 'custom-swal-content'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            chatContainer.style.display = 'flex';
            iniciarChat();
        } else {
            Swal.fire(
                'Acceso Denegado',
                'Debes aceptar los Términos y Condiciones para usar el chatbot.',
                'error'
            );
        }
    });
}

function iniciarChat() {
    agregarMensaje("¡Hola! Soy Gareth. ¿En qué puedo ayudarte hoy?", false);
}

function agregarMensaje(mensaje, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');

    mensaje = mensaje.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => `
        <div class="code-block" data-language="${lang || 'plaintext'}">
            <pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>
        </div>
    `);

    messageElement.innerHTML = mensaje;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    renderizarLaTeX(messageElement);
    Prism.highlightAllUnder(messageElement);

    if (!isUser && textToSpeechToggle.checked) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(mensaje));
    }
}

function renderizarLaTeX(elemento) {
    const textoOriginal = elemento.innerHTML;
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\n$]*?\$)/g;
    let resultado = '';
    let ultimoIndice = 0;

    textoOriginal.replace(regex, (match, formula, indice) => {
        resultado += textoOriginal.slice(ultimoIndice, indice);

        try {
            const esDisplayMode = formula.startsWith('$$');
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

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function isPreguntaHora(mensaje) {
    const patronesHora = [
        /^(?:qué|que) hora es\??$/i,
        /^(?:me dices|me puedes decir) la hora\??$/i,
        /^(?:sabes|sab[ée]s) (?:cu[áa]l es )?la hora(?: actual)?\??$/i,
        /^d[íi]me la hora(?: por favor)?\??$/i
    ];
    return patronesHora.some(patron => patron.test(mensaje.trim()));
}

function isPreguntaFecha(mensaje) {
    const patronesFecha = [
        /^(?:qué|que) d[íi]a es hoy\??$/i,
        /^(?:cu[áa]l es )?la fecha de hoy\??$/i,
        /^(?:qué|que) fecha es(?: hoy)?\??$/i,
        /^(?:me dices|me puedes decir) (?:la fecha|el d[íi]a)(?: de hoy)?\??$/i
    ];
    return patronesFecha.some(patron => patron.test(mensaje.trim()));
}

async function handleUserInput() {
    const userMessage = messageInput.value.trim();
    if (userMessage !== '') {
        agregarMensaje(userMessage, true);
        typingIndicator.style.display = 'block';

        try {
            let botResponse;

            if (isPreguntaHora(userMessage)) {
                botResponse = await getCurrentTime();
            } else if (isPreguntaFecha(userMessage)) {
                botResponse = await getCurrentDate();
            } else {
                let contextoCompleto = userMessage;
                if (documentoContenido && (userMessage.toLowerCase().includes('documento') || userMessage.toLowerCase().includes('text'))) {
                    contextoCompleto = `Contenido del documento: ${documentoContenido}\n\nPregunta del usuario: ${userMessage}`;
                }

                const searchResult = await searchDuckDuckGo(userMessage);
                botResponse = await getChatCompletion(contextoCompleto, searchResult);
            }

            if (validarRespuesta(botResponse)) {
                agregarMensaje(botResponse, false);
            } else {
                agregarMensaje("Lo siento, no pude generar una respuesta relevante. ¿Podrías reformular tu pregunta?", false);
            }
        } catch (error) {
            console.error('Error al obtener respuesta del modelo:', error);
            agregarMensaje('Lo siento, hubo un error al procesar tu solicitud. Intentemos reiniciar la conversación.', false);
            clearContext();
        } finally {
            typingIndicator.style.display = 'none';
        }

        messageInput.value = '';
    }
}

async function searchDuckDuckGo(query) {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    return data.AbstractText || "No se encontró información relevante.";
}

async function getCurrentTime() {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    return `La hora actual es ${data.datetime.slice(11, 19)}`;
}

async function getCurrentDate() {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    return `La fecha actual es ${data.datetime.slice(0, 10)}`;
}

async function getChatCompletion(userMessage) {
    const selectedModel = modelSelect.value;
    
    try {
        let response;
        if (selectedModel === 'mistralai/Mixtral-8x7B-Instruct-v0.1') {
            const systemPrompt = "Eres un asistente AI llamado Gareth. Responde de manera concisa y relevante a las preguntas del usuario.";
            const fullPrompt = `${systemPrompt}\n\nUsuario: ${userMessage}\nGareth:`;
            
            response = await inference.textGeneration({
                model: selectedModel,
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 3072,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            });
            
            // Filtrar la respuesta para obtener solo la parte relevante
            let cleanedResponse = response.generated_text.trim();
            
            // Eliminar cualquier texto antes de "Gareth:" si está presente
            const garethIndex = cleanedResponse.lastIndexOf("Gareth:");
            if (garethIndex !== -1) {
                cleanedResponse = cleanedResponse.substring(garethIndex + 7).trim();
            }
            
            // Eliminar cualquier texto después de "Usuario:" si está presente
            const usuarioIndex = cleanedResponse.indexOf("Usuario:");
            if (usuarioIndex !== -1) {
                cleanedResponse = cleanedResponse.substring(0, usuarioIndex).trim();
            }
            
            return cleanedResponse;
        } else {
            response = await inference.chatCompletion({
                model: selectedModel,
                messages: [
                    { role: "system", content: "Eres un asistente AI llamado Gareth. Responde de manera concisa y relevante a las preguntas del usuario." },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 3072
            });
            return response.choices[0].message.content;
        }
    } catch (error) {
        console.error("Error al usar el modelo:", error.message);
        return "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.";
    }
}

async function cambiarModelo() {
    const nuevoModelo = modelSelect.value;
    inference.model = nuevoModelo;

    chatMessages.innerHTML = '';
    iniciarChat();
}

async function leerDocumento(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    
    try {
        const pdf = await loadingTask.promise;
        let textoCompleto = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            textoCompleto += pageText + ' ';
        }
        
        documentoContenido = textoCompleto;
        agregarMensaje("Documento cargado con éxito. Puedes hacer preguntas sobre su contenido.", false);
    } catch (error) {
        console.error('Error al leer el PDF:', error);
        agregarMensaje("Hubo un error al cargar el documento. Por favor, intenta con otro archivo.", false);
    }
}

function mostrarAyuda() {
    Swal.fire({
        title: '¿Necesitas ayuda?',
        html: `
            <p>Aquí tienes algunas sugerencias para usar Gareth AI:</p>
            <ul>
                <li>Puedes preguntar sobre cualquier tema general, desde temas de la universidad 
                    hasta tareas cotidianas.</li>
                <li>Elige el modelo de IA adecuado según tus necesidades:</li>
                <li><strong>GPT-4 </strong> 
                            Excelente para resolver problemas matemáticos complejos
                             y tareas de programación.</li>
                <li><strong>Llama-3 8B </strong> 
                Mejor para tareas generales como lo son resumenes y redaccion.</li>
                <li><strong>Mistral: </strong> 
                Un modelo versátil para diversas tareas.</li>
                <li>Para cargar un documento PDF, usa el botón "Cargar Documento".</li>
                <li>Puedes cambiar el modelo de IA usando el menú desplegable para adaptar Gareth AI a diferentes necesidades.</li>
                <li>Activa el "Texto a voz" si quieres que Gareth lea sus respuestas.</li>
            </ul>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido'
    });
}

function clearContext() {
    context = [];
    agregarMensaje("Contexto de la conversación reiniciado. ¿En qué puedo ayudarte?", false);
}

function validarRespuesta(respuesta) {
    if (respuesta.trim().length === 0 || respuesta.includes("Lo siento, no entiendo la pregunta")) {
        return false;
    }
    return true;
}

function setupEventListeners() {
    sendButton.addEventListener('click', handleUserInput);
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleUserInput();
        }
    });
    changeModelButton.addEventListener('click', cambiarModelo);
    uploadDocumentButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                leerDocumento(file);
            } else {
                agregarMensaje("Por favor, selecciona un archivo PDF válido.", false);
            }
        } else {
            agregarMensaje("Por favor, selecciona un archivo antes de intentar cargarlo.", false);
        }
    });
    ayudaButton.addEventListener('click', mostrarAyuda);
}

window.addEventListener('load', () => {
    mostrarTerminosYCondiciones();
    setupEventListeners();

    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', (event) => {
        if (event.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
});
