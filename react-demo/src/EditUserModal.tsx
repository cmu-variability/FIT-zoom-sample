import React, { useEffect, useState } from 'react';
import { useModal } from './ModalContext';
import { fetchUserData, updateUser } from './firebaseConfig'; // Adjust the import path as needed

interface EditUserModalProps {
  userId: string;
}

export interface UserData {
  group: string;
  isResearcher: boolean;
  nextGroup: string;
  password: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ userId }) => {
  const { modalStates, setModalState } = useModal();
  const [userData, setUserData] = useState<UserData | null>(null);

  // For editing, maintain local state that mirrors the fetched userData
  const [editData, setEditData] = useState<UserData>({
    group: '',
    isResearcher: false,
    nextGroup: '',
    password: '', // Be cautious with password management
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserData(userId);
      setUserData(data ?? null);
      setEditData(data ?? {
        group: '',
        isResearcher: false,
        nextGroup: '',
        password: '',
      });
    };

    fetchData();
  }, [userId]);


  const handleClose = async () => {
    if (editData) {
      setModalState('editUserInfoModal', false);
    }
  };


  const handleSave = async () => {
    if (editData) {
      // Call your Firebase function to update the user data
      await updateUser(userId, editData);
      setModalState('editUserInfoModal', false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
    const value = field === 'isResearcher' ? e.target.checked : e.target.value;
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (!modalStates.editUserInfoModal) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', height: 'auto', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Edit User: {userId}</h2>
        <button onClick={handleClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '24px' }}>X</button>
      </div>
      {userData ? (
        <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '5px' }}>Group:</label>
            <input type="text" value={editData.group} onChange={(e) => handleChange(e, 'group')} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '5px' }}>Is Researcher:</label>
            <input type="checkbox" checked={editData.isResearcher} onChange={(e) => handleChange(e, 'isResearcher')} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '5px' }}>Next Group:</label>
            <input type="text" value={editData.nextGroup} onChange={(e) => handleChange(e, 'nextGroup')} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '5px' }}>Password:</label>
            <input type="text" value={editData.password} onChange={(e) => handleChange(e, 'password')} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="button" onClick={handleSave} style={{ marginRight: '10px' }}>Save</button>
            <button type="button" onClick={handleClose}>Close</button>
          </div>
        </form>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default EditUserModal;