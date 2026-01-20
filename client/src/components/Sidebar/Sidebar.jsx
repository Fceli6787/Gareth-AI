import React, { useState } from 'react';

const Sidebar = ({ onNewChat, isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <svg xmlns="http://www.w3.org/2000/svg" className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <h2 className="sidebar-title">Gareth AI</h2>
          </div>
        </div>

        <button className="btn-new-chat" onClick={onNewChat}>
          <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>Nueva Conversación</span>
        </button>

        <div className="chat-history">
          <h3 className="history-title">Conversaciones Recientes</h3>
          <div className="history-list">
            <div className="history-item active">
              <svg xmlns="http://www.w3.org/2000/svg" className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <div className="history-content">
                <span className="history-label">Conversación Actual</span>
                <span className="history-time">Ahora</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-footer">
          {/* Footer content can go here if needed in the future */}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
