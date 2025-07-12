import React, { useEffect } from 'react';
import './Popup.css';

function Popup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup">
      <span>{message}</span>
    </div>
  );
}

export default Popup;