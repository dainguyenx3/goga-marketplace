import React, { useEffect } from 'react';

import './index.less';

export interface ModalProps {
  children: any;
  onCancel: (...args: any) => void;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ children, onCancel, width = 1000 }: ModalProps) => {
  useEffect(() => {
    window.addEventListener('click', onCancel);
    return window.removeEventListener('click', onCancel);
  }, [onCancel]);
  return (
    <div
      className="candy-modal modal-alert"
      onClick={() => {
        onCancel();
      }}
    >
      <div
        className="candy-modal-content modal-content"
        style={{ width: `${width}px`, overflowY: 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <a href="#"
          style={{
            textAlign: 'center', 
            fontSize: '40px',
            color: 'white',
            top: '-6px',
            right: '1px'
          }}
          onClick={onCancel} className="close candy-modal-close-btn" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </a>
        {children}
      </div>
    </div>
  );
};
