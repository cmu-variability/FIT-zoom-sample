import React, { useState } from 'react';
import { useModal } from './ModalContext'; // Ensure this path matches your project structure
import { useAuth } from './authContext';
// Assuming addAlertMessage is a function that updates the Firestore document
import { createAlert } from './firebaseConfig'; 

const CreateAlertModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [alertMessage, setAlertMessage] = useState('');

  const authContext = useAuth();
  if (!authContext) return null;
  const { loggedInUsername, userGroup } = authContext;

  const handleSubmit = async () => {
    if (alertMessage.trim() !== '') {
      try {
        // Assuming the function addAlertMessage updates the alert in the Firestore
        // You might need to pass additional parameters such as userGroup or loggedInUsername based on your Firestore schema
        await createAlert( userGroup, alertMessage );
        setAlertMessage(''); // Clear the input after successful submission
        setModalState('alertModal', false); // Close the modal
      } catch (error) {
        console.error('Error updating alert message:', error);
      }
    }
    setModalState('createAlertModal', false)
  };

  return (
    <>
      {modalStates.createAlertModal && (
        <div style={{ position: 'fixed', top: '20%', right: '20%', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
          <div>
            <button onClick={() => setModalState('createAlertModal', false)}>Close</button>
          </div>
          <div style={{ margin: '10px 0' }}>
            Alert Message:
            <input
              type="text"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              style={{ width: '80%', marginRight: '5px' }}
            />
            <button onClick={handleSubmit}>Send Alert</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAlertModal;
