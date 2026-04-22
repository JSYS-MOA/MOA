import {IoCloseOutline} from "react-icons/io5";
import "../assets/styles/component/modal.css";

interface ModalProps{
    title:string;
    isOpen:boolean;
    onClose: () => void;
    children: React.ReactNode;
    footer?:React.ReactNode;
}

const Modal = ({ title, isOpen, onClose, children, footer}:ModalProps) => {

    if(!isOpen) return null;

    return(
        <div className="modal-Overlay">
            <div className="modal-Container">
                <div className="modal-Header">
                    <p>{title}</p>
                    <button onClick={onClose}>
                        <IoCloseOutline color="#fff" size={18} />
                    </button>
                </div>
                <div className="modal-Title">
                    <p>{title}</p>
                </div>
                <div className="modal-Body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-Footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
export default Modal;