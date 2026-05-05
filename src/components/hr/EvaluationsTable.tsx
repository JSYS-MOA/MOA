import "../../assets/styles/hr/hrPage.css";
import type {HrTableProps} from "../../types/HrTableProps.ts";

type EvaluationsTableProps = HrTableProps;

type EvaluationsTableViewProps = {
    items: HrTableProps[];
    onSelectItem: (userId: number) => void;
};

const columns: Array<{ key: keyof EvaluationsTableProps; label: string }> = [
    { key: "employeeId", label: "사원번호" },
    { key: "userName", label: "이름" },
    { key: "departmentName", label: "부서" },
    { key: "gradeName", label: "직급" },
    { key: "performance",label: "인사평가"}
];

const formatCellValue = (value: EvaluationsTableProps[keyof EvaluationsTableProps]) => {
    if (value instanceof Date) {
        return value.toLocaleDateString("ko-KR");
    }

    return value ?? "-";
};

const EvaluationsTable = ({
    items,
    onSelectItem,
}: EvaluationsTableViewProps) => {
    return (
        <table className="common-Table" style={{marginTop:"5px"}}>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={String(column.key)} className="evaluationsTable-th">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="evaluationsTable-empty">
                            조회된 데이터가 없습니다.
                        </td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={item.userId}>
                            {columns.map((column) => (
                                <td
                                    key={`${item.userId}-${String(column.key)}`}
                                >
                                    {column.key === "userName" ? (
                                        <button
                                            type="button"
                                            className="evaluationsTable-nameButton"
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

export default EvaluationsTable;
