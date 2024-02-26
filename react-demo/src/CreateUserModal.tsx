import React, { useState } from 'react';
import { useModal } from './ModalContext';
import { createUser } from './firebaseConfig'; // Adjust the import path as needed

export interface UserData {
  id: string; // Assuming the document name will be stored as 'id'
  group: string;
  isResearcher: boolean;
  nextGroup: string;
  password: string;
}

const CreateUserModal: React.FC = () => {
  const { modalStates, setModalState } = useModal();
  const [userData, setUserData] = useState<UserData>({
    id: '',
    group: '',
    isResearcher: false,
    nextGroup: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>, field: keyof UserData) => {
    const value = field === 'isResearcher' ? e.target.checked : e.target.value;
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    await createUser(userData);
    setModalState('createUserModal', false); // Assuming your modal state name
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
          <label>Group: </label>
          <input type="text" value={userData.group} onChange={(e) => handleChange(e, 'group')} />
        </div>
        <div>
          <label>Is Researcher: </label>
          <input type="checkbox" checked={userData.isResearcher} onChange={(e) => handleChange(e, 'isResearcher')} />
        </div>
        <div>
          <label>Next Group: </label>
          <input type="text" value={userData.nextGroup} onChange={(e) => handleChange(e, 'nextGroup')} />
        </div>
        <div>
          <label>Password: </label>
          <input type="text" value={userData.password} onChange={(e) => handleChange(e, 'password')} />
        </div>
        <div style={{marginTop: 10}}>
          <button type="button" onClick={handleClose}>Cancel</button>
          <button type="button" onClick={handleCreateUser}>Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserModal;
