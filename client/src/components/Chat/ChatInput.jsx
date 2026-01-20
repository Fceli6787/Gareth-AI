import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, isLoading, onStop }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <footer className="chat-footer">
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje aquí... (Shift + Enter para nueva línea)"
            className="message-input"
            maxLength={5000}
            disabled={isLoading}
          />
          <div className="char-counter">
            <span>{message.length}</span>/5000
          </div>
        </div>

        {isLoading ? (
          <button
            className="send-button stop"
            onClick={onStop}
            aria-label="Detener generación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="send-icon" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1"></rect>
            </svg>
          </button>
        ) : (
          <button
            className="send-button"
            onClick={handleSubmit}
            disabled={!message.trim()}
            aria-label="Enviar mensaje"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        )}
      </div>

      <div className="footer-info">
        <p className="footer-disclaimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Gareth AI puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </footer>
  );
};

export default ChatInput;
