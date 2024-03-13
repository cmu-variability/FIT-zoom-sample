import React, { useState } from 'react';
import { useModal } from './ModalContext'; // Ensure this path matches your project structure
import { useAuth } from './authContext';
import { createAlert } from './firebaseConfig';

const CreateAlertModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [alertMessage, setAlertMessage] = useState('');

  const authContext = useAuth();
  if (!authContext) return null;
  const { userGroup } = authContext;

  const handleSubmit = async () => {
    if (alertMessage.trim() !== '') {
      try {
        await createAlert(userGroup, alertMessage);
        setAlertMessage(''); // Clear the input after successful submission
        setModalState('createAlertModal', false); // Close the modal
      } catch (error) {
        console.error('Error updating alert message:', error);
      }
    }
  };

  return (
    <>
      {modalStates.createAlertModal && (
        <div style={{
          position: 'fixed',
          top: '3%',
          right: '30%',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid black',
          zIndex: 1000,
          width: '40%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setModalState('createAlertModal', false)} style={{ marginBottom: '10px' }}>Close</button>
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Alert Message:</label>
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              style={{
                width: '100%',
                height: '4em', // Adjusted to make the text input two lines tall
                marginBottom: '10px',
              }}
            />
            <button onClick={handleSubmit} style={{ marginTop: '10px' }}>Send Alert</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAlertModal;
