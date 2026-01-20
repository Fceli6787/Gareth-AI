import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Preprocesa el contenido para LaTeX.
 * - Elimina 'undefined' que puede filtrarse del streaming
 * - Convierte delimitadores \[...\] y \(...\) al formato $$...$$ y $...$
 */
function preprocessLatex(content) {
  if (!content || typeof content !== 'string') return '';

  let result = content;

  // Eliminar cualquier 'undefined' que se haya filtrado
  result = result.replace(/undefined/g, '');

  // Convertir \[...\] a $$...$$ (display math - delimitador LaTeX estándar)
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner) => {
    return `$$${inner.trim()}$$`;
  });

  // Convertir \(...\) a $...$ (inline math - delimitador LaTeX estándar)
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, inner) => {
    return `$${inner.trim()}$`;
  });

  return result;
}

const ChatMessage = ({ message, isUser }) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Preprocesar contenido para LaTeX
  const processedContent = preprocessLatex(message.content);
  const processedReasoning = preprocessLatex(message.reasoning);


  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        {/* Caja de razonamiento (Ahora arriba) */}
        {message.reasoning && (
          <div className="reasoning-container">
            <button
              className={`reasoning-toggle ${showReasoning ? 'active' : ''}`}
              onClick={() => setShowReasoning(s => !s)}
            >
              <span className="reasoning-icon">{showReasoning ? '💡' : '💭'}</span>
              {showReasoning ? 'Ocultar pensamiento' : 'Ver proceso de pensamiento'}
              <span className={`chevron ${showReasoning ? 'expanded' : ''}`}>▼</span>
            </button>

            {showReasoning && (
              <div className="reasoning-box">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {processedReasoning}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Mensaje principal */}
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');
                const codeIndex = Math.random();

                return !inline ? (
                  <div className="code-block">
                    <div className="code-header">
                      <span className="language">{language || 'código'}</span>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(codeString, codeIndex)}
                      >
                        {copiedCode === codeIndex ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language || 'text'}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 12px 12px',
                        fontSize: '0.9rem'
                      }}
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                );
              },
              h3: ({ node, ...props }) => <h3 className="message-heading" {...props} />,
              ul: ({ node, ...props }) => <ul className="message-list" {...props} />,
              ol: ({ node, ...props }) => <ol className="message-list ordered" {...props} />,
              li: ({ node, ...props }) => <li className="message-list-item" {...props} />,
              a: ({ node, ...props }) => <a className="message-link" target="_blank" rel="noopener noreferrer" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="message-blockquote" {...props} />,
              table: ({ node, ...props }) => (
                <div className="table-wrapper">
                  <table className="message-table" {...props} />
                </div>
              ),
              strong: ({ node, ...props }) => <strong className="message-bold" {...props} />
            }}
          >
            {processedContent}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
