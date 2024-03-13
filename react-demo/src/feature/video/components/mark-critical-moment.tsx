import React from 'react';
import { Button, Tooltip } from 'antd';
import { FlagOutlined } from '@ant-design/icons';

interface MarkCriticalMomentButtonProps {
  onClick: () => void; // Function to be called on click
  className?: string;
}

const MarkCriticalMomentButton: React.FC<MarkCriticalMomentButtonProps> = ({ onClick, className }) => {
  return (
    <Tooltip title="Mark Critical Moment">
      <Button
        icon={<FlagOutlined />}
        ghost={true}
        style={{
          borderRadius: '8px', // Adjust for desired roundness
          width: '195px', // Square-ish appearance
          height: '40px', // Matching height for square
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 10,
          marginRight: 10
        }}
        size="large"
        onClick={onClick}
      >
        Mark Critical Moment
      </Button>
    </Tooltip>
  );
};

export default MarkCriticalMomentButton;
