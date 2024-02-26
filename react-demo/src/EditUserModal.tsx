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
      <h2>Edit User: {userId}</h2>
      {userData ? (
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label>Group: </label>
            <input type="text" value={editData.group} onChange={(e) => handleChange(e, 'group')} />
          </div>
          <div>
            <label>Is Researcher: </label>
            <input type="checkbox" checked={editData.isResearcher} onChange={(e) => handleChange(e, 'isResearcher')} />
          </div>
          <div>
            <label>Next Group: </label>
            <input type="text" value={editData.nextGroup} onChange={(e) => handleChange(e, 'nextGroup')} />
          </div>
          <div>
            <label>Password: </label>
            <input type="text" value={editData.password} onChange={(e) => handleChange(e, 'password')} />
          </div>
          <div>
            <button type="button" onClick={handleClose}>Close</button>
            <button type="button" onClick={handleSave}>Save</button>
          </div>
        </form>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default EditUserModal;