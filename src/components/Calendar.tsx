import { useState } from 'react';
import {SlArrowLeft, SlArrowRight} from "react-icons/sl";
import "../assets/styles/component/calendar.css";
import type {CalendarEvent} from "../types/calendar.ts";

interface CalendarProps {
    showHeader?: boolean;
    viewDate?: Date;
    events?: CalendarEvent[];
}

const Calendar = ({showHeader = true, viewDate: externalViewDate, events = []}:CalendarProps ) => {
    const [internalViewDate, setInternalViewDate] = useState(new Date());
    const viewDate = externalViewDate ?? internalViewDate;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const lastDayOfMonth = new Date(year, month, lastDateOfMonth).getDay();

  const days = Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const remainingSlots = lastDayOfMonth < 6 ? 6 - lastDayOfMonth : 0;
  const nextMonthDays = Array.from({length: remainingSlots}, (_, i) => i + 1);


  const changeMonth = (offset: number) => {
      setInternalViewDate(new Date(year, month + offset, 1));
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


        {days.map(day => {
            const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

            const dayEvents = events.filter(e => {
                const start = new Date(e.eventStartDate.replace(" ", "T"));
                return start.getFullYear() === year &&
                    start.getMonth() === month &&
                    start.getDate() === day;
            });

            return (
                <div className="calendar-Date" key={day}>
                     <span style={{
                         display: "inline-block",
                         width: "20px",
                         height: "20px",
                         lineHeight: "20px",
                         textAlign: "center",
                         borderRadius: "50%",
                         background: isToday ? "#DA5C57" : "transparent",
                         color: isToday ? "white" : ""
                     }}>{day}</span>
                    {dayEvents.map(e => (
                        <div key={e.calendarId} style={{
                            fontSize: "12px",
                            background: e.color ?? "#aaa",
                            color: "#091B72",
                            padding: "4px 4px",
                            marginTop: "4px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            fontWeight:"500",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}>
                            <span style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: e.dotColor ?? "#aaa",
                                flexShrink: 0
                            }}/>
                            {e.calendarCategoryName}
                        </div>
                    ))}
                </div>
            );
        })}
          {nextMonthDays.map((_, i) => (
              <div className="calendar-EmptyDate" key={`next-${i}`}/>
          ))}
      </div>
    </div>
  )
}

export default Calendar
