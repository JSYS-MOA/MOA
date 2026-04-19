import AttendanceCard from "./common/AttendanceCard.tsx";
import ApprovalCard from "./common/ApprovalCard.tsx";
import MainCalendar from "./common/MainCalendar.tsx";
import Notice from "./common/Notice.tsx";
import "../../assets/styles/main/mainPage.css";
import React from "react";

const MainPageLayout = ({children}:{children:React.ReactNode}) => {

    return(
        <div className="mainPage-Wrapper">
            <div className="left-Section">
                <div className="top-Card">
                    <AttendanceCard />
                    <ApprovalCard />
                </div>
                    <MainCalendar />
            </div>
            <div className="right-Section">
                <Notice />
                {children}
            </div>
        </div>
    )
}
export default MainPageLayout;