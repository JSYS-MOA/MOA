import "../../src/assets/styles/component/confirmModal.css";
import {IoCloseOutline} from "react-icons/io5";

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmModal = ({isOpen, message, onConfirm, onClose}: ConfirmModalProps) => {
    if (!isOpen) return null;

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
                    <p className="message">{message}</p>
                </div>
                <div className="confirm-Footer btn-Wrap">
                    <button className="btn-Primary" onClick={onConfirm}>확인</button>
                    <button className="btn-Secondary" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    )
}
export default ConfirmModal;