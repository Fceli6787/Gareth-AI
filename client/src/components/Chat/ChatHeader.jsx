import React, { useState, useRef, useEffect } from 'react';

const AVAILABLE_MODELS = [
  { id: 'magistral-medium-latest', name: 'Magistral Medium', desc: 'Razonamiento Avanzado', color: '#a855f7' },
  { id: 'magistral-small-latest', name: 'Magistral Small', desc: 'Razonamiento Rápido', color: '#10b981' },
  { id: 'codestral-latest', name: 'Codestral', desc: 'Especializado en código', color: '#3b82f6' },
  { id: 'mistral-small-latest', name: 'Mistral Small', desc: 'Velocidad máxima', color: '#f59e0b' }
];

const ChatHeader = ({ config, onConfigClick, onMenuClick, onModelChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === config.model) || { name: config.model, desc: 'Personalizado' };

  return (
    <header className="chat-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="header-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
          <div className="header-text-group">
            <h1 className="header-text">Gareth AI</h1>

            <div className="model-selector" ref={dropdownRef}>
              <button
                className={`model-selector-btn ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="current-model-name">{currentModel.name}</span>
                <svg
                  className={`chevron-icon ${isDropdownOpen ? 'rotated' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="14" height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="model-dropdown">
                  <div className="dropdown-label">Seleccionar Modelo</div>
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      className={`dropdown-item ${config.model === model.id ? 'selected' : ''}`}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="dropdown-item-content">
                        <span className="item-name" style={{ color: model.id === config.model ? 'white' : model.color }}>
                          {model.name}
                        </span>
                        <span className="item-desc">{model.desc}</span>
                      </div>
                      {config.model === model.id && (
                        <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">En línea</span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
