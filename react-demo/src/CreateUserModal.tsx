import React, { useState } from 'react';
import { useModal } from './ModalContext';
import { createUser } from './firebaseConfig'; // Ensure correct import path

export interface UserData {
  id: string; // User's unique identifier
  isResearcher: boolean;
  password: string;
  room1: string; // New fields for rooms
  room2: string;
  room3: string;
}

const CreateUserModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [userData, setUserData] = useState<UserData>({
    id: '',
    isResearcher: false,
    password: '',
    room1: '',
    room2: '',
    room3: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
    const value = field === 'isResearcher' ? e.target.checked : e.target.value;
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    await createUser(userData);
    setModalState('createUserModal', false); // Assuming your modal state name is correct
  };

  const handleClose = () => setModalState('createUserModal', false);

  if (!modalStates.createUserModal) return null;
  
  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', width: '40%', height: 'auto', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <h2>Create New User</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>ID (Account Name): </label>
          <input type="text" value={userData.id} onChange={(e) => handleChange(e, 'id')} />
        </div>
        <div>
          <label>Is Researcher: </label>
          <input type="checkbox" checked={userData.isResearcher} onChange={(e) => handleChange(e, 'isResearcher')} />
        </div>
        <div>
          <label>Password: </label>
          <input type="text" value={userData.password} onChange={(e) => handleChange(e, 'password')} />
        </div>
        <div>
          <label>Room 1: </label>
          <input type="text" value={userData.room1} onChange={(e) => handleChange(e, 'room1')} />
        </div>
        <div>
          <label>Room 2: </label>
          <input type="text" value={userData.room2} onChange={(e) => handleChange(e, 'room2')} />
        </div>
        <div>
          <label>Room 3: </label>
          <input type="text" value={userData.room3} onChange={(e) => handleChange(e, 'room3')} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="button" onClick={handleClose}>Cancel</button>
          <button type="button" onClick={handleCreateUser}>Create</button>
        </div>
      </form>
    </div>
  );
  
};

export default CreateUserModal;
