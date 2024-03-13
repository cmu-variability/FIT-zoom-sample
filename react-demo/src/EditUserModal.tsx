import React, { useEffect, useState } from 'react';
import { useModal } from './ModalContext';
import { fetchUserData, updateUser } from './firebaseConfig';

interface EditUserModalProps {
  userId: string;
}

export interface UserData {
  id: string; // Assuming the document name will be stored as 'id'
  isResearcher: boolean;
  password: string;
  room1: string;
  room2: string;
  room3: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ userId }) => {
  const { modalStates, setModalState } = useModal();
  const [editData, setEditData] = useState<UserData>({
    id: '',
    isResearcher: false,
    password: '',
    room1: '',
    room2: '',
    room3: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserData(userId);
      if (data) {
        setEditData({
          ...editData,
          ...data
        });
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
    const value = field === 'isResearcher' ? e.target.checked : e.target.value;
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateUser(userId, editData);
    setModalState('editUserInfoModal', false);
  };

  const handleClose = () => {
    setModalState('editUserInfoModal', false);
  };

  if (!modalStates.editUserInfoModal) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', height: 'auto', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Edit User: {userId}</h2>
        <button onClick={handleClose}>X</button>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Room inputs */}
        <div>
          <label>Room 1: </label>
          <input type="text" value={editData.room1} onChange={(e) => handleChange(e, 'room1')} />
        </div>
        <div>
          <label>Room 2: </label>
          <input type="text" value={editData.room2} onChange={(e) => handleChange(e, 'room2')} />
        </div>
        <div>
          <label>Room 3: </label>
          <input type="text" value={editData.room3} onChange={(e) => handleChange(e, 'room3')} />
        </div>
        <div>
          <label>Is Researcher: </label>
          <input type="checkbox" checked={editData.isResearcher} onChange={(e) => handleChange(e, 'isResearcher')} />
        </div>
        <div>
          <label>Password: </label>
          <input type="text" value={editData.password} onChange={(e) => handleChange(e, 'password')} />
        </div>
        <div>
          <button type="button" onClick={handleSave}>Save</button>
          <button type="button" onClick={handleClose}>Close</button>
        </div>
      </form>
    </div>
  );
};

export default EditUserModal;
