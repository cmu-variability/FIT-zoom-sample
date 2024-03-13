/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card, Button } from 'antd';
import { IconFont } from '../../component/icon-font';
import './researcher.scss';
import { checkLoginCredentials } from '../../firebaseConfig'; // adjust the import path as needed
import { useAuth } from '../../authContext'; // Adjust the path as per your directory structure
import { haveUserJoinRoom, fetchAllVideos, VideoData, fetchCurrentMeetings, fetchCanShowResearcher } from '../../firebaseConfig';


const { Meta } = Card;
interface HomeProps extends RouteComponentProps {
  status: string;
  onLeaveOrJoinSession: () => void;
  createVideoToken: (topic: string, showCamera: boolean) => any;
}

const Home: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status, onLeaveOrJoinSession, createVideoToken } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentMeetings, setCurrentMeetings] = useState<{ [key: string]: any }>([]); // Define state as an array of strings

  const [videoDetails, setVideoDetails] = useState<VideoData[]>([]);

  const authContext = useAuth();
  if (!authContext) {
    // Handle the case where auth context is null. For example:
    return null; // or some other appropriate handling
  }
  const { loggedInUsername, setLoggedInUsername, userGroup, setUserGroup, isResearcher, setIsResearcher, researcher, setResearcher } = authContext;


  useEffect(() => {
    // Check if user is already logged in
    const storedUsername = localStorage.getItem('loggedInUsername');
    const storedUserGroup = localStorage.getItem('loggedInUserGroup');
    const storedIsResearcher = localStorage.getItem('loggedInIsResearcher');
    const storedResearcher = localStorage.getItem('loggedInResearcher')

    if (storedIsResearcher === "false") {
      history.push('/home');
    } 

    setLoggedInUsername(storedUsername);
    setUserGroup(storedUserGroup || "");
    setIsResearcher(storedIsResearcher === "true");
    setResearcher(storedResearcher || "");

  }, [setLoggedInUsername, history]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUsername');
    setLoggedInUsername(null);
    setUserGroup("");
    setIsResearcher(false);
    history.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Login attempted');
    e.preventDefault();
    const result = await checkLoginCredentials(username, password);
    console.log('Login successful. Group:', result);

    if (result.valid) {
      setUserGroup(result.room1)
      setLoggedInUsername(username);
      setIsResearcher(result.isResearcher);
      setResearcher('r');
      if (result.isResearcher === 'false') {
        history.push('/');
      }
      // if (!status) {
      //   onLeaveOrJoinSession();
      // }
    } else {
      console.log('Invalid username or password');
      // Handle invalid login, maybe show an error message
    }
  };

  const onCardClick = async (id: string) => {
    setUserGroup(id);
  
    try {
      const canShowResearcher = await fetchCanShowResearcher(id);
      console.log("canShowResearcher: ", canShowResearcher);
      // Assuming `createVideoToken` returns a Promise; adjust as necessary
      await createVideoToken(id, canShowResearcher);
  
      // Ensure that `haveUserJoinRoom` and the navigation to `/video` happens after `createVideoToken`
      haveUserJoinRoom(username, id); // Use `username` directly, assuming it's defined in scope
      history.push(`/video`);
    } catch (error) {
      console.error('Error in onCardClick:', error);
      // Handle any errors, such as showing an error message to the user
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await fetchAllVideos();
        setVideoDetails(videos);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };
  
    if (authContext?.loggedInUsername) {
      fetchVideos();
    }

    const fetchAndSetCurrentMeetings = async () => {
      const response = await fetchCurrentMeetings();
      if (response.success && response.meetings) {
        console.log("meetings: ", response.meetings);
        // Assuming response.meetings is an array of meeting objects
        setCurrentMeetings(response.meetings);
      } else {
        console.error("Failed to fetch current meetings:", response.message);
      }
    };

    if (authContext?.loggedInUsername) {
      fetchAndSetCurrentMeetings();
    }
  }, [authContext?.loggedInUsername]);
  
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

            <button style={{ marginRight: '20px' }} onClick={() => history.push('/admin')} className="researcher-button">
              Admin Page
            </button>

            <button style={{ marginRight: '20px' }} onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
          <div className="home" style={{ textAlign: 'left', marginLeft: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Please refresh the page before joining a room</h2>
            <h1 style={{ marginBottom: '10px' }}>Available Rooms:</h1>
            <div className="feature-entry" style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'left' }}>
              {currentMeetings.map((meet: { id: string, users: string[] }) => (
                <Card
                  cover={<IconFont style={{ fontSize: '72px' }} type="icon-meeting" />}
                  hoverable
                  style={{ width: 320, alignSelf: 'flex-start' }} // Aligns card to the left
                  className="entry-item"
                  key={meet.id}
                  onClick={() => onCardClick(meet.id)}
                >
                  <Meta 
                    title={`Room ID: ${meet.id}`}
                    description={`Users: ${meet.users.join(', ')}`}
                    style={{ textAlign: 'left' }} // Ensures text inside Meta is aligned left
                  />
                </Card>
              ))}
            </div>
          </div>

          {loggedInUsername && (
            <div className="video-details" style={{ textAlign: 'left' }}>
              <h1 style={{ marginBottom: '0px', marginLeft: '20px' }}>Recorded Videos</h1>
              <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))', gap: '10px' }}> 
                {/* Adjust gridTemplateColumns as needed to fit your design */}
                {videoDetails.map((video, index) => (
                  <div className="video-item" key={index} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '0px' }}> {/* Additional styling for video items */}
                    <a href={video.videoURL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '0px' }}>Video Link</a>
                    <span style={{ display: 'block', marginBottom: '5px' }}>researcher: {video.userId}</span>
                    <span style={{ display: 'block', marginBottom: '0px' }}>
                      Start Time: {new Date(video.callStartTime).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: 'block', marginBottom: '0px' }}>
                      End Time: {new Date(video.callEndTime).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <a href={('/r/' + video.videoStorageId)} style={{ display: 'block' }}>Critical Moments & Chat</a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
export default Home;
