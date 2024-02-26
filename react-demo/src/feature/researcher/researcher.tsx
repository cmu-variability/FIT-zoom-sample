/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card, Button } from 'antd';
import { IconFont } from '../../component/icon-font';
import './researcher.scss';
import { checkLoginCredentials } from '../../firebaseConfig'; // adjust the import path as needed
import { useAuth } from '../../authContext'; // Adjust the path as per your directory structure
import { haveUserJoinRoom, fetchAllVideos, VideoData, fetchCurrentMeetings } from '../../firebaseConfig';


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
      setUserGroup(result.group)
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
    await createVideoToken(id, true);
    history.push(`/video`);
    haveUserJoinRoom(username, id); // Use `id` directly as `userGroup` state might not be updated yet
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await fetchAllVideos();
        setVideoDetails(videos); // This now expects videos to be of type VideoData[]
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
          <div className="home">
            <h1>Available Rooms:</h1>
            <div className="feature-entry">
              {currentMeetings.map((meet: { [key: string]: any }) => {
                const id = Object.keys(meet)[0];
                const users = meet[id].users;
                console.log("users: ", users);
                return (
                  <Card
                    cover={<IconFont style={{ fontSize: '72px' }} type={"icon-meeting"} />}
                    hoverable
                    style={{ width: 320 }}
                    className="entry-item"
                    key={"video"}
                    onClick={() => onCardClick(id)}
                  >
                    <Meta title={id} description={users.join(', ')} />
                  </Card>
                );
              })}
            </div>
          </div>

          {loggedInUsername && (
            <div className="video-details">
              <h2>Recorded Videos</h2>
              <div className="video-grid"> {/* Apply the grid container class here */}
                {videoDetails.map((video, index) => (
                  <div className="video-item" key={index}> {/* Apply the item class here */}
                    <a href={video.videoURL} target="_blank">Firebase Video Link</a>
                    <span>Start Time: {video.callStartTime}</span>
                    <a href={('/r/' + video.videoStorageId)}>Watch Video</a>
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
