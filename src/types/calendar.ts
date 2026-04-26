export interface CalendarEvent {
    calendarId: number;
    writer: number;
    type: string;
    calendarCategoryId: number | null;
    calendarCategoryName: string | null;
    eventStartDate: string;
    eventEndDate: string;
    eventTitle: string;
    eventContent: string | null;
    file: string | null;
    alarm: number | null;
    color?: string;
    dotColor?: string;
}

export interface CalendarCategory {
    calendarCategoryId: number;
    calendarCategoryName: string;
}

export interface CalendarMember {
    userId: number;
    userName: string;
}