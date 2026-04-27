import Modal from "../../components/Modal.tsx";
import {Editor} from "@toast-ui/react-editor";
import ConfirmModal from "../../components/ConfirmModal.tsx";
import {useEffect, useRef, useState} from "react";
import DatePicker from "react-datepicker";
import {ko} from "date-fns/locale";
import {MdCalendarMonth} from "react-icons/md";
import {
    getCalendarApi,
    getCategoriesApi,
    getMembersApi,
    saveCalendarApi,
    updateCalendarApi,
} from "../../apis/CalendarService.tsx";
import {useQuery} from "@tanstack/react-query";
import type {CalendarCategory, CalendarEvent, CalendarMember} from "../../types/calendar.ts";
import TagInput from "../../components/input/TagInput.tsx";
import CalendarMemberModal from "./CalendarMemberModal.tsx";

interface CalendarWriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendarId?: number | null;
    onSuccess?: () => void;
}

interface CalendarForm {
    eventStartDate: string;
    eventStartHour: string;
    eventStartMin: string;
    eventEndDate: string;
    eventEndHour: string;
    eventEndMin: string;
    title: string;
    calendarCategoryId: number | null;
    type: string;
    alarm: boolean;
    file: File | null;
    existingFile: string | null;
    sharedUserIds: number[];
    content: string;
}

