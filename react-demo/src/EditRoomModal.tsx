import React, { useEffect, useState } from 'react';
import { useModal } from './ModalContext';
import { fetchCurrentAlertMessage, fetchCanShowResearcher, updateRoomInfo } from './firebaseConfig'; // Ensure updateShowResearcherSetting is implemented

interface EditRoomModalProps {
  meetingId: string;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ meetingId }) => {
  const { modalStates, setModalState } = useModal();
  const [alertMessage, setAlertMessage] = useState('');
  const [showResearcher, setShowResearcher] = useState('');

  useEffect(() => {
    const fetchAlertMessage = async () => {
      const message = await fetchCurrentAlertMessage(meetingId);
      const canShowResearcherInRoom = await fetchCanShowResearcher(meetingId);
      setAlertMessage(message);
      if (canShowResearcherInRoom) {
        setShowResearcher("show");
      } else {
        setShowResearcher("hide");
      }
    };

    fetchAlertMessage();
  }, [meetingId]);

  const handleClose = () => {
    setModalState('editRoomModal', false);
  };

  const handleSave = async () => {
    await updateRoomInfo(meetingId, alertMessage, showResearcher === 'show');
    setModalState('editRoomModal', false);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowResearcher(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertMessage(e.target.value);
  };

  if (!modalStates.editRoomModal) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', height: 'auto', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Edit Room Alert</h2>
        <button onClick={handleClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '24px' }}>X</button>
      </div>
      <form onSubmit={(e) => e.preventDefault()} style={{ textAlign: 'left', marginTop: 10 }}>
        <div>
          <label>Alert Message: </label>
          <input type="text" value={alertMessage} onChange={handleChange} style={{ marginLeft: '5px' }} />
        </div>
        <div>
          <label>
            <input type="radio" value="show" checked={showResearcher === 'show'} onChange={handleRadioChange} />
            Show Researcher in Room
          </label>
          <label>
            <input type="radio" value="hide" checked={showResearcher === 'hide'} onChange={handleRadioChange} />
            Don't Show Researcher in Room
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button type="button" onClick={handleSave} style={{ marginRight: '10px' }}>Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditRoomModal;
