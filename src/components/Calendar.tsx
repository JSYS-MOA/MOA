import { useState, useMemo } from 'react';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import "../assets/styles/component/calendar.css";
import type { CalendarEvent } from "../types/calendar.ts";

interface CalendarProps {
    showHeader?: boolean;
    viewDate?: Date;
    events?: CalendarEvent[];
    onEventClick?: (calendarId: number) => void;
}

const toDayNumber = (date: Date | string) => {
    const d = new Date(date);

    return Math.floor(
        (d.getTime() - d.getTimezoneOffset() * 60000) / 86400000
    );
};

const Calendar = ({
                      showHeader = true,
                      viewDate: externalViewDate,
                      events = [],
                      onEventClick
                  }: CalendarProps) => {

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
    const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => i + 1);

    const changeMonth = (offset: number) => {
        setInternalViewDate(new Date(year, month + offset, 1));
    };

    const eventMap = useMemo(() => {
        const map = new Map<number, (CalendarEvent & { isStart: boolean; isEnd: boolean })[]>();

        events.forEach(e => {
            const start = toDayNumber(e.eventStartDate);
            const end = toDayNumber(e.eventEndDate);

            for (let d = start; d <= end; d++) {
                if (!map.has(d)) map.set(d, []);
                map.get(d)!.push({
                    ...e,
                    isStart: d === start,
                    isEnd: d === end,
                });
            }
        });

        return map;
    }, [events]);

    return (
        <div>
            {showHeader && (
                <div className="calendar-Header">
                    <button onClick={() => changeMonth(-1)}><SlArrowLeft /></button>
                    {year}년 {month + 1}월
                    <button onClick={() => changeMonth(1)}><SlArrowRight /></button>
                </div>
            )}

            <div className="calendar-DayCon">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div className="day-Header" key={d}>{d}</div>
                ))}
            </div>

            <div className="calendar-DateCon">

                {emptySlots.map(i => (
                    <div className="calendar-EmptyDate" key={`empty-${i}`} />
                ))}

                {days.map(day => {
                    const today = new Date();

                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();

                    const current = new Date(year, month, day);
                    const currentDay = toDayNumber(current);

                    const dayEvents = eventMap.get(currentDay) ?? [];

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
                            }}>
                                {day}
                            </span>

                            {dayEvents.map(e => (
                                <div
                                    key={e.calendarId}
                                    onClick={() => onEventClick?.(e.calendarId)}
                                    style={{
                                        fontSize: "12px",
                                        background: e.isStart ? (e.color ?? "transparent") : "transparent",
                                        color: "#091B72",
                                        padding: "4px 4px",
                                        marginTop: "4px",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        fontWeight: "500",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    <span style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: e.dotColor ?? "#aaa",
                                        flexShrink: 0
                                    }} />
                                    {e.calendarCategoryName}
                                </div>
                            ))}
                        </div>
                    );
                })}

                {nextMonthDays.map((_, i) => (
                    <div className="calendar-EmptyDate" key={`next-${i}`} />
                ))}

            </div>
        </div>
    );
};

export default Calendar;