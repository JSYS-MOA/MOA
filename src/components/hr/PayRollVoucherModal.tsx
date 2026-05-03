import { useMemo, useState } from "react";
import {
    type PayRollRecord,
    useDeletePayRoll,
} from "../../apis/hr/PayLollService.tsx";
import "../../assets/styles/hr/payRollVoucherModal.css";
import ConfirmModal from "../ConfirmModal.tsx";
import Modal from "../Modal.tsx";
import Table, { type TableColumn } from "../Table.tsx";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onDeleted?: () => void | Promise<void>;
    payrollLabel?: string;
    records: PayRollRecord[];
};

type LoosePayRoll = PayRollRecord & Record<string, unknown>;

type PayrollRow = {
    id: number;
    employeeId: string;
    userName: string;
    basePay: number | null;
    overtimeAllowance: number | null;
    weekendAllowance: number | null;
    annualAllowance: number | null;
    totalAmount: number | null;
};

const getStringValue = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }

    return "";
};

const getNumberValue = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value.replaceAll(",", ""));

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return null;
};

const parseCompactDate = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
        return "";
    }

    const digits = String(value).replace(/\D/g, "");

    if (digits.length < 6) {
        return "";
    }

    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}`;
};

const getPayrollMonth = (records: PayRollRecord[], payrollLabel?: string) => {
    const labelMatch = payrollLabel?.match(/(\d{4})[/-](\d{1,2})/);

    if (labelMatch) {
        return `${labelMatch[1]}/${labelMatch[2].padStart(2, "0")}`;
    }

    const firstRecord = records[0] as LoosePayRoll | undefined;

    if (!firstRecord) {
        return "";
    }

    const salaryDate = parseCompactDate(
        getStringValue(firstRecord, "salaryDate", "salary_date")
    );

    if (salaryDate) {
        return salaryDate;
    }

    const createdAt = getStringValue(
        firstRecord,
        "createdAt",
        "created_at",
        "transaction_created_at",
        "salary_ledger_created_at",
        "salary_created_at"
    );

    return createdAt ? createdAt.slice(0, 7).replace("-", "/") : "";
};

const isSummaryRecord = (record: LoosePayRoll) => {
    const transactionType = getStringValue(record, "transactionType", "transaction_type");
    const transactionMemo = getStringValue(record, "transactionMemo", "transaction_memo");

    return transactionType.includes("총합") || transactionMemo.includes("총합");
};

const toPayrollRows = (records: PayRollRecord[]): PayrollRow[] =>
    records
        .filter((record) => !isSummaryRecord(record as LoosePayRoll))
        .map((record, index) => {
            const item = record as LoosePayRoll;
            const id =
                getNumberValue(item, "transactionId", "transaction_id") ??
                getNumberValue(item, "salaryLedgerId", "salary_ledger_id") ??
                getNumberValue(item, "salaryId", "salary_id") ??
                index + 1;
            const basePay = getNumberValue(item, "basePay", "base_pay");
            const overtimeAllowance = getNumberValue(
                item,
                "overtimeAllowance",
                "overtime_allowance",
                "nightAllowance",
                "night_allowance",
                "nightWorkAllowance",
                "night_work_allowance"
            );
            const weekendAllowance = getNumberValue(
                item,
                "weekendAllowance",
                "weekend_allowance",
                "weekendWorkAllowance",
                "weekend_work_allowance"
            );
            const annualAllowance = getNumberValue(
                item,
                "annualAllowance",
                "annual_allowance",
                "annualLeaveAllowance",
                "annual_leave_allowance"
            );
            const totalAmount =
                getNumberValue(item, "salaryAmount", "salary_amount", "transactionPrice", "transaction_price") ??
                (basePay ?? 0) +
                    (overtimeAllowance ?? 0) +
                    (weekendAllowance ?? 0) +
                    (annualAllowance ?? 0);

            return {
                id,
                employeeId: getStringValue(item, "employeeId", "employee_id") || "-",
                userName: getStringValue(item, "userName", "user_name") || "-",
                basePay,
                overtimeAllowance,
                weekendAllowance,
                annualAllowance,
                totalAmount,
            };
        });

const formatAmount = (value: number | null) =>
    value === null ? "-" : value.toLocaleString("ko-KR");

const PayRollVoucherModal = ({
    isOpen,
    onClose,
    onDeleted,
    payrollLabel,
    records,
}: Props) => {
    const deletePayRoll = useDeletePayRoll();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const rows = useMemo(() => toPayrollRows(records), [records]);
    const payrollMonth = useMemo(
        () => getPayrollMonth(records, payrollLabel),
        [payrollLabel, records]
    );
    const resolvedPayrollLabel = payrollLabel?.trim() || (payrollMonth ? `${payrollMonth} 급여` : "급여");

    const columns: TableColumn<PayrollRow>[] = [
        { key: "employeeId", label: "사원번호", align: "center" },
        { key: "userName", label: "성명", align: "center" },
        {
            key: "basePay",
            label: "기본급",
            align: "right",
            render: (value) => formatAmount(value),
        },
        {
            key: "overtimeAllowance",
            label: "야근수당",
            align: "right",
            render: (value) => formatAmount(value),
        },
        {
            key: "weekendAllowance",
            label: "주말근무수당",
            align: "right",
            render: (value) => formatAmount(value),
        },
        {
            key: "annualAllowance",
            label: "연차수당",
            align: "right",
            render: (value) => formatAmount(value),
        },
        {
            key: "totalAmount",
            label: "지급총액",
            align: "right",
            render: (value) => formatAmount(value),
        },
    ];

    const handleClose = () => {
        if (isDeleting) {
            return;
        }

        setIsConfirmOpen(false);
        setSelectedIds([]);
        onClose();
    };

    const handleCheck = (
        idOrIds: number | number[],
        checked: boolean,
        isAll?: boolean
    ) => {
        if (isAll && Array.isArray(idOrIds)) {
            setSelectedIds(checked ? idOrIds : []);
            return;
        }

        const id = Number(idOrIds);

        setSelectedIds((prev) =>
            checked
                ? Array.from(new Set([...prev, id]))
                : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) {
            window.alert("삭제할 급여 내역을 선택해 주세요.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            for (const targetId of selectedIds) {
                await deletePayRoll.mutateAsync(targetId);
            }

            await onDeleted?.();
            setSelectedIds([]);
            setIsConfirmOpen(false);
            onClose();
            window.alert("삭제되었습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "삭제 처리 중 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="payRollVoucherModalScope">
                <Modal
                    title="급여작업"
                    isOpen={isOpen}
                    onClose={handleClose}
                    footer={
                        <div className="payRollVoucherModal-actions">
                            <button
                                type="button"
                                className="payRollVoucherModal-button payRollVoucherModal-button--primary"
                                onClick={handleClose}
                                disabled={isDeleting}
                            >
                                저장
                            </button>
                            <button
                                type="button"
                                className="payRollVoucherModal-button payRollVoucherModal-button--secondary"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </button>
                            <button
                                type="button"
                                className="payRollVoucherModal-button payRollVoucherModal-button--secondary"
                                onClick={handleClose}
                                disabled={isDeleting}
                            >
                                취소
                            </button>
                        </div>
                    }
                >
                    <div className="payRollVoucherModal-panel">
                        <h2 className="payRollVoucherModal-heading">급여내역수정</h2>

                        <div className="payRollVoucherModal-fields" aria-readonly="true">
                            <div className="payRollVoucherModal-field">
                                <label>일자</label>
                                <input value={payrollMonth} readOnly tabIndex={-1} />
                            </div>
                            <div className="payRollVoucherModal-field">
                                <label>급여대장명칭</label>
                                <input value={resolvedPayrollLabel} readOnly tabIndex={-1} />
                            </div>
                        </div>

                        <div className="payRollVoucherModal-tableWrap">
                            <Table
                                items={rows}
                                idKey="id"
                                columns={columns}
                                className="payRollVoucherModal-table"
                                showCheckbox
                                selectedIds={selectedIds}
                                onCheck={handleCheck}
                            />
                        </div>
                    </div>
                </Modal>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                message={`선택한 급여 ${selectedIds.length}건을 삭제하시겠습니까?`}
                onConfirm={handleConfirmDelete}
                onClose={() => {
                    if (!isDeleting) {
                        setIsConfirmOpen(false);
                    }
                }}
            />
        </>
    );
};

export default PayRollVoucherModal;
