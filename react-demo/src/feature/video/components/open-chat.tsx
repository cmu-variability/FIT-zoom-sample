import React from 'react';
import { Button, Tooltip } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

interface OpenChatButtonProps {
  onClick: () => void; // Function to be called on click
  className?: string;
}

const OpenChatButton: React.FC<OpenChatButtonProps> = ({ onClick, className }) => {
  return (
    <Tooltip title="Open Chat">
      <Button
        icon={<MessageOutlined />}
        ghost={true}
        style={{
          borderRadius: '8px', // Adjust for desired roundness
          width: '123px', // Desired width for the button
          height: '40px', // Desired height for the button, making it square-ish
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10
        }}
        size="large"
        onClick={onClick}
      >
        Open Chat
      </Button>
    </Tooltip>
  );
};

export default OpenChatButton;
