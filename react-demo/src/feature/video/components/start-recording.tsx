import React from 'react';
import { Button, Tooltip } from 'antd';
import { VideoCameraAddOutlined } from '@ant-design/icons';

interface StartRecordingButtonProps {
  onClick: () => void; // Function to be called on click
  className?: string;
}

const StartRecordingButton: React.FC<StartRecordingButtonProps> = ({ onClick, className }) => {
  return (
    <Tooltip title="Start Recording">
      <Button
        // icon={<VideoCameraAddOutlined />}
        ghost={true}
        style={{
          borderRadius: '8px', // Adjust for desired roundness
          width: '130px', // Square-ish appearance
          height: '40px', // Matching height for square
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        size="large"
        onClick={onClick}
      >
        Start Recording
      </Button>
    </Tooltip>
  );
};

export default StartRecordingButton;
