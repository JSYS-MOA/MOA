import {useEffect, useState} from "react";
import {getNoticeInfoApi} from "../../../apis/NoticeService.tsx";
import Modal from "../../../components/Modal.tsx";

interface NoticeDetail{
    noticeId: number;
    noticeTitle: string;
    noticeContent: string;
    file: string;
    postDate: string;
    writerName: string;
}
interface NoticeDetailModalProps {
    noticeId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const NoticeDetailModal = ({noticeId, isOpen, onClose }:NoticeDetailModalProps) => {

    const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (noticeId == null || !isOpen) return;

        setSelectedNotice(null);

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getNoticeInfoApi(noticeId);
                setSelectedNotice(data);
            } catch {
                console.error("공지사항 데이터 불러오기 실패");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [noticeId, isOpen]);

    const handleClose = () => {
        setSelectedNotice(null);
        onClose();
    }

    return(
        <>
            <Modal
                title="공지사항"
                isOpen={isOpen}
                onClose={handleClose}
                footer={
                    <button className="btn-Primary" onClick={handleClose}>확인</button>
                }
            >
                {isLoading ? (
                    <div className="spinner-Wrap">
                        <span className="spinner"></span>
                        로딩 중...
                    </div>
                ) : selectedNotice ? (
                    <>
                        <p style={{fontSize:"17px", margin:"10px", color:"#282828",fontWeight:600}}>{selectedNotice.noticeTitle}</p>
                        <div style={{fontSize:"13px", margin:" 12px 10px",fontWeight:200,flex:"1"}}>
                            <p>{selectedNotice.noticeContent}</p>
                        </div>
                        {selectedNotice.file && (
                            <a href={`http://localhost/api/files/${selectedNotice.file}`} target="_blank" style={{fontSize:"13px"}}>
                                <p>{selectedNotice.file}</p>
                            </a>
                        )}
                    </>
                ): (
                    <p>데이터를 불러올 수 없습니다. 관리자에게 문의바랍니다.</p>
                )}
            </Modal>
        </>
    )
}
export default NoticeDetailModal;