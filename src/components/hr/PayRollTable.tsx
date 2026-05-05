import "../../assets/styles/hr/hrPage.css";

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

const columns: Array<{ key: ColumnKey; label: string;align?: "left" | "center" | "right"; }> = [
    { key: "yearMonth", label: "일자", align:"center" },
    { key: "ledgerName", label: "대장명" },
    { key: "payDate", label: "지급일" , align:"center"},
    { key: "employeeCount", label: "인원 수" , align:"center"},
    { key: "totalAmount", label: "총 금액", align:"right" },
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
        <table className="common-Table" style={{marginTop:"5px"}}>
            <thead>
                <tr>
                    <th>
                        <label>
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
                        <th key={column.key}>
                            {column.label}
                        </th>
                    ))}

                    <th>링크</th>
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
                            <td style={{textAlign:"center"}}>
                                <label >
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
                                    style={{textAlign: column.align}}
                                    key={`${item.id}-${column.key}`}
                                >
                                    {column.key === "ledgerName" ? (
                                        <button
                                            style={{fontSize:"12px"}}
                                            type="button"
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

                            <td style={{width:"18%", whiteSpace:"nowrap"}} >
                                <div >
                                    <div style={{ display:"flex" ,width:"100%", justifyContent:"space-between"}}>
                                        <button
                                            className="btn-sc"
                                            type="button"
                                            onClick={() => handleAction("view", item.id)}
                                        >
                                            조회
                                        </button>
                                        <button
                                            className="btn-sc"
                                            type="button"
                                            onClick={() => handleAction("edit", item.id)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="btn-sc"
                                            type="button"
                                            onClick={() =>
                                                handleAction("cancelConfirm", item.id)
                                            }
                                        >
                                            확정취소
                                        </button>
                                        <button
                                            className="btn-sc"
                                            type="button"
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
