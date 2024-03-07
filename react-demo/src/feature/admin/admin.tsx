// AdminScreen.js
import React, { useState, useEffect } from 'react';
import { User, fetchUsers, deleteUser, fetchCurrentMeetings, deleteCurrentMeeting, createNewMeetingRoom, Meeting } from '../../firebaseConfig';
import { useAuth } from '../../authContext';
import { useHistory } from 'react-router-dom';
import { useModal } from '../../ModalContext'; // Adjust the import path as needed
import EditUserModal from '../../EditUserModal';
import CreateUserModal from '../../CreateUserModal';
import EditRoomModal from '../../EditRoomModal';


const AdminScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
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
      <div className="nav">
        <button onClick={() => history.goBack()}>Go Back</button>
        <p>You are logged in as: {authContext?.loggedInUsername}</p>
        <button onClick={() => authContext?.setIsResearcher(false)}>Logout</button>
      </div>

      <div>
        <h1 style={{display: 'flex', alignSelf: 'flex-start', marginBottom: '10px'}}>Users</h1>
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

      <div style={{display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', alignItems: 'flex-start', width: 300}}>
        <h1 style={{marginTop: 50}}>Rooms</h1>
        <div style={{display: 'flex', flexDirection: 'row', height: 50}}>
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter new room name"
          />
          <button onClick={handleCreateRoom}>Create New Room</button>
        </div>

        <ul>
          {rooms.map((room) => (
            <li key={room.id} style={{display: 'flex', alignItems: 'center'}}>
              {room.id}
              <button onClick={() => handleEditRoom(room.id)} style={{marginLeft: '10px'}}>Edit</button>
              <button onClick={() => handleDeleteRoom(room.id)} style={{marginLeft: '10px'}}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {modalStates.editUserInfoModal && editingUserId && <EditUserModal userId={editingUserId as string} />}
      {modalStates.createUserModal && <CreateUserModal />}
      {modalStates.editRoomModal && <EditRoomModal meetingId={editingRoomId as string}/>}
    </div>
  );
};

export default AdminScreen;
