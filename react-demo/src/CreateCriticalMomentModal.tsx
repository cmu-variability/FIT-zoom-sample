import React, { useState } from 'react';
import { useModal } from './ModalContext'; // Ensure this path matches your project structure
import { useAuth } from './authContext';
import { markCriticalMoment } from './firebaseConfig';

interface CreateCriticalMomentModalProps {
  currentVideoId: string;
}

const CreateCriticalMomentModal: React.FC<CreateCriticalMomentModalProps> = ({ currentVideoId }) => {
  const { modalStates, setModalState } = useModal();
  const [alertType, setAlertType] = useState(''); // For the dropdown selection
  const [alertMessage, setAlertMessage] = useState(''); // For the comment box

  const authContext = useAuth();
  if (!authContext) {
    // Handle the case where auth context is null. For example:
    return null; // or some other appropriate handling
  }
  const { loggedInUsername, setLoggedInUsername, userGroup, setUserGroup, isResearcher, setIsResearcher, researcher, setResearcher } = authContext;

  const handleSubmit = async () => {
    if (alertType.trim() !== '' && alertMessage.trim() !== '') {
      try {
        // The function could be modified to accept the alertType if your Firestore schema supports it
        if (loggedInUsername) {
          await markCriticalMoment(loggedInUsername, isResearcher, currentVideoId, alertType, alertMessage);
        }
        setModalState('createCriticalMomentModal', false); // Close the modal
      } catch (error) {
        console.error('Error updating alert message:', error);
      }
    }
  };

  return (
    <>
      {modalStates.createCriticalMomentModal && (
        <div style={{ position: 'fixed', top: '20%', right: '20%', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
          <div>
            <button onClick={() => setModalState('createCriticalMomentModal', false)}>Close</button>
          </div>
          <div style={{ margin: '10px 0' }}>
            <div>
              <label htmlFor="alertType">Alert Type:</label>
              <select
                id="alertType"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                style={{ display: 'block', marginBottom: '10px' }}
              >
                <option value="">Select a Type</option>
                <option value="Type1">Type 1</option>
                <option value="Type2">Type 2</option>
                <option value="Type3">Type 3</option>
                // Add more types as needed
              </select>
            </div>
            <div>
              <label htmlFor="alertMessage">Comment:</label>
              <textarea
                id="alertMessage"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: '10px' }}
              />
            </div>
            <button onClick={handleSubmit}>Send Alert</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCriticalMomentModal;