const CalendarWriteModal = ({isOpen, onClose, calendarId, onSuccess}: CalendarWriteModalProps) => {

    const isEditMode = calendarId != null;

    const [form, setForm] = useState<CalendarForm>({
        eventStartDate: new Date().toLocaleDateString("en-CA"),
        eventStartHour: "09",
        eventStartMin: "00",
        eventEndHour: "10",
        eventEndMin: "00",
        eventEndDate: new Date().toLocaleDateString("en-CA"),
        title: "",
        calendarCategoryId: null,
        type: "",
        alarm: false,
        file: null,
        existingFile: null,
        sharedUserIds: [],
        content: "",
    });
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
    const [startDate, endDate] = dateRange;
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const editorRef = useRef<Editor>(null);
    const isDirtyRef = useRef(false);
    const isInitializing = useRef(false);
    const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, "0"));
    const mins = ["00", "10", "20", "30", "40", "50"];

    const {data: categories = []} = useQuery<CalendarCategory[]>({
        queryKey: ["calendarCategories"],
        queryFn: getCategoriesApi
    });

    const { data: calendar, refetch } = useQuery<CalendarEvent>({
        queryKey: ["calendar", calendarId],
        queryFn: () => getCalendarApi(calendarId!),
        enabled: false,
    });

    const {data: members = []} = useQuery<CalendarMember[]>({
        queryKey: ["calendarMembers"],
        queryFn: getMembersApi,
    });
    useEffect(() => {
        if (!isOpen) return;

        if (calendarId == null) {
            isDirtyRef.current = false;
            isInitializing.current = false;
            return;
        }
        void refetch();
    }, [isOpen, calendarId, refetch]);

    useEffect(() => {
        if (! calendar || !isOpen) return;

        const load = async () => {
            isInitializing.current = true;

            setForm({
                title: calendar.eventTitle,
                content: calendar.eventContent ?? "",

                calendarCategoryId: calendar.calendarCategoryId ?? null,
                type: calendar.type ?? "",

                alarm: !!calendar.alarm,
                sharedUserIds: calendar.sharedUserIds ?? [],

                existingFile: calendar.file ?? null,
                file: null,

                eventStartDate: calendar.eventStartDate.slice(0, 10),
                eventEndDate: calendar.eventEndDate.slice(0, 10),

                eventStartHour: calendar.eventStartDate.slice(11, 13),
                eventStartMin: calendar.eventStartDate.slice(14, 16),

                eventEndHour: calendar.eventEndDate.slice(11, 13),
                eventEndMin: calendar.eventEndDate.slice(14, 16),
            });

            requestAnimationFrame(() => {
                editorRef.current?.getInstance().setMarkdown( calendar.eventContent ?? "");
                isInitializing.current = false;
            });
        };
        void load();
    }, [ calendar, isOpen]);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };


    const handleChange = <K extends keyof CalendarForm>(key: K, value: CalendarForm[K]) => {
        if (!isInitializing.current) {
            isDirtyRef.current = true;
        }
        setForm((prev) => ({...prev, [key]: value}));
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!form.eventStartDate) {
            alert("날짜를 선택해주세요.");
            return;
        }
        if (!form.type) { alert("캘린더를 선택해주세요."); return; }
        if (!form.calendarCategoryId) { alert("일정구분을 선택해주세요."); return; }
        if (form.type === "공유" && form.sharedUserIds.length === 0) { alert("공유자를 선택해주세요."); return; }

        try {
            const request = {
                type: form.type,
                calendarCategoryId: form.calendarCategoryId,
                eventStartDate: `${form.eventStartDate}T${form.eventStartHour}:${form.eventStartMin}:00`,
                eventEndDate: `${form.eventEndDate}T${form.eventEndHour}:${form.eventEndMin}:00`,
                eventTitle: form.title,
                eventContent: form.content,
                alarm: form.alarm ? 10 : null,
                sharedUserIds: form.sharedUserIds
            };

            const formData = new FormData();
            //@RequestPart 사용할 때
            formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
            if (form.file) {
                formData.append("file", form.file);
            }

            if (isEditMode) {
                await updateCalendarApi(calendarId!, formData);
            } else {
                await saveCalendarApi(formData);
            }

            onSuccess?.();
            handleClose();
        } catch {
            console.error("저장 실패");
        }
    };

    const handleClose = () => {
        isInitializing.current = true;
        setDateRange([new Date(), new Date()]);
        setForm({
            eventStartDate: new Date().toLocaleDateString("en-CA"),
            eventEndDate: new Date().toLocaleDateString("en-CA"),
            eventStartHour: "09",
            eventStartMin: "00",
            eventEndHour: "10",
            eventEndMin: "00",
            title: "",
            calendarCategoryId: null,
            type: "공유",
            alarm: false,
            file: null,
            existingFile: null,
            sharedUserIds: [],
            content: "",
        });
        editorRef.current?.getInstance().setMarkdown("");
        isDirtyRef.current = false;
        onClose();
    };

    const handleCloseAttempt = () => {
        if (isDirtyRef.current) {
            setIsExitConfirmOpen(true);
        } else {
            handleClose();
        }
    };

    return (
        <>
            <Modal
                title={isEditMode ? "일정관리 수정" : "일정관리 등록"}
                isOpen={isOpen}
                onClose={handleCloseAttempt}
                footer={
                    <div className="btn-Wrap">
                        <button className="btn-Primary" onClick={handleSave}>저장</button>
                        <button className="btn-Secondary" onClick={handleCloseAttempt}>취소</button>
                    </div>
                }
            >
                <div className="Write-Wrapper">
                    <div className="modal-Row">
                        <label>날짜 / 시간</label>
                        <div style={{display: "flex", alignItems: "center", gap: "8px",width:"100%"}}>
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(dates) => {
                                    setDateRange(dates);
                                    const [start, end] = dates;
                                    if (start) handleChange("eventStartDate", formatDate(start));
                                    if (end) handleChange("eventEndDate", formatDate(end));
                                    else handleChange("eventEndDate", "");
                                }}
                                locale={ko}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="날짜 선택"
                                dateFormatCalendar="yyyy년 MM월"
                                showIcon={true}
                                icon={<MdCalendarMonth color="#cdcdcd"/>}
                                portalId="root"
                            />
                            <select value={form.eventStartHour} onChange={e => handleChange("eventStartHour", e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <span>:</span>
                            <select value={form.eventStartMin} onChange={e => handleChange("eventStartMin", e.target.value)}>
                                {mins.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <span>-</span>
                            <select value={form.eventEndHour} onChange={e => handleChange("eventEndHour", e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <span>:</span>
                            <select value={form.eventEndMin} onChange={e => handleChange("eventEndMin", e.target.value)}>
                                {mins.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="modal-Row">
                        <label>제목</label>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                        />
                    </div>

                    <div className="modal-Row">
                        <div className="modal-Row-Group">
                            <div className="modal-Row-Item">
                                <label>캘린더</label>
                                <select value={form.type} onChange={e => handleChange("type", e.target.value)}>
                                    <option value="" hidden>선택</option>
                                    <option value="공유">공유일정캘린더</option>
                                    <option value="개인">개인일정캘린더</option>
                                </select>
                            </div>
                            <div className="modal-Row-Item">
                                <label>일정구분</label>
                                <select
                                    value={form.calendarCategoryId ?? ""}
                                    onChange={e => handleChange("calendarCategoryId", Number(e.target.value))}
                                >
                                    <option value="" hidden>선택</option>
                                    {categories
                                        .filter(c => {
                                            return !(form.type === "공유" && c.calendarCategoryName === "개인");
                                        })
                                        .map(c => (
                                        <option key={c.calendarCategoryId} value={c.calendarCategoryId}>
                                            {c.calendarCategoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-Row">
                        <label>공유자</label>
                        <TagInput
                            selectedIds={form.sharedUserIds}
                            members={members}
                            onRemove={(id) => handleChange("sharedUserIds", form.sharedUserIds.filter(v => v !== id))}
                            onClear={() => {
                                handleChange("sharedUserIds", []);
                                setIsMemberModalOpen(false);
                            }}
                            onClick={() => setIsMemberModalOpen(true)}
                            disabled={form.type === "개인"}
                            placeholder="성명"
                        />
                    </div>
                    <div className="modal-Row">
                        <label>일정알림</label>
                        <input
                            type="checkbox"
                            checked={form.alarm}
                            onChange={(e) => handleChange("alarm", e.target.checked)}
                        />
                        <p style={{fontSize: "12px", color: "#151515", marginLeft: "3px"}}>사용</p>
                    </div>
                    <div className="modal-Row">
                        <label>첨부</label>
                        <div className="file-Input-Container">
                            {(form.existingFile || form.file) && (
                                <div className="file-Name">
                                    <span className="file-name-accent">파일</span>
                                    <span className="file-Path">
                                        {form.file
                                            ? `${form.file.name} (${(form.file.size / 1024).toFixed(1)}KB)`
                                            : form.existingFile!.substring(form.existingFile!.indexOf("_") + 1)
                                        }
                                    </span>
                                </div>
                            )}
                            <div
                                className="file-Input-wrapper"
                                onClick={() => document.getElementById("calFileInput")?.click()}
                            >
                                <span>+</span>
                                <input
                                    id="calFileInput"
                                    type="file"
                                    style={{display: "none"}}
                                    onChange={(e) => {
                                        handleChange("file", e.target.files?.[0] ?? null);
                                        handleChange("existingFile", null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="Write-Editor" style={{marginTop: "13px"}}>
                        <Editor
                            ref={editorRef}
                            initialValue=" "
                            previewStyle="vertical"
                            height="100%"
                            initialEditType="wysiwyg"
                            onFocus={() => { isInitializing.current = false; }}
                            onChange={() => {
                                if (isInitializing.current) return;
                                const value = editorRef.current?.getInstance().getMarkdown() ?? "";
                                setForm((prev) => ({...prev, content: value}));
                                isDirtyRef.current = true;
                            }}
                        />
                    </div>
                </div>
            </Modal>
            <CalendarMemberModal
                key={JSON.stringify(form.sharedUserIds)}
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                selectedIds={form.sharedUserIds}
                onApply={(ids) => handleChange("sharedUserIds", ids)}
            />
            <ConfirmModal
                isOpen={isExitConfirmOpen}
                message="작성 중인 내용이 있습니다. 나가시겠습니까?"
                onConfirm={() => {
                    setIsExitConfirmOpen(false);
                    handleClose();
                }}
                onClose={() => setIsExitConfirmOpen(false)}
            />
        </>
    );
};

export default CalendarWriteModal;