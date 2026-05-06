import type { HrTableProps } from "../../types/HrTableProps";
import "../../assets/styles/hr/hrPage.css";

type HrTableSelectionProps = {
    items: HrTableProps[];
    selectedUserIds: number[];
    onToggleItem: (userId: number) => void;
    onToggleAll: () => void;
    onSelectItem: (userId: number) => void;
};

type ColumnKey =
    | "startDate"
    | "employeeId"
    | "userName"
    | "departmentName"
    | "gradeName"
    | "phone"
    | "email"
    | "address";


const columns: Array<{ key: ColumnKey; label: string; align?: "left" | "center" | "right"; }> = [
    { key: "startDate", label: "입사일" , align:"center"},
    { key: "employeeId", label: "사원번호" },
    { key: "userName", label: "이름" },
    { key: "departmentName", label: "부서" },
    { key: "gradeName", label: "직급" },
    { key: "phone", label: "연락처" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
];

const formatCellValue = (value: HrTableProps[ColumnKey]) => {
    if (value instanceof Date) {
        return value.toLocaleDateString("ko-KR");
    }

    return value ?? "-";
};

const HrTable = ({
                     items,
                     selectedUserIds,
                     onToggleItem,
                     onToggleAll,
                     onSelectItem,
                 }: HrTableSelectionProps) => {
    const allSelected =
        items.length > 0 && items.every((item) => selectedUserIds.includes(item.userId));

    return (
        <table className="common-Table" style={{marginTop:"5px"}}>
            <thead>
            <tr>
                <th>
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onToggleAll}
                        aria-label="전체 선택"
                    />
                </th>

                {columns.map((column) => (
                    <th key={column.key}>
                        {column.label}
                    </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {items.length === 0 ? (
                <tr>
                    <td colSpan={columns.length + 1}>
                        조회된 인사카드가 없습니다.
                    </td>
                </tr>
            ) : (
                items.map((item) => (
                    <tr key={item.userId}>
                        <td style={{textAlign:"center"}} >
                            <input
                                type="checkbox"
                                checked={selectedUserIds.includes(item.userId)}
                                onChange={() => onToggleItem(item.userId)}
                                aria-label={`${item.userName} 선택`}
                            />
                        </td>

                        {columns.map((column) => (
                            <td
                                key={`${item.userId}-${column.key}`}
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

export default HrTable;
