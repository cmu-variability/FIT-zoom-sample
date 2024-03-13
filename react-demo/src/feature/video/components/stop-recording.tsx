import React from 'react';
import { Button, Tooltip } from 'antd';
import { VideoCameraAddOutlined } from '@ant-design/icons';

interface StopRecordingButtonProps {
  onClick: () => void; // Function to be called on click
  className?: string;
}

const StartRecordingButton: React.FC<StopRecordingButtonProps> = ({ onClick, className }) => {
  return (
    <Tooltip title="Stop Recording">
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
        Stop Recording
      </Button>
    </Tooltip>
  );
};

export default StartRecordingButton;
