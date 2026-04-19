import {useEffect, useState} from "react";
import "../../../assets/styles/main/attendanceCard.css";
import { MdRefresh } from "react-icons/md";

const AttendanceCard = () => {

    const [currentTime, setCurrentTime] = useState("");
    const [startTime, setStartTime] = useState("00:00:00");
    const [endTime, setEndTime] = useState("00:00:00");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const ampm = now.getHours() < 12 ? "오전" : "오후";
            const hours = String(now.getHours() % 12 || 12).padStart(2,"0");
            const minutes = String(now.getMinutes()).padStart(2,"0");
            const seconds = String(now.getSeconds()).padStart(2,"0");

            setCurrentTime(`${ampm} ${hours}:${minutes}:${seconds}`);
        },1000)
        return () => clearInterval(timer);
    }, []);

    const today = new Date();
    const days =["일","월","화","수","목","금","토"];
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() +1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`;

    const getTimeStr = () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }

    const handleCheckin = () => {
        if(startTime !== "00:00:00") return;
        setStartTime(getTimeStr());
    }

    const handleCheckout = () => {
        if(startTime === "00:00:00") return;
        if(endTime !== "00:00:00") return;
        setEndTime(getTimeStr());
    }

    const calcWorkTime = (start:string, end:string) => {
        if(start === "00:00:00") return "00:00:00";

        const[sh, sm, ss] = start.split(":").map(Number);
        const now = end !== "00:00:00" ? end: getTimeStr();
        const[eh, em, es] = now.split(":").map(Number);

        const calc = (eh * 3600 + em * 60 + es) - (sh * 3600 + sm * 60 + ss);

        const h = String(Math.floor(calc/3600)).padStart(2,"0");
        const m = String(Math.floor((calc % 3600)/60)).padStart(2,"0");
        const s = String(calc % 60).padStart(2,"0");

        return `${h}:${m}:${s}`;
    }
    return(
        <div className="main-Card">
            <div className="card-Header">
                <p>출근 / 퇴근 카드</p>
                <MdRefresh size={18} color="lightgray"/>
            </div>
            <div className="card-Inner">
                <p className="date">{dateStr}</p>
                <p className="time">{currentTime}</p>
                <div className="attendance-Btn">
                    <button className="btn-checkin" onClick={handleCheckin}>출근</button>
                    <button className="btn-checkout" onClick={handleCheckout}>퇴근</button>
                </div>
                <div className="attendance-Info">
                    <p className="info-Title">오늘의 근무</p>
                    <div className="info-list">
                        <div>
                            <span>출근</span>
                            <span>{startTime}</span>
                        </div>
                        <div>
                            <span>퇴근</span>
                            <span>{endTime}</span>
                        </div>
                        <div>
                            <span>근무</span>
                            <span>{calcWorkTime(startTime,endTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AttendanceCard;