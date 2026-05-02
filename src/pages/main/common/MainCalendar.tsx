import Calendar from "../../../components/Calendar.tsx";
import {BiLinkExternal} from "react-icons/bi";
import {MdRefresh} from "react-icons/md";
import "../../../assets/styles/main/mainPage.css"

const MainCalendar = () => {

    return(
        <div className="calendar-Wrapper">
            <div className="mainCalendar-Header">
                <p>일정관리</p>
                <div className="Header-Icon">
                    <BiLinkExternal size={16} color="#d0d0d0" />
                    <MdRefresh size={19} color="#d0d0d0"/>
                </div>
            </div>
            <div className="calendar-Body">
                <Calendar />
            </div>
        </div>
    )
}
export default MainCalendar;