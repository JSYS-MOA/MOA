import AttendanceCard from "./common/AttendanceCard.tsx";
import ApprovalStatus from "./common/ApprovalStatus.tsx";
import MainCalendar from "./common/MainCalendar.tsx";
import Notice from "./common/Notice.tsx";
import "../../assets/styles/mainPage.css";
import React from "react";

const MainPageLayout = ({children}:{children:React.ReactNode}) => {

    return(
        <div className="mainPage-Wrapper">
            <div className="left-Section">
                <div className="top-Cards">
                    <AttendanceCard />
                    <ApprovalStatus />
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