import "../../assets/styles/component/confirmModal.css"
import {IoCloseOutline} from "react-icons/io5";

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: (e : any) => void;
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

                    { message === '결재처리하시겠습니까'  ? 
                    <>
                        <button className="btn-Primary" onClick={(e)=>{onConfirm(e); onClose();}} value='결재'>결재</button>
                        <button className="btn-Primary" onClick={(e)=>{onConfirm(e); onClose();}} value='반려'>반려</button>
                    </>
                    :
                    <button className="btn-Primary" onClick={(e)=>{onConfirm(e); onClose();}}>확인</button>
                    }
                    <button className="btn-Secondary" onClick={onClose}>취소</button>


                </div>
            </div>
        </div>
    )
}
export default ConfirmModal;