import React, { useState, useEffect } from 'react';

const ConfigModal = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
  };

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m-9-9h6m6 0h6M4.2 4.2l4.2 4.2m7.2 0l4.2-4.2M4.2 19.8l4.2-4.2m7.2 0l4.2 4.2"></path>
            </svg>
            Configuración del Modelo
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="model-select">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Modelo de IA
            </label>
            <select 
              id="model-select" 
              className="form-select"
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
            >
              <option value="magistral-small-latest">Mistral Small - Rápido y Eficiente</option>
              <option value="magistral-medium-latest">Mistral Medium - Equilibrado</option>
              <option value="codestral-latest">Codestral - Especializado en Código</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temperature-slider">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
              </svg>
              Creatividad <span id="temperature-value">{localConfig.temperature}</span>
            </label>
            <input 
              type="range" 
              id="temperature-slider" 
              className="form-slider" 
              min="0" 
              max="2" 
              step="0.1" 
              value={localConfig.temperature}
              onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
            />
            <div className="slider-labels">
              <span>Preciso (0)</span>
              <span>Creativo (2)</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="max-tokens">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Longitud Máxima de Respuesta
            </label>
            <input 
              type="number" 
              id="max-tokens" 
              className="form-input" 
              value={localConfig.maxTokens ?? ''} 
              placeholder="Dejar vacío para sin límite"
              step="1"
              onChange={(e) => {
                const v = e.target.value;
                setLocalConfig({ ...localConfig, maxTokens: v === '' ? undefined : parseInt(v, 10) });
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Aplicar Cambios
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
