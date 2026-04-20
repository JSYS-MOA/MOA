import {BiLinkExternal} from "react-icons/bi";
import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/notice.css";

const Notice = () => {

    return(
        <div className="notice-Wrapper">
            <div className="notice-Header">
                <p>전체공지</p>
                <div className="notice-Header-Icon">
                    <BiLinkExternal size={16} color="#d0d0d0" />
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
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default Notice;