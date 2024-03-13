// AdminScreen.js
import React, { useState, useEffect } from 'react';
import { UserData, fetchUsers, deleteUser, fetchCurrentMeetings, deleteCurrentMeeting, createNewMeetingRoom, Meeting } from '../../firebaseConfig';
import { useAuth } from '../../authContext';
import { useHistory } from 'react-router-dom';
import { useModal } from '../../ModalContext'; // Adjust the import path as needed
import EditUserModal from '../../EditUserModal';
import CreateUserModal from '../../CreateUserModal';
import EditRoomModal from '../../EditRoomModal';


const AdminScreen = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null); 
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; name?: string; users?: Array<any>; videoId?: string; chats?: Array<any> }[]>([]);
  const [newRoomName, setNewRoomName] = useState('');  const { modalStates, setModalState } = useModal();
  const authContext = useAuth();
  const history = useHistory();

  useEffect(() => {
    // if (!authContext?.isResearcher) {
    //   history.push('/');
    // }
  }, [authContext?.isResearcher, history]);

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };

    const fetchRooms = async () => {
      const fetchedRooms = await fetchCurrentMeetings(); // Make sure this function is aware of the Meeting type
      if (fetchedRooms.success && fetchedRooms.meetings) {
        setRooms(fetchedRooms.meetings.map(meeting => ({
          id: meeting.id
        })));
      }
    };

    fetchRooms();

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

  const handleEditRoom = (roomId: string) => {
    setEditingRoomId(roomId); // Set the currently editing user's ID
    setModalState('editRoomModal', true); // Open the modal
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

const handleCreateRoom = async () => {
  if (newRoomName) {
    await createNewMeetingRoom(newRoomName);
    setNewRoomName(''); // Reset the input field
    // Optionally fetch rooms again to update the list
  }
};

const handleDeleteRoom = async (roomId: string) => {
  const isConfirmed = window.confirm(`Are you sure you want to delete this room: ${roomId}?`);
  if (isConfirmed) {
    await deleteCurrentMeeting(roomId);
    // Optionally, remove the room from the local state to update the UI immediately
    setRooms(rooms.filter(room => room.id !== roomId));
  }
};

  return (
    <div>
      <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingLeft: '10px', paddingRight: '10px' }}>
        <button onClick={() => history.goBack()} style={{ marginLeft: '10px', padding: 5 }}>Go Back</button>
        <p style={{ flexGrow: 1, textAlign: 'right', paddingRight: '20px' }}>You are logged in as: {authContext?.loggedInUsername}</p>
        <button onClick={() => authContext?.setIsResearcher(false)} style={{ padding: 5, marginRight: 20 }}>Logout</button>
      </div>

      <div style={{ paddingLeft: '10px'}}>
        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <h1>Users</h1>
          <button onClick={handleCreateUser} style={{ display: 'block' }}>Create New User</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ paddingRight: '2px' }}>Username</th>
              <th style={{ paddingRight: '2px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ paddingRight: '2px' }}>{user.id}</td>
                <td>
                  <button style={{ marginRight: '15px' }} onClick={() => handleEditUser(user.id)}>Edit</button>
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ paddingLeft: '10px', paddingTop: '20px' }}>
        <h1 style={{textAlign: 'left', marginTop: '20px'}}>Rooms</h1>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '20px' }}>
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter new room name"
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleCreateRoom}>Create New Room</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Room Names</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>
                  <button onClick={() => handleEditRoom(room.id)} style={{ marginLeft: '10px', marginRight: '15px' }}>Edit</button>
                  <button onClick={() => handleDeleteRoom(room.id)} style={{ marginLeft: '2px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalStates.editUserInfoModal && editingUserId && <EditUserModal userId={editingUserId as string} />}
      {modalStates.createUserModal && <CreateUserModal />}
      {modalStates.editRoomModal && <EditRoomModal meetingId={editingRoomId as string}/>}
    </div>
  );
};

export default AdminScreen;
