import "../../../assets/styles/main/approvalCard.css";

const ApprovalCard = () => {

    return(
        <div className="main-Card">
            <div className="card-Header">
                <p>내 결제 근황</p>
                <span aria-hidden="true">Refresh</span>
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
