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
        <div style={{ position: 'fixed', top: '20%', right: '20%', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
          <div>
            <button onClick={handleClose}>Close</button>
          </div>
          <div style={{ margin: '10px 0' }}>
            Alert Message:
            <div style={{ marginTop: '10px' }}>
              {alertMessage}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayAlertModal;
