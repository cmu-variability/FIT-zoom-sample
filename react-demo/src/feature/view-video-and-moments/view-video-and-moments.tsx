import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVideoData, VideoData, CriticalMoment } from '../../firebaseConfig';
import { useHistory } from 'react-router-dom';

interface VideoParams {
  videoIndex: string;
}

const ViewVideo: React.FunctionComponent = () => {
  const { videoIndex } = useParams<VideoParams>();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element

  const history = useHistory();

  useEffect(() => {
    const fetchVideo = async () => {
      const vd = await fetchVideoData(videoIndex);
      setVideoData(vd);
    };

    fetchVideo();
  }, [videoIndex]);

  const handleSkipToMoment = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button onClick={() => history.goBack()} style={{ cursor: 'pointer', marginRight: '20px', fontSize: '16px', padding: '10px' }}>
              Go Back
            </button>
            <h1 style={{ margin: 0 }}>Video Details</h1>
          </div>          
          <video
            ref={videoRef}
            controls
            style={{ width: '100%' }}
            src={videoData.videoURL}
            crossOrigin="anonymous"
          ></video>
          <h2>Critical Moments</h2>
          <ul>
            {videoData.criticalMoments.map((moment: CriticalMoment, index: number) => (
              <li key={index}>
                <button onClick={() => handleSkipToMoment(moment.time / 1000)}> {/* Convert milliseconds to seconds */}
                  <p>Time: {formatTime(moment.time)}</p>
                  <p>User: {moment.username}</p>
                  <p>Comment: {moment.comment}</p>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading video data...</p>
      )}
    </div>
  );
};

export default ViewVideo;
