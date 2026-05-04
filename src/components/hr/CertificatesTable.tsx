import type { HrTableProps } from "../../types/HrTableProps";
import "../../assets/styles/hr/certificatesCardList.css";

type CertificatesTableProps = HrTableProps;

type CertificatesTableViewProps = {
    items: CertificatesTableProps[];
    onSelectItem: (userId: number) => void;
};

type ColumnKey =
    | "employeeId"
    | "userName"
    | "departmentName"
    | "gradeName"
    | "phone"
    | "email"
    | "address";

const columns: Array<{ key: ColumnKey; label: string }> = [
    { key: "employeeId", label: "사번" },
    { key: "userName", label: "이름" },
    { key: "departmentName", label: "부서" },
    { key: "gradeName", label: "직급" },
    { key: "phone", label: "연락처" },
    { key: "email", label: "이메일" },
    { key: "address", label: "주소" },
];

const formatCellValue = (value: CertificatesTableProps[ColumnKey]) => {
    if (Object.prototype.toString.call(value) === "[object Date]") {
        return (value as unknown as Date).toLocaleDateString("ko-KR");
    }

    return value ?? "-";
};

const CertificatesTable = ({
    items,
    onSelectItem,
}: CertificatesTableViewProps) => {
    return (
        <table className="certificatesTable">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={String(column.key)} className="certificatesTable-th">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="certificatesTable-empty">
                            조회된 데이터가 없습니다.
                        </td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={item.userId}>
                            {columns.map((column) => (
                                <td
                                    key={`${item.userId}-${String(column.key)}`}
                                    className="certificatesTable-td"
                                >
                                    {column.key === "userName" ? (
                                        <button
                                            type="button"
                                            className="certificatesTable-nameButton"
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

export default CertificatesTable;
