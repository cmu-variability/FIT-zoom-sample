import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVideoData, VideoData, CriticalMoment } from '../../firebaseConfig';
import { useHistory } from 'react-router-dom';

interface VideoParams {
  videoIndex: string;
}

const ViewVideo: React.FunctionComponent = () => {
  const { videoIndex } = useParams<VideoParams>();
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const history = useHistory();

  useEffect(() => {
    const fetchVideo = async () => {
      const vd = await fetchVideoData(videoIndex);
      setVideoData(vd);
    };

    fetchVideo();
  }, [videoIndex]);

  const formatTime = (milliseconds: number) => {
    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(milliseconds / 1000);
    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Pad the minutes and seconds with leading zeros if necessary, and return the formatted time
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {videoData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', width: '100%' }}>
            <button onClick={() => history.goBack()} style={{ cursor: 'pointer', fontSize: '16px', padding: '10px', margin: 13 }}>
              Go Back
            </button>
            <h1 style={{ textAlign: 'center', margin: '0', flexGrow: 1 }}>Video Details</h1>
            <div style={{ width: '86px' }}> {/* This div acts as a spacer to keep the title centered; adjust width based on the button's width to keep the title centered */}</div>
          </div>
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{ textAlign: 'left' }}>Critical Moments</h2>
            <ul>
              {videoData.criticalMoments.map((moment: CriticalMoment, index: number) => (
                <li key={index} style={{ margin: '10px 0', display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    textAlign: 'left',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    width: '300px', // Set to 500px width
                  }}>
                    <p>Time: {formatTime(moment.time)}</p>
                    <p>User: {moment.username}</p>
                    <p>Comment: {moment.comment}</p>
                    <p>Category: {moment.category}</p>
                  </div>
                </li>
              ))}
            </ul>
            <h2 style={{ textAlign: 'left' }}>Chat Messages</h2>
            <div style={{ textAlign: 'left', maxWidth: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Time</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Username</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {videoData.chat?.map((chatMessage, index) => {
                    // Convert ISO string to Date objects
                    const messageTime = new Date(chatMessage.timestamp).getTime();
                    const startTime = new Date(videoData.callStartTime).getTime();

                    // Calculate the time difference in milliseconds
                    const timeDifference = messageTime - startTime;

                    return (
                      <tr key={index}>
                        <td>{formatTime(timeDifference)}</td>
                        <td>{chatMessage.user}</td>
                        <td>{chatMessage.text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p>Loading video data...</p>
      )}
    </div>
  );
};

export default ViewVideo;
