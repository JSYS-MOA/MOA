import {FaStar} from "react-icons/fa";
import Calendar from "../../components/Calendar.tsx";
import {useState} from "react";
import "../../assets/styles/mypage/myCalendar.css";
import DropdownSelect from "../../components/DropdownSelect.tsx";
import CalendarWriteModal from "./CalendarWriteModal.tsx";

const MyCalendar = () => {

    const [viewDate, setViewDate] = useState(new Date());
    const [showShared, setShowShared] = useState(true);
    const [showPersonal, setShowPersonal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() + 1 - i);
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return(
        <>
            <div className="favorite-Header">
                <FaStar size={18} color="#C4C4C4"/>
                <span>일정관리</span>
            </div>
            <div className="myCalendar-Wrapper">
                <div className="myCalendar-Side">
                    <div className="myCalendar-Year">
                        <DropdownSelect
                            value={year}
                            options={years}
                            onChange={(y) => setViewDate(new Date(y, month, 1))}
                            allowInput={true}
                        />
                    </div>
                        <div className="myCalendar-Months">
                            {months.map(m => (
                                <button
                                    key={m}
                                    className={`month-Btn ${month +1 === m ? "active":""}`}
                                    onClick={()=>setViewDate(new Date(year,m-1,1 ))}
                                >
                                    {m}월
                                </button>
                            ))}
                        </div>
                        <div className= "myCalendar-Filter">
                            <p className="filter-Title">내 캘린더</p>
                            <label className="filter-Item">
                                <input
                                    type="checkbox"
                                    checked={showShared}
                                    onChange={(e)=>setShowShared(e.target.checked)}
                                />
                                [기본] 공유일정캘린더
                            </label>
                            <label className="filter-Item">
                                <input
                                    type="checkbox"
                                    checked={showPersonal}
                                    onChange={(e)=>setShowPersonal(e.target.checked)}
                                />
                                개인일정캘린더
                            </label>
                        </div>
                    </div>
                <div className="myCalendar-Main">
                    <Calendar
                        showHeader={false}
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="myCalendar-addBtn btn-Primary"
                    >
                        신규
                    </button>
                </div>
            </div>
            <CalendarWriteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {}}
            />
        </>
    )
}
export default MyCalendar;