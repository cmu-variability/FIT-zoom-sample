import React, { useEffect, useState } from 'react';
import { useModal } from './ModalContext'; // Ensure this matches your project structure
import { onAlertMessageChange, fetchCurrentAlertMessage } from './firebaseConfig'; // Import the listener function
import { useAuth } from './authContext';

const DisplayAlertModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [alertMessage, setAlertMessage] = useState('');
  const [lastClosed, setLastClosed] = useState(Date.now());
  const [lastAlert, setLastAlert] = useState(''); // Track the last alert message shown

  const authContext = useAuth();
  if (!authContext) return null;
  const { userGroup } = authContext;

  useEffect(() => {
    let isMounted = true; // Flag to track component mount status
    // Fetch the current alert message immediately and then listen for changes
    const fetchAndListenForAlertMessage = async () => {
      const currentMessage = await fetchCurrentAlertMessage(userGroup);
      if (isMounted) {
        setAlertMessage(currentMessage);
        // Compare with lastAlert to decide whether to show the modal
        if (currentMessage && currentMessage !== lastAlert) {
          setModalState('displayAlertModal', true);
          setLastAlert(currentMessage); // Update lastAlert to the current message
        }
      }

      // Set up the listener for any new alert messages
      const unsubscribe = onAlertMessageChange(userGroup, (newAlertMessage: string) => {
        if (isMounted && newAlertMessage !== currentMessage) {
          setAlertMessage(newAlertMessage);
          if (newAlertMessage !== lastAlert) { // Check against lastAlert here too
            setModalState('displayAlertModal', true);
            setLastAlert(newAlertMessage); // Update lastAlert to the new message
          }
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = fetchAndListenForAlertMessage();

    // Cleanup function
    return () => {
      isMounted = false; // Set flag to false when component unmounts
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, [userGroup, setModalState, lastAlert]); // Re-run this effect if userGroup changes

  const handleClose = () => {
    setModalState('displayAlertModal', false);
    setLastClosed(Date.now());
    setLastAlert(alertMessage); // Update lastAlert to the current message upon closing
  };

  return (
    <>
      {modalStates.displayAlertModal && (
        <div style={{ position: 'fixed', top: '5%', right: '40%', backgroundColor: 'white', padding: '20px', border: '1px solid #ccc', zIndex: 1050, width: '250px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Alert Message:</h3>
            <button onClick={handleClose} style={{ marginLeft: '10px' }}>X</button>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ wordWrap: 'break-word' }}>{alertMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayAlertModal;
