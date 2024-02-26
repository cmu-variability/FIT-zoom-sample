// AdminScreen.js
import React, { useState, useEffect } from 'react';
import { User, fetchUsers, deleteUser } from '../../firebaseConfig';
import { useAuth } from '../../authContext';
import { useHistory } from 'react-router-dom';
import { useModal } from '../../ModalContext'; // Adjust the import path as needed
import EditUserModal from '../../EditUserModal';
import CreateUserModal from '../../CreateUserModal';


const AdminScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null); // State to track the current editing user's ID
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null); // State to track the current editing user's ID
  const { modalStates, setModalState } = useModal();
  const authContext = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!authContext?.isResearcher) {
      history.push('/');
    }
  }, [authContext?.isResearcher, history]);

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };

    getUsers();
  }, []);

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId); // Set the currently editing user's ID
    setModalState('editUserInfoModal', true); // Open the modal
    setModalState('createUserModal', false); // Open the modal
  };

  const handleCreateUser = () => {
    console.log("Opening CreateUserModal");
    setModalState('createUserModal', true); // Open the modal
    setModalState('editUserInfoModal', false); // Open the modal
};

const handleDeleteUser = async (userId: string) => {
  // Confirm before deleting
  const isConfirmed = window.confirm(`Are you sure you want to delete user ${userId}?`);
  if (isConfirmed) {
    try {
      await deleteUser(userId);
      // Optionally, remove the user from the local state to update the UI immediately
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      alert("Failed to delete user.");
      console.error(error);
    }
  }
};


  return (
    <div>
      <div className="nav">
        <button onClick={() => history.goBack()}>Go Back</button>
        <p>You are logged in as: {authContext?.loggedInUsername}</p>
        <button onClick={() => authContext?.setIsResearcher(false)}>Logout</button>
      </div>
      <div>
        <button style={{display: 'flex', alignSelf: 'flex-start', marginBottom: '10px'}} onClick={handleCreateUser}>Create New User</button>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <button style={{marginRight: 50}} onClick={() => handleEditUser(user.id)}>Edit</button>
                  {" "}
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalStates.editUserInfoModal && editingUserId && <EditUserModal userId={editingUserId as string} />}
      {modalStates.createUserModal && <CreateUserModal />}
    </div>
  );
};

export default AdminScreen;
