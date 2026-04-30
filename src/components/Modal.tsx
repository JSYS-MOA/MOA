import {IoCloseOutline} from "react-icons/io5";
import "../assets/styles/component/modal.css";

interface ModalProps{
    title:string;
    isOpen:boolean;
    onClose: () => void;
    children: React.ReactNode;
    footer?:React.ReactNode;
    tableContent?: React.ReactNode;
    bodyStyle?: React.CSSProperties;
}

const Modal = ({ title, isOpen, onClose, children, footer, tableContent, bodyStyle}:ModalProps) => {

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
                    {children && (
                        <div className="modal-Children" style={bodyStyle}>
                            {children}
                        </div>
                    )}
                    {tableContent && (
                        <div className="table-Content">
                            {tableContent}
                        </div>
                    )}
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