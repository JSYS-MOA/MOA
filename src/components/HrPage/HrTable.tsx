import type { HrTableProps } from "../../types/HrTableProps.ts";
import "../../assets/styles/hr/hrCardList.css";

type HrTableSelectionProps = {
    items: HrTableProps[];
    selectedUserIds: number[];
    onToggleItem: (userId: number) => void;
    onToggleAll: () => void;
};

const columns: Array<{ key: keyof HrTableProps; label: string }> = [
    { key: "startDate", label: "입사일" },
    { key: "employeeId", label: "사원번호" },
    { key: "userName", label: "이름" },
    { key: "departmentName", label: "부서" },
    { key: "gradeName", label: "직급" },
    { key: "phone", label: "연락처" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
];

const formatCellValue = (value: HrTableProps[keyof HrTableProps]) => {
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
}: HrTableSelectionProps) => {
    const allSelected =
        items.length > 0 && items.every((item) => selectedUserIds.includes(item.userId));

    return (
        <table className="hrTable">
            <thead>
                <tr>
                    <th className="hrTable-th hrTable-checkbox-cell">
                        <label className="hrTable-checkbox">
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
                        <th key={String(column.key)} className="hrTable-th">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + 1} className="hrTable-empty">
                            조회된 데이터가 없습니다.
                        </td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={item.userId}>
                            <td className="hrTable-th hrTable-checkbox-cell">
                                <label className="hrTable-checkbox">
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
                                    key={`${item.userId}-${String(column.key)}`}
                                    className="hrTable-td"
                                >
                                    {formatCellValue(item[column.key])}
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
