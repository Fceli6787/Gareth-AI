import React from 'react';

const ThinkingIndicator = () => {
  return (
    <div className="message bot-message thinking-message">
      <div className="thinking-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <span className="thinking-text">Gareth está pensando...</span>
    </div>
  );
};

export default ThinkingIndicator;
