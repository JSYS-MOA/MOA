import {IoCloseOutline} from "react-icons/io5";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {CalendarMember} from "../../types/calendar.ts";
import {getMembersApi} from "../../apis/CalendarService.tsx";

interface CalendarMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: number[];
    onApply: (ids: number[]) => void;
}

const CalendarMemberModal = ({isOpen, onClose, selectedIds, onApply}: CalendarMemberModalProps) => {

    const [checked, setChecked] = useState<number[]>(selectedIds);

    const {data: members = []} = useQuery<CalendarMember[]>({
        queryKey: ["calendarMembers"],
        queryFn: getMembersApi,
        enabled: isOpen,
    });

    if (!isOpen) return null;

    // 부서별 그룹
    //배열.reduce((누적값, 현재값) => { return 누적값;}, 초기값);
    const grouped = members.reduce<Record<string, CalendarMember[]>>((acc, m) => {
        const dept = m.departmentName ?? "기타";
        if (!acc[dept]) acc[dept] = []; //acc에 해당 부서키가 없으면 빈 배열로 초기화
        acc[dept].push(m);
        return acc;
    }, {});

    const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked ? members.map(m => m.userId) : []);
    };

    const toggleOne = (userId: number) => {
        setChecked(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
            //checked배열에 클릭한 userId가 있는지 확인하고 있으면 제거, 없으면 추가
        );
    };

    const toggleDept = (deptMembers: CalendarMember[], e: React.ChangeEvent<HTMLInputElement>) => {
        const deptIds = deptMembers.map(m => m.userId);
        if (e.target.checked) {
            setChecked(prev => [...new Set([...prev, ...deptIds])]);
        } else {
            setChecked(prev => prev.filter(id => !deptIds.includes(id)));
        }
    };

    const isDeptAllChecked = (deptMembers: CalendarMember[]) =>
        deptMembers.every(m => checked.includes(m.userId));

    return (
        <div className="modal-Overlay">
            <div style={{
                width: "500px",
                height: "560px",
                background: "var(--color-modal)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "0 0 24px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
            }}>
                <div className="modal-Header">
                    <p>공유자</p>
                    <button onClick={onClose}>
                        <IoCloseOutline color="#fff" size={18}/>
                    </button>
                </div>

                <div className="modal-Title">
                    <p>공유자</p>
                </div>

                <div className="modal-Body" >
                    <table className="base-Table">
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={toggleAll}
                                    checked={checked.length === members.length && members.length > 0}
                                />
                            </th>
                            <th>소속부서</th>
                            <th>성명</th>
                            <th>
                                <input type="checkbox" style={{visibility: "hidden"}}/>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Object.entries(grouped) -> 객체를 [key, value ]로 변환*/}
                        {Object.entries(grouped).map(([dept, deptMembers]) =>
                            deptMembers.map((m, idx) => (
                                <tr key={m.userId}>
                                    {idx === 0 && (
                                        <td rowSpan={deptMembers.length} style={{textAlign: "center"}}>
                                            <input
                                                type="checkbox"
                                                checked={isDeptAllChecked(deptMembers)}
                                                onChange={(e) => toggleDept(deptMembers, e)}
                                            />
                                        </td>
                                    )}
                                    {idx === 0 && (
                                        <td rowSpan={deptMembers.length}>{dept}</td>
                                    )}
                                    <td>{m.userName}</td>
                                    <td style={{textAlign: "center"}}>
                                        <input
                                            type="checkbox"
                                            checked={checked.includes(m.userId)}
                                            onChange={() => toggleOne(m.userId)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="modal-Footer">
                    <div className="btn-Wrap">
                        <button className="btn-Primary" onClick={() => { onApply(checked); onClose(); }}>적용</button>
                        <button className="btn-Secondary" onClick={onClose}>취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarMemberModal;