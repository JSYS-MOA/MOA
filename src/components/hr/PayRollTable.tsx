import "../../assets/styles/hr/payRollList.css";

export type PayRollTableRow = {
    id: number;
    yearMonth: string;
    ledgerName: string;
    payDate: string;
    employeeCount: number;
    totalAmount: string;
    status: string;
};

type PayRollTableProps = {
    items: PayRollTableRow[];
    selectedLedgerIds: number[];
    onToggleItem: (ledgerId: number) => void;
    onToggleAll: () => void;
    onSelectItem: (ledgerId: number) => void;
};

type ColumnKey =
    | "yearMonth"
    | "ledgerName"
    | "payDate"
    | "employeeCount"
    | "totalAmount"
    | "status";

const columns: Array<{ key: ColumnKey; label: string }> = [
    { key: "yearMonth", label: "Month" },
    { key: "ledgerName", label: "Ledger" },
    { key: "payDate", label: "Pay Date" },
    { key: "employeeCount", label: "Employees" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "status", label: "Status" },
];

const getStatusToneClassName = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase();

    if (
        normalizedStatus.includes("complete") ||
        normalizedStatus.includes("approved")
    ) {
        return "payRollTable-statusValue is-complete";
    }

    if (
        normalizedStatus.includes("pending") ||
        normalizedStatus.includes("progress")
    ) {
        return "payRollTable-statusValue is-pending";
    }

    return "payRollTable-statusValue is-default";
};

const PayRollTable = ({
    items,
    selectedLedgerIds,
    onToggleItem,
    onToggleAll,
    onSelectItem,
}: PayRollTableProps) => {
    const allSelected =
        items.length > 0 && items.every((item) => selectedLedgerIds.includes(item.id));

    return (
        <table className="payRollTable">
            <thead>
                <tr>
                    <th className="payRollTable-th payRollTable-checkbox-cell">
                        <label className="payRollTable-checkbox">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={onToggleAll}
                                aria-label="Select all ledgers"
                            />
                            <span className="checkmark" />
                        </label>
                    </th>

                    {columns.map((column) => (
                        <th key={column.key} className="payRollTable-th">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + 1} className="payRollTable-empty">
                            No payroll ledgers found.
                        </td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={item.id}>
                            <td className="payRollTable-td payRollTable-checkbox-cell">
                                <label className="payRollTable-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedLedgerIds.includes(item.id)}
                                        onChange={() => onToggleItem(item.id)}
                                        aria-label={`Select ${item.ledgerName}`}
                                    />
                                    <span className="checkmark" />
                                </label>
                            </td>

                            {columns.map((column) => (
                                <td
                                    key={`${item.id}-${column.key}`}
                                    className="payRollTable-td"
                                >
                                    {column.key === "ledgerName" ? (
                                        <button
                                            type="button"
                                            className="payRollTable-nameButton"
                                            onClick={() => onSelectItem(item.id)}
                                        >
                                            {item[column.key]}
                                        </button>
                                    ) : column.key === "status" ? (
                                        <span className={getStatusToneClassName(item.status)}>
                                            {item.status}
                                        </span>
                                    ) : (
                                        item[column.key]
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

export default PayRollTable;
