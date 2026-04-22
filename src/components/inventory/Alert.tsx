import React from 'react';

const Alert = ({ children , onClose }: {
  children: React.ReactNode ,
  onClose: () => void  }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      border: '2px solid red',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10000
    }}>

      <span>{children}</span>
      <button onClick={onClose} style={{ marginLeft: '10px' }}>확인</button>
    </div>
  );
};

export default Alert;
