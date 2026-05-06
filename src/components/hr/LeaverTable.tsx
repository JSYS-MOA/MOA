import "../../assets/styles/hr/leaverCardList.css";
import type {HrTableProps} from "../../types/HrTableProps.ts";

type LeaverTableProps = HrTableProps;

type LeaverTableSelectionProps = {
    items: LeaverTableProps[];
    selectedUserIds: number[];
    onToggleItem: (userId: number) => void;
    onToggleAll: () => void;
    onSelectItem: (userId: number) => void;
};

const columns: Array<{ key: keyof LeaverTableProps; label: string;  align?: "left" | "center" | "right"; }> = [
    { key: "startDate", label: "입사일" , align:"center"},
    { key: "quitDate", label: "퇴사일" , align:"center"},
    { key: "employeeId", label: "사원번호" },
    { key: "userName", label: "이름" , align:"center"},
    { key: "departmentName", label: "부서", align:"center" },
    { key: "gradeName", label: "직급" , align:"center"},
    { key: "phone", label: "연락처" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
];

const formatCellValue = (value: LeaverTableProps[keyof LeaverTableProps]) => {
    if (value instanceof Date) {
        return value.toLocaleDateString("ko-KR");
    }

    return value ?? "-";
};

const LeaverTable = ({
                         items,
                         selectedUserIds,
                         onToggleItem,
                         onToggleAll,
                         onSelectItem,
                     }: LeaverTableSelectionProps) => {
    const allSelected =
        items.length > 0 && items.every((item) => selectedUserIds.includes(item.userId));

    return (
        <table className="common-Table" style={{marginTop:"5px"}}>
            <thead>
            <tr>
                <th >
                    <label>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleAll}
                            aria-label="전체 선택"
                        />
                        <span className="checkmark" />
                    </label>
                </th>

                {columns.map((column) => (
                    <th key={String(column.key)}>
                        {column.label}
                    </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {items.length === 0 ? (
                <tr>
                    <td colSpan={columns.length + 1} className="leaverTable-empty">
                        조회된 데이터가 없습니다.
                    </td>
                </tr>
            ) : (
                items.map((item) => (
                    <tr key={item.userId}>
                        <td style={{textAlign:"center"}} >
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(item.userId)}
                                    onChange={() => onToggleItem(item.userId)}
                                    aria-label={`${item.userName} 선택`}
                                />
                                <span className="checkmark" />
                            </label>
                        </td>

                        {columns.map((column) => (
                            <td
                                key={`${item.userId}-${String(column.key)}`}
                                style={{textAlign: column.align}}
                            >
                                {column.key === "userName" ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelectItem(item.userId)}
                                    >
                                        {formatCellValue(item[column.key])}
                                    </button>
                                ) : (
                                    formatCellValue(item[column.key])
                                )}
                            </td>
                        ))}
                    </tr>
                ))
            )}
            </tbody>
        </table>
    );
};

export default LeaverTable;
