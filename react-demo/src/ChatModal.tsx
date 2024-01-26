// ChatModal.tsx
import React from 'react';
import { useModal } from './ModalContext';

const ChatModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();

  const handleClose = () => {
    setModalState('chatModal', false);
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', // shadow effect
    maxWidth: '80%',
    maxHeight: '80%',
    overflow: 'auto'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <>
      {modalStates.chatModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <span className="close" onClick={handleClose}>&times;</span>
            <h2>Chat Modal</h2>
            <p>This is the chat modal.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
