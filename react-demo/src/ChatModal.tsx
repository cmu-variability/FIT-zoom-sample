import React, { useState, useEffect } from 'react';
import { useModal } from './ModalContext';
import { useAuth } from './authContext';
import { addChatMessage, onChatMessagesSnapshot } from './firebaseConfig';

const ChatModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const authContext = useAuth();
  if (!authContext) return null;
  const { loggedInUsername, userGroup } = authContext;

  useEffect(() => {
    let unsubscribe: Function;
    if (userGroup) {
      unsubscribe = onChatMessagesSnapshot(userGroup, setMessages);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userGroup]);

  const handleSubmit = async () => {
    if (message.trim() !== '' && loggedInUsername && userGroup) {
      try {
        await addChatMessage(userGroup, message, loggedInUsername);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <>
      {modalStates.chatModal && (
        <div style={{ position: 'fixed', top: '20%', right: '10%', backgroundColor: 'white', padding: '20px', border: '1px solid #ccc', zIndex: 1050, width: '300px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Chat</h3>
            <button onClick={() => setModalState('chatModal', false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>X</button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '10px 0' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                backgroundColor: msg.user === loggedInUsername ? 'lightblue' : 'lightgrey',
                textAlign: msg.user === loggedInUsername ? 'right' : 'left',
                margin: '5px 0',
                padding: '5px',
                borderRadius: '10px', // Rounded corners
                borderBottom: '1px solid #ddd'
              }}>
                <div>{msg.text}</div>
                <small style={{ opacity: 0.6 }}>-{msg.user}</small>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flexGrow: 1, marginRight: '5px', padding: '5px', borderRadius: '5px' }} // Adjusted input styling
            />
            <button onClick={handleSubmit} style={{ padding: '5px 10px', borderRadius: '5px' }}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
