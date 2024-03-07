import React, { useEffect, useState } from 'react';
import { useModal } from './ModalContext';
import { fetchCurrentAlertMessage, createAlert } from './firebaseConfig'; // Adjust the import path as needed

interface EditRoomModalProps {
  meetingId: string;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ meetingId }) => {
  const { modalStates, setModalState } = useModal();
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchAlertMessage = async () => {
      const message = await fetchCurrentAlertMessage(meetingId);
      setAlertMessage(message);
    };

    fetchAlertMessage();
  }, [meetingId]);

  const handleClose = () => {
    setModalState('editRoomModal', false);
  };

  const handleSave = async () => {
    await createAlert(meetingId, alertMessage);
    setModalState('editRoomModal', false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertMessage(e.target.value);
  };

  if (!modalStates.editRoomModal) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', height: 'auto', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <h2>Edit Room Alert</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Alert Message: </label>
          <input type="text" value={alertMessage} onChange={handleChange} />
        </div>
        <div>
          <button type="button" onClick={handleClose}>Close</button>
          <button type="button" onClick={handleSave}>Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditRoomModal;
