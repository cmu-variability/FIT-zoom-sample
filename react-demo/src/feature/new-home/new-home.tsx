/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card, Button } from 'antd';
import { IconFont } from '../../component/icon-font';
import './new-home.scss';
import { checkLoginCredentials, haveUserJoinRoom } from '../../firebaseConfig'; // adjust the import path as needed
import { useAuth } from '../../authContext'; // Adjust the path as per your directory structure
import Webcam from 'react-webcam';

const { Meta } = Card;
interface HomeProps extends RouteComponentProps {
  status: string;
  onLeaveOrJoinSession: () => void;
  createVideoToken: (topic: string, isResearcher: boolean) => any;

}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status, onLeaveOrJoinSession, createVideoToken } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const authContext = useAuth();
  if (!authContext) {
    return null; // or some other appropriate handling
  }
  const { loggedInUsername, setLoggedInUsername, userGroup, setUserGroup, isResearcher, setIsResearcher } = authContext;


  useEffect(() => {
    // Check if user is already logged in
    const storedUsername = localStorage.getItem('loggedInUsername');
    if (storedUsername) {
      setLoggedInUsername(storedUsername);
      // Redirect to home page or dashboard as needed
      history.push('/new-home');
    }
  }, [setLoggedInUsername, history]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUsername');
    setLoggedInUsername(null);
    setUserGroup("");
    setIsResearcher(false);
    history.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await checkLoginCredentials(username, password);
    if (result.valid) {
      setUserGroup(result.group)
      setLoggedInUsername(username);
      setIsResearcher(result.researcher)
      if (!status) {
        onLeaveOrJoinSession();
      }
      history.push('/new-home'); // Replace '/pre-room' with the path of your route
    } else {
      console.log('Invalid username or password');
      // Handle invalid login, maybe show an error message
    }
  };

  const onWebcamClick = (type: string) => {
      createVideoToken(userGroup, false).then(() => {
        history.push(`/video`);
        console.log(username, userGroup);
        haveUserJoinRoom(loggedInUsername, userGroup);
      })
  };

  const webcamRef = React.useRef(null);

  let actionText;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }
  return (
    <div>
      {!loggedInUsername ? (
          <div className="login-container">
            <div className="login-box">
              <div className="login-box-content">
                <p className="login-title">Login</p>
                <form onSubmit={(e) => {
                  e.preventDefault(); // Prevents the default form submission behavior
                  handleSubmit(e);
                }}>                
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="login-input"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="login-input"
                    placeholder="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="submit" className="login-button">Login</button>
                </form>
              </div>
            </div>
          </div>
      ) : (
        <div>
          <div className="nav">
            <div style={{ flex: 1 }}></div>
            <p style={{ marginRight: '20px', fontSize: '18px' }}>You are logged in as {loggedInUsername}</p>

            {isResearcher && (
              <button style={{ marginRight: '20px' }} onClick={() => history.push('/r')} className="researcher-button">
                Researcher Page
              </button>
            )}

            <button style={{ marginRight: '20px' }} onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
          <div className="video">
          <h1>FIT Project Prototype</h1>
            <Webcam audio={false} ref={webcamRef} />
            <button onClick={() => onWebcamClick(userGroup)}>
              Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
