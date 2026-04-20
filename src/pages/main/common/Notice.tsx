
import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/notice.css";
import {FaRegPenToSquare} from "react-icons/fa6";
import {useState} from "react";

const Notice = () => {

    const [notices, setNotices] = useState<Notice[]>([]);
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
                    <tr>
                        <td>제목</td>
                        <td>제목</td>
                        <td>제목</td>
                        <td>제목</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default Notice;