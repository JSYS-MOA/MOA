import type { HrTableProps } from "../../types/HrTableProps";
import "../../assets/styles/hr/hrCardList.css";

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

const columns: Array<{ key: ColumnKey; label: string }> = [
    { key: "startDate", label: "입사일" },
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
        <table className="hrCardTable">
            <thead>
            <tr>
                <th className="hrCardTable-th hrCardTable-checkbox-cell">
                    <label className="hrCardTable-checkbox">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleAll}
                            aria-label="전체 선택"
                        />
                        <span className="checkmark"></span>
                    </label>
                </th>

                {columns.map((column) => (
                    <th key={column.key} className="hrCardTable-th">
                        {column.label}
                    </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {items.length === 0 ? (
                <tr>
                    <td colSpan={columns.length + 1} className="hrCardTable-empty">
                        조회된 인사카드가 없습니다.
                    </td>
                </tr>
            ) : (
                items.map((item) => (
                    <tr key={item.userId}>
                        <td className="hrCardTable-th hrCardTable-checkbox-cell">
                            <label className="hrCardTable-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(item.userId)}
                                    onChange={() => onToggleItem(item.userId)}
                                    aria-label={`${item.userName} 선택`}
                                />
                                <span className="checkmark"></span>
                            </label>
                        </td>

                        {columns.map((column) => (
                            <td
                                key={`${item.userId}-${column.key}`}
                                className="hrCardTable-td"
                            >
                                {column.key === "userName" ? (
                                    <button
                                        type="button"
                                        className="hrCardTable-nameButton"
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
