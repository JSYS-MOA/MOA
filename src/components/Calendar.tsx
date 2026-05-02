import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import "../assets/styles/component/calendar.css";
import type { CalendarEvent } from "../types/calendar";

interface CalendarProps {
    viewDate?: Date;
    onViewDateChange?: (date: Date) => void;
    events?: CalendarEvent[];
    renderEvent?: (event: CalendarEvent & { isStart: boolean; isEnd: boolean }) => ReactNode;
    renderDateCell?: (date: Date, isToday: boolean) => ReactNode;
    onEventClick?: (calendarId: number) => void;
    showHeader?: boolean;
    categoryStyles?: Record<string, {dot: string}>;
}

//서버에서 오는 날짜가 시간 포함이라 시간을 제거하고 숫자로 변환해서 eventMap의 key로 사용
const normalizeDate = (date: Date | string) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const Calendar = ({
                      viewDate: externalViewDate,
                      onViewDateChange,
                      events = [],
                      onEventClick,
                      showHeader = true,categoryStyles
                  }: CalendarProps) => {

    const [internalViewDate, setInternalViewDate] = useState(new Date());
    const viewDate = externalViewDate ?? internalViewDate;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const changeMonth = (offset: number) => {
        const newDate = new Date(year, month + offset, 1);
        if (onViewDateChange) {
            onViewDateChange(newDate);
        } else {
            setInternalViewDate(newDate);
        }
    };

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDay = new Date(year, month, lastDate).getDay();

    const emptySlots = Array.from({ length: firstDay });
    const days = Array.from({ length: lastDate }, (_, i) => i + 1);
    const nextSlots = lastDay < 6 ? Array.from({ length: 6 - lastDay }) : [];

    const eventMap = useMemo(() => {
        const map = new Map<number, (CalendarEvent & { isStart: boolean; isEnd: boolean })[]>();

        events.forEach(e => {
            const start = normalizeDate(e.eventStartDate);
            const end = normalizeDate(e.eventEndDate);

            for (let d = start; d <= end; d += 86400000) {
                if (!map.has(d)) map.set(d, []);
                map.get(d)!.push({
                    ...e,
                    isStart: d === start,
                    isEnd: d === end,
                });
            }
        });

        // 모든 날짜 다 채운 후 한 번만 정렬 (긴 일정이 위로)
        map.forEach(dayEvents => {
            dayEvents.sort((a, b) => {
                const aDuration = normalizeDate(a.eventEndDate) - normalizeDate(a.eventStartDate);
                const bDuration = normalizeDate(b.eventEndDate) - normalizeDate(b.eventStartDate);
                return bDuration - aDuration;
            });
        });

        return map;
    }, [events]);

    return (
        <div className="calendar">

            {showHeader && (
                <div className="calendar-Header">
                    <div />
                    <div className="calendar-Month">
                        <button onClick={() => changeMonth(-1)}><SlArrowLeft /></button>
                        <span>{year}년 {month + 1}월</span>
                        <button onClick={() => changeMonth(1)}><SlArrowRight /></button>
                    </div>
                    {categoryStyles && (
                        <div className="calendar-Event">
                            {Object.entries(categoryStyles).map(([name, style]) => (
                                <div key={name} style={{display: "flex", alignItems: "center", gap: "4px"}}>
                        <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: style.dot,
                            display: "inline-block",
                        }}/>
                                    <span>{name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="calendar-DayCon">
                {["일","월","화","수","목","금","토"].map(d => (
                    <div key={d} className="day-Header">{d}</div>
                ))}
            </div>

            <div className="calendar-DateCon">

                {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-EmptyDate" />
                ))}

                {days.map(day => {

                    const current = new Date(year, month, day);
                    const currentKey = normalizeDate(current);


                    //오늘 날짜에 도트 표시하기위함
                    const today = new Date();
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();

                    const dayEvents = eventMap.get(currentKey) ?? [];

                    return (
                        <div key={day} className="calendar-Date">
                            <span className={`calendar-Date-number ${isToday ? "today" : ""}`}>
                                {day}
                            </span>
                            {dayEvents.map(e => (
                                <div
                                    key={`${e.calendarId}-${currentKey}`}
                                    onClick={() => onEventClick?.(e.calendarId)}
                                    className={`calendar-event ${e.isStart ? "start" : ""}`}
                                    style={{ background: e.isStart ? (e.color ?? "transparent") : "transparent" }}
                                >
                                    <>
                                        <span
                                            className="calendar-event-dot"
                                            style={{ background: e.dotColor ?? "#aaa" }}
                                        />
                                        <span className="calendar-event-name">
                                            {e.calendarCategoryName}
                                        </span>
                                    </>
                                </div>
                            ))}

                        </div>
                    );
                })}

                {nextSlots.map((_, i) => (
                    <div key={`next-${i}`} className="calendar-EmptyDate" />
                ))}

            </div>
        </div>
    );
};

export default Calendar;