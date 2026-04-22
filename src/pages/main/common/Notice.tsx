import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/notice.css";
import {FaRegPenToSquare} from "react-icons/fa6";
import {useEffect, useState} from "react";
import { getNoticesApi} from "../../../apis/NoticeService.tsx";
import NoticeDetailModal from "./NoticeDetailModal.tsx";
import NoticeWriteModal from "./NoticeWriteModal.tsx";

interface Notice {
    noticeId: number;
    noticeTitle: string;
    file: string;
    postDate: string;
    writerName: string;
}

const Notice = () => {

    const [notices, setNotices] = useState<Notice[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        getNoticesApi()
            .then((data) => setNotices(data))
            .catch((err) => console.error(err));
    }, []);

    const handleNoticeClick = (noticeId: number) => {
        setSelectedId(noticeId);
        setIsDetailOpen(true);
    }

    return(
        <div className="notice-Wrapper">
            <div className="notice-Header">
                <p>전체공지</p>
                <div className="notice-Header-Icon">
                    <FaRegPenToSquare
                        size={15}
                        color="#d0d0d0"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setEditId(null);       // 등록 모드
                            setIsWriteOpen(true);
                        }}
                    />
                    <MdRefresh size={19} color="#d0d0d0"/>
                </div>
            </div>
            <table className="notice-Table">
                <thead>
                <tr>
                    <th>제목</th>
                    <th>작성일</th>
                    <th>작성자</th>
                    <th>첨부</th>
                </tr>
                </thead>
                <tbody>
                {notices.map(notice => (
                    <tr key={notice.noticeId}>
                        <td onClick={() => handleNoticeClick(notice.noticeId)} style={{cursor:"pointer", color:"#091B72"}}>{notice.noticeTitle}</td>
                        <td>{notice.postDate}</td>
                        <td>{notice.writerName}</td>
                        <td>{notice.file ? "Y" : "N"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <NoticeDetailModal
                noticeId={selectedId}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onEdit={(id) => {
                    setIsDetailOpen(false);
                    setEditId(id);
                    setIsWriteOpen(true);
                }}
            />
            <NoticeWriteModal
                isOpen={isWriteOpen}
                noticeId={editId}
                onClose={() => setIsWriteOpen(false)}
            />

        </div>
    )
}
export default Notice;