import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/mainPage.css"

const ApprovalCard = () => {

    return(
        <div className="main-Card">
            <div className="card-Header">
                <p>내 결제근황</p>
                <MdRefresh size={19} color="lightgray"/>
            </div>
            <div className="card-Inner approvalCard-Inner">
                <button className="approval-Item">
                    <span>진행중</span>
                    <span>3건</span>
                </button>
                <button className="approval-Item">
                    <span>반려</span>
                    <span>3건</span>
                </button>
                <button className="approval-Item">
                    <span>결재</span>
                    <span>3건</span>
                </button>
            </div>
        </div>
    )
}
export default ApprovalCard;