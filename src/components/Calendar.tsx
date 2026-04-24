import { useState } from 'react';
import {SlArrowLeft, SlArrowRight} from "react-icons/sl";
import "../assets/styles/component/calendar.css";

interface CalendarProps {
    showHeader?: boolean;
}

const Calendar = ({showHeader = true}:CalendarProps ) => {

 const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };


  return (
    <div>
        {showHeader && (
            <div className="calendar-Header" >
                <button onClick={() => changeMonth(-1)}><SlArrowLeft /></button>
                {year}년 {month + 1}월
                <button onClick={() => changeMonth(1)}><SlArrowRight /></button>
            </div>
        )}

      <div className="calendar-DayCon">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div className="day-Header" key={d} >{d}</div>)}
      </div>

      <div className="calendar-DateCon">
      
        {emptySlots.map(i => <div className="calendar-EmptyDate" key={`empty-${i}`} />)}
        
      
        {days.map(day => (
          <div className="calendar-Date" key={day}>
              <span>{day}</span>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Calendar
