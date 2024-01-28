// ChatModal.tsx
import React, { useState, useEffect} from 'react';
import { useModal} from './ModalContext';
import { initializeApp } from 'firebase/app';
import { useAuth } from './authContext';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBw-Xyyr4Zp_QPATN-ONnxx73c0zVzboZM",
    authDomain: "fit-react-6fefb.firebaseapp.com",
    projectId: "fit-react-6fefb",
    storageBucket: "fit-react-6fefb.appspot.com",
    messagingSenderId: "547256975599",
    appId: "1:547256975599:web:3fac54a43a5a666bf19b1a",
    measurementId: "G-N80PSJQDCX"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);


const ChatModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isSent: boolean }[]>([]);
  const auth = useAuth();

  if (!auth) {
    return null; // or return a loading indicator or error message
  }
  const { loggedInUsername, userGroup} = auth;

  useEffect(() => {
    // Firestore listener to fetch and update messages in real-time
    const unsubscribe = onSnapshot(collection(firestore, 'messages'), (snapshot) => {
      const updatedMessages: { text: string; isSent: boolean }[] = [];
      snapshot.forEach((doc) => {
        updatedMessages.push(doc.data() as { text: string; isSent: boolean });
      });
      setMessages(updatedMessages);
    });

    // Clean up Firestore listener
    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setModalState('chatModal', false);
  };

  const handleSubmit = async () => {
    if (message.trim() !== '') {
      try {
        // Add message to Firestore and associate it with the document that has the currentGroup
        await addDoc(collection(firestore, `meetingChats/${userGroup}/chats`), {
          text: message,
          user: loggedInUsername,
          timestamp: new Date().toISOString(),
          isSent: true,
        });
        setMessages((prevMessages) => [...prevMessages, { text: message, isSent: true }]);

        // Clear the input field after submission
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#f3f3f3',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)', // shadow effect
    maxWidth: '50%', // Adjust the width as needed
    maxHeight: '80%', // Adjust the height as needed
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

  const inputStyle: React.CSSProperties = {
    width: 'calc(100% - 20px)',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const messageContainerStyle: React.CSSProperties = {
    marginTop: '10px',
    marginBottom: '10px',
    overflowY: 'auto',
    maxHeight: '300px', // Adjust max height as needed
    overflowX: 'hidden', // Prevent horizontal scrolling
    padding: '10px',
    display: 'flex',
    flexDirection: 'column', // Stack messages in normal order (latest at the bottom)
    maxWidth: '100%', // Adjust the width as needed
    backgroundColor: '#fff', // Background color for message container
    borderRadius: '8px' // Rounded corners for message container
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '18px', // Adjust the font size as needed
    color: '#fff', // White text color for messages
    borderRadius: '12px', // Adjust the bubble border radius as needed
    padding: '12px 16px', // Adjust the padding as needed
    marginBottom: '8px',
    maxWidth: '70%',
    wordWrap: 'break-word'
  };

  const sentMessageStyle: React.CSSProperties = {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff', // Blue background color for sent messages
    marginLeft: 'auto' // Push sent messages to the right
  };

  const receivedMessageStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea', // Light gray background color for received messages
    marginRight: 'auto' // Push received messages to the left
  };

  return (
    <>
      {modalStates.chatModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <span className="close" onClick={handleClose}>&times;</span>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#007bff' }}>Chat Modal</h2>
            <div className="chat-container" style={messageContainerStyle}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...messageStyle,
                    ...(msg.isSent ? sentMessageStyle : receivedMessageStyle)
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleSubmit} style={buttonStyle}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
