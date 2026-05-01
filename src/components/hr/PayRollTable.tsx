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

export type PayRollTableAction =
    | "view"
    | "edit"
    | "cancelConfirm"
    | "createVoucher";

type PayRollTableProps = {
    items: PayRollTableRow[];
    selectedLedgerIds: number[];
    onToggleItem: (ledgerId: number) => void;
    onToggleAll: () => void;
    onSelectItem: (ledgerId: number) => void;
    onAction?: (action: PayRollTableAction, ledgerId: number) => void;
};

type ColumnKey =
    | "yearMonth"
    | "ledgerName"
    | "payDate"
    | "employeeCount"
    | "totalAmount"
    | "status";

const columns: Array<{ key: ColumnKey; label: string }> = [
    { key: "yearMonth", label: "일자" },
    { key: "ledgerName", label: "대장명" },
    { key: "payDate", label: "지급일" },
    { key: "employeeCount", label: "인원 수" },
    { key: "totalAmount", label: "총 금액" },
    { key: "status", label: "상태" },
];

const getStatusToneClassName = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase();

    if (
        normalizedStatus.includes("complete") ||
        normalizedStatus.includes("approved") ||
        status.includes("완료") ||
        status.includes("승인") ||
        status.includes("확정")
    ) {
        return "payRollTable-statusValue is-complete";
    }

    if (
        normalizedStatus.includes("pending") ||
        normalizedStatus.includes("progress") ||
        status.includes("대기") ||
        status.includes("진행")
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
    onAction,
}: PayRollTableProps) => {
    const allSelected =
        items.length > 0 && items.every((item) => selectedLedgerIds.includes(item.id));
    const handleAction = (action: PayRollTableAction, ledgerId: number) => {
        if (onAction) {
            onAction(action, ledgerId);
            return;
        }

        if (action === "view") {
            onSelectItem(ledgerId);
        }
    };

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

                    <th className="payRollTable-th">링크</th>
                </tr>
            </thead>

            <tbody>
                {items.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + 2} className="payRollTable-empty">
                            급여 대장 내역이 없습니다.
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

                            <td className="payRollTable-td payRollTable-linkCell">
                                <div className="payRollTable-linkGroup">
                                    <div className="payRollTable-linkActions">
                                        <button
                                            type="button"
                                            className="payRollTable-linkAction"
                                            onClick={() => handleAction("view", item.id)}
                                        >
                                            조회
                                        </button>
                                        <button
                                            type="button"
                                            className="payRollTable-linkAction"
                                            onClick={() => handleAction("edit", item.id)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            type="button"
                                            className="payRollTable-linkAction"
                                            onClick={() =>
                                                handleAction("cancelConfirm", item.id)
                                            }
                                        >
                                            확정취소
                                        </button>
                                        <button
                                            type="button"
                                            className="payRollTable-linkAction"
                                            onClick={() =>
                                                handleAction("createVoucher", item.id)
                                            }
                                        >
                                            전표생성
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default PayRollTable;
