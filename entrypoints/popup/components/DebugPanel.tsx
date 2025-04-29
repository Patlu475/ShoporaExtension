import React, { useRef, useEffect } from 'react';

interface DebugMessage {
  text: string;
  isError: boolean;
  timestamp: string;
}

interface DebugPanelProps {
  messages: DebugMessage[];
  isVisible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ messages, isVisible, onClose }) => {
  const debugInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (debugInfoRef.current) {
      debugInfoRef.current.scrollTop = debugInfoRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="debug-panel visible">
      <div className="debug-header">
        <div className="debug-title">Debug Log</div>
        <div className="debug-close" onClick={onClose}>×</div>
      </div>
      <div className="debug-info" ref={debugInfoRef}>
        {messages.map((message, index) => (
          <div key={index} style={{ color: message.isError ? '#ef4444' : 'inherit' }}>
            [{message.timestamp}] {message.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel; 