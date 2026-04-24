import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const Alert = ({ children , onClose }: {
  children: React.ReactNode ,
  onClose: () => void  }) => {
  return (
    <div className="confirm-Overlay">
                <div className="confirm-Container">
                    <div className="confirm-Header">
                        <p>알림</p>
                        <button onClick={onClose}>
                            <IoCloseOutline color="#fff" size={18} />
                        </button>
                    </div>
                    <div className="confirm-Body">
                        <p className="message">{children}</p>
                    </div>
                    <div className="confirm-Footer btn-Wrap">
                        <button className="btn-Secondary" onClick={onClose}>닫기</button>
                    </div>
                </div>
            </div>

  );
};

export default Alert;
