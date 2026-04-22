import {useEffect, useState} from "react";
import {getNoticeInfoApi} from "../../../apis/NoticeService.tsx";
import Modal from "../../../components/Modal.tsx";
import {useAuthStore} from "../../../stores/useAuthStore.tsx";

interface NoticeDetail{
    noticeId: number;
    noticeTitle: string;
    noticeContent: string;
    file: string;
    postDate: string;
    writerName: string;
    writerId: number;
}
interface NoticeDetailModalProps {
    noticeId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (id: number) => void;
}

const NoticeDetailModal = ({noticeId, isOpen, onClose, onEdit }:NoticeDetailModalProps) => {

    const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false)
    const BASE_URL = "http://localhost/api";
    const user = useAuthStore(state => state.user);

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
        void fetchData();
    }, [noticeId, isOpen]);

    const handleClose = () => {
        setSelectedNotice(null);
        onClose();
    }
    useEffect(() => {
        if (selectedNotice && user) {
            console.log("writerId:", selectedNotice.writerId, typeof selectedNotice.writerId);
            console.log("userId:", user.userId, typeof user.userId);
        }
    }, [selectedNotice, user]);

    return(
        <>
            <Modal
                title="공지사항"
                isOpen={isOpen}
                onClose={handleClose}
                footer={
                    <div className="btn-Wrap">
                        {selectedNotice?.writerId === user?.userId && (
                            <button
                                className="btn-Primary"
                                onClick={() => {
                                    if (selectedNotice) {
                                        onEdit(selectedNotice.noticeId);
                                    }
                                }}
                            >
                                수정
                            </button>
                        )}
                        <button className="btn-Primary" onClick={handleDelete}>
                            삭제
                        </button>
                        <button className="btn-Secondary" onClick={handleClose}>
                            취소
                        </button>
                    </div>
                }
            >
                {isLoading ? (
                    <div className="spinner-Wrap">
                        <span className="spinner"></span>
                        로딩 중...
                    </div>
                ) : selectedNotice ? (
                    <>
                        <p style={{fontSize:"17px", color:"#282828",fontWeight:600}}>{selectedNotice.noticeTitle}</p>
                        <div style={{fontSize:"13px",fontWeight:200,flex:"1",marginTop:"10px"}}>
                            <p>{selectedNotice.noticeContent}</p>
                        </div>
                        {selectedNotice.file && (
                            <a href={`${BASE_URL}/main/file/${selectedNotice.file}`} target="_blank" style={{fontSize:"13px"}}>
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