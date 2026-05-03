import { useMemo } from "react";
import type { PayRollRecord } from "../../apis/hr/PayLollService.tsx";
import "../../assets/styles/hr/payRollInfoModal.css";
import Modal from "../Modal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    payrollLabel?: string;
    records?: PayRollRecord[];
};

type LoosePayRollRecord = PayRollRecord & Record<string, unknown>;

type PayRollDetailRow = {
    key: string;
    departmentName: string;
    userName: string;
    employeeId: string;
    gradeName: string;
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

const parseCompactDate = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
        return undefined;
    }

    const digits = String(value).replace(/\D/g, "");

    if (digits.length !== 8) {
        return undefined;
    }

    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    const parsed = new Date(year, month - 1, day);

    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return undefined;
    }

    return parsed;
};

const parseIsoDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed;
};

const formatYearMonth = (date: Date | undefined) => {
    if (!date) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}/${month}`;
};

const formatAmount = (value: number | null) =>
    value === null ? "-" : value.toLocaleString("ko-KR");

const isSummaryRecord = (record: LoosePayRollRecord) => {
    const transactionType = getStringValue(record, "transactionType", "transaction_type");
    const transactionMemo = getStringValue(record, "transactionMemo", "transaction_memo");

    return transactionType.includes("총합") || transactionMemo.includes("총합");
};

const buildRows = (records: PayRollRecord[]) =>
    records
        .filter((record) => !isSummaryRecord(record as LoosePayRollRecord))
        .map<PayRollDetailRow>((record, index) => {
        const item = record as LoosePayRollRecord;
        const key =
            getStringValue(item, "transactionId", "transaction_id", "salaryId", "salary_id") ||
            String(index);

        return {
            key,
            departmentName:
                getStringValue(item, "departmentName", "department_name") || "-",
            userName: getStringValue(item, "userName", "user_name") || "-",
            employeeId: getStringValue(item, "employeeId", "employee_id") || "-",
            gradeName:
                getStringValue(item, "gradeName", "grade_name", "positionName", "position_name") ||
                "-",
            basePay: getNumberValue(item, "basePay", "base_pay"),
            overtimeAllowance: getNumberValue(
                item,
                "overtimeAllowance",
                "overtime_allowance",
                "nightAllowance",
                "night_allowance",
                "nightWorkAllowance",
                "night_work_allowance"
            ),
            weekendAllowance: getNumberValue(
                item,
                "weekendAllowance",
                "weekend_allowance",
                "weekendWorkAllowance",
                "weekend_work_allowance"
            ),
            annualAllowance: getNumberValue(
                item,
                "annualAllowance",
                "annual_allowance",
                "annualLeaveAllowance",
                "annual_leave_allowance"
            ),
            totalAmount: getNumberValue(
                item,
                "salaryAmount",
                "salary_amount",
                "transactionPrice",
                "transaction_price"
            ),
        };
    });

const resolvePayrollLabel = (payrollLabel: string | undefined, records: PayRollRecord[]) => {
    const trimmedLabel = payrollLabel?.trim();

    if (trimmedLabel) {
        return trimmedLabel;
    }

    const firstRecord = records[0] as LoosePayRollRecord | undefined;

    if (!firstRecord) {
        return "급여";
    }

    const salaryDate = parseCompactDate(
        getNumberValue(firstRecord, "salaryDate", "salary_date")
    );
    const createdAtText = getStringValue(
        firstRecord,
        "salary_ledger_created_at",
        "transaction_created_at",
        "salary_created_at",
        "createdAt",
        "created_at"
    );
    const createdAt = createdAtText ? parseIsoDate(createdAtText) : undefined;
    const yearMonth = formatYearMonth(salaryDate ?? createdAt);

    if (yearMonth) {
        return `${yearMonth} 급여`;
    }

    return getStringValue(firstRecord, "transactionMemo", "transaction_memo") || "급여";
};

const PayRollInfoModal = ({
    isOpen,
    onClose,
    payrollLabel,
    records = [],
}: Props) => {
    const rows = useMemo(() => buildRows(records), [records]);
    const resolvedPayrollLabel = useMemo(
        () => resolvePayrollLabel(payrollLabel, records),
        [payrollLabel, records]
    );
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="payRollInfoModalScope">
            <Modal
                title="급여작업"
                isOpen={isOpen}
                onClose={onClose}
                footer={
                    <div className="payRollInfoModal-actions">
                        <button
                            type="button"
                            className="payRollInfoModal-button payRollInfoModal-button--primary"
                            onClick={handlePrint}
                        >
                            인쇄
                        </button>
                        <button
                            type="button"
                            className="payRollInfoModal-button payRollInfoModal-button--secondary"
                            onClick={onClose}
                        >
                            취소
                        </button>
                    </div>
                }
            >
                <div className="payRollInfoModal-panel">
                    <div className="payRollInfoModal-headerBlock">
                        <h2 className="payRollInfoModal-heading">급여대장</h2>
                        <p className="payRollInfoModal-ledgerName">{resolvedPayrollLabel}</p>
                    </div>

                    <div className="payRollInfoModal-tableWrap">
                        <table className="payRollInfoModal-table">
                            <thead>
                                <tr>
                                    <th>부서</th>
                                    <th>성명</th>
                                    <th>사번번호</th>
                                    <th>직위/직급</th>
                                    <th>기본급</th>
                                    <th>야근수당</th>
                                    <th>주말근무수당</th>
                                    <th>연차수당</th>
                                    <th>지급총액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="payRollInfoModal-empty">
                                            급여 내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.key}>
                                            <td>{row.departmentName}</td>
                                            <td>{row.userName}</td>
                                            <td>{row.employeeId}</td>
                                            <td>{row.gradeName}</td>
                                            <td>{formatAmount(row.basePay)}</td>
                                            <td>{formatAmount(row.overtimeAllowance)}</td>
                                            <td>{formatAmount(row.weekendAllowance)}</td>
                                            <td>{formatAmount(row.annualAllowance)}</td>
                                            <td>{formatAmount(row.totalAmount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PayRollInfoModal;
