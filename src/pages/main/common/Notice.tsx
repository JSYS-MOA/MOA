
import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/notice.css";
import {FaRegPenToSquare} from "react-icons/fa6";
import {useEffect, useState} from "react";
import {getNoticesApi} from "../../../apis/NoticeService.tsx";

interface Notice {
    noticeId: number;
    noticeTitle: string;
    file: string;
    postDate: string;
    writer: number;
}

const Notice = () => {

    const [notices, setNotices] = useState<Notice[]>([]);

    useEffect(() => {
        getNoticesApi()
            .then((data) => setNotices(data))
            .catch((err) => console.error(err));
    }, []);

    return(
        <div className="notice-Wrapper">
            <div className="notice-Header">
                <p>전체공지</p>
                <div className="notice-Header-Icon">
                    <FaRegPenToSquare size={15} color="#d0d0d0" />
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
                        <td>{notice.noticeTitle}</td>
                        <td>{notice.postDate}</td>
                        <td>{notice.writer}</td>
                        <td>{notice.file ? "Y" : "N"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
export default Notice;