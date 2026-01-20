import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/Chat/ChatHeader';
import ChatMessage from './components/Chat/ChatMessage';
import ChatInput from './components/Chat/ChatInput';
import WelcomeCard from './components/Chat/WelcomeCard';
import ThinkingIndicator from './components/Chat/ThinkingIndicator';
import ConfigModal from './components/Modal/ConfigModal';
import { useChat } from './hooks/useChat';
import Swal from 'sweetalert2';

function App() {
  const {
    messages,
    isLoading,
    currentStreamedMessage,
    currentReasoning,
    sendMessage,
    clearChat,
    stopGeneration
  } = useChat();

  const [config, setConfig] = useState({
    model: 'magistral-medium-latest',
    temperature: 0.7,
    // no maxTokens por defecto (permitir vacío/unlimited)
  });

  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedMessage]);

  const handleSendMessage = (message) => {
    sendMessage(message, config, true);
  };

  const handleNewChat = () => {
    Swal.fire({
      title: '¿Nueva conversación?',
      text: '¿Estás seguro de que deseas iniciar una nueva conversación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#a855f7',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, nueva conversación',
      cancelButtonText: 'Cancelar',
      background: 'rgba(31, 17, 51, 0.95)',
      color: '#f3e8ff',
      backdrop: 'rgba(13, 4, 21, 0.8)'
    }).then((result) => {
      if (result.isConfirmed) {
        clearChat();
        Swal.fire({
          title: '¡Listo!',
          text: 'Nueva conversación iniciada',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'rgba(31, 17, 51, 0.95)',
          color: '#f3e8ff'
        });
      }
    });
  };

  return (
    <div className="chat-container">
      <Sidebar
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat-main">
        <ChatHeader
          config={config}
          onConfigClick={() => setShowModal(true)}
          onMenuClick={() => setSidebarOpen(true)}
          onModelChange={(newModel) => setConfig(prev => ({ ...prev, model: newModel }))}
        />

        <section className="chat-messages" id="chat-messages">
          {messages.length === 0 && <WelcomeCard onSuggestionClick={handleSendMessage} />}

          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              isUser={msg.role === 'user'}
            />
          ))}

          {isLoading && !currentStreamedMessage && <ThinkingIndicator />}

          {currentStreamedMessage && (
            <ChatMessage
              message={{ content: currentStreamedMessage, reasoning: currentReasoning }}
              isUser={false}
            />
          )}

          <div ref={messagesEndRef} />
        </section>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStop={stopGeneration}
        />
      </main>

      {showModal && (
        <ConfigModal
          config={config}
          onSave={(newConfig) => {
            setConfig(newConfig);
            setShowModal(false);
            Swal.fire({
              title: 'Configuración guardada',
              text: 'Los cambios se aplicarán en los próximos mensajes',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              background: 'rgba(31, 17, 51, 0.95)',
              color: '#f3e8ff'
            });
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;
