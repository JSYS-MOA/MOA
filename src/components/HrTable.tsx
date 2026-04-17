import type { HrTableProps } from "../types/HrTableProps";

type HrTableSelectionProps = {
    items: HrTableProps[];
    selectedUserIds: number[];
    onToggleItem: (userId: number) => void;
    onToggleAll: () => void;
};

const HrTable = ({
    items,
    selectedUserIds,
    onToggleItem,
    onToggleAll,
}: HrTableSelectionProps) => {
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

    const allSelected =
        items.length > 0 && items.every((item) => selectedUserIds.includes(item.userId));

    return (
        <table
            style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ccc",
                marginTop: "12px",
            }}
        >
            <thead>
                <tr>
                    <th
                        style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            backgroundColor: "#f5f5f5",
                            width: "44px",
                        }}
                    >
                        <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
                    </th>

                    {columns.map((col) => (
                        <th
                            key={String(col.key)}
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td
                            colSpan={columns.length + 1}
                            style={{
                                border: "1px solid #ccc",
                                padding: "12px",
                                textAlign: "center",
                            }}
                        >
                            조회된 데이터가 없습니다.
                        </td>
                    </tr>
                ) : (
                    items.map((item, index) => (
                        <tr key={`${item.userId}-${item.employeeId ?? "no-employee"}-${index}`}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "center",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(item.userId)}
                                    onChange={() => onToggleItem(item.userId)}
                                />
                            </td>

                            {columns.map((col) => {
                                const value = item[col.key];

                                return (
                                    <td
                                        key={`${item.userId}-${String(col.key)}`}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {value instanceof Date
                                            ? value.toLocaleDateString()
                                            : value ?? "-"}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default HrTable;
