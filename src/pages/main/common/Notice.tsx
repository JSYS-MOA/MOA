import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/notice.css";
import {FaRegPenToSquare} from "react-icons/fa6";
import {useState} from "react";
import { getNoticesApi} from "../../../apis/NoticeService.tsx";
import NoticeDetailModal from "./NoticeDetailModal.tsx";
import NoticeWriteModal from "./NoticeWriteModal.tsx";
import {useQuery} from "@tanstack/react-query";
import type {NoticeItem} from "../../../types/notice.ts";


const Notice = () => {

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

   const { data:notices =[], refetch,isLoading } = useQuery({
       queryKey:["notices"],
       queryFn: getNoticesApi
   })

    //[..notices] -> 배열 복사(원본은 놔두기 위해)
    //sort(a,b) -> a,b 두 개씩 비교하면서 정렬
    const sortedNotices = [...notices].sort((a: NoticeItem, b: NoticeItem) => {

        //a가 공지이고 b가 일반이면 a를 앞으로
        if(a.isNotice && !b.isNotice) return -1
        //a가 일반이고 b가 공지이면 b를 앞으로
        if(!a.isNotice && b.isNotice) return 1;
        return 0;
    })

    const handleNoticeClick = (noticeId: number) => {
        setSelectedId(noticeId);
        setIsDetailOpen(true);
    }

    return(
        <div className="notice-Wrapper">
            <div className="notice-Header">
                <p>전체공지</p>
                <div className="Header-Icon">
                    <FaRegPenToSquare
                        size={15}
                        color="#d0d0d0"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setEditId(null);
                            setIsWriteOpen(true);
                        }}
                    />
                    <MdRefresh
                        size={19}
                        color="#d0d0d0"
                        style={{cursor:"pointer"}}
                        onClick={() => refetch()}
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="notice-IsLoading">
                    <div className="spinner-Wrap">
                        <span className="spinner spinner-Dark"></span>
                        로딩 중...
                    </div>
                </div>
            ) : (
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
                    {sortedNotices.map((notice: NoticeItem) => (
                        <tr key={notice.noticeId} className={notice.isNotice ? "notice-IsNotice-Row" : ""}>
                            <td
                                onClick={() => handleNoticeClick(notice.noticeId)}
                                style={{cursor: "pointer", color: "#091B72"}}
                            >
                                {notice.isNotice && (
                                    <span className="notice-IsNotice">
                                        공지
                                    </span>
                                )}
                                {notice.noticeTitle}
                            </td>
                            <td>{notice.postDate}</td>
                            <td>{notice.writerName}</td>
                            <td>{notice.file ? "Y" : "N"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            <NoticeDetailModal
                noticeId={selectedId}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onSuccess={() => refetch()}
                onEdit={(id) => {
                    setIsDetailOpen(false);
                    setEditId(id);
                    setIsWriteOpen(true);
                }}
            />
            <NoticeWriteModal
                isOpen={isWriteOpen}
                noticeId={editId}
                onSuccess={() => refetch()}
                onClose={() => setIsWriteOpen(false)}
            />

        </div>
    )
}
export default Notice;