import { useEffect, useMemo, useState } from "react";
import type { PayRollRecord } from "../../apis/hr/PayLollService.tsx";
import "../../assets/styles/hr/payRollUpdateModal.css";
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

type PayRollAmountField =
    | "basePay"
    | "overtimeAllowance"
    | "weekendAllowance"
    | "annualAllowance"
    | "totalAmount";

type PayRollEditableAmounts = Record<
    PayRollAmountField,
    string
> & {
    isTotalManuallyEdited: boolean;
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

const formatAmountInput = (value: number | null) =>
    value === null ? "" : value.toLocaleString("ko-KR");

const parseAmountInput = (value: string) => {
    const parsed = Number(value.replaceAll(",", "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
};

const sumAmountFields = (amounts: Pick<
    PayRollEditableAmounts,
    "basePay" | "overtimeAllowance" | "weekendAllowance" | "annualAllowance"
>) =>
    parseAmountInput(amounts.basePay) +
    parseAmountInput(amounts.overtimeAllowance) +
    parseAmountInput(amounts.weekendAllowance) +
    parseAmountInput(amounts.annualAllowance);

const isSummaryRecord = (record: LoosePayRollRecord) => {
    const transactionType = getStringValue(record, "transactionType", "transaction_type");
    const transactionMemo = getStringValue(record, "transactionMemo", "transaction_memo");

    return (
        transactionType.includes("총합") ||
        transactionMemo.includes("총합") ||
        transactionType.includes("珥앺빀") ||
        transactionMemo.includes("珥앺빀")
    );
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
        return `${yearMonth} 일반전표`;
    }

    return getStringValue(firstRecord, "transactionMemo", "transaction_memo") || "급여";
};

const PayRollUpdateModal = ({
    isOpen,
    onClose,
    payrollLabel,
    records = [],
}: Props) => {
    const rows = useMemo(() => buildRows(records), [records]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [editableAmounts, setEditableAmounts] = useState<Record<string, PayRollEditableAmounts>>({});
    const resolvedPayrollLabel = useMemo(
        () => resolvePayrollLabel(payrollLabel, records),
        [payrollLabel, records]
    );
    const allSelected = rows.length > 0 && rows.every((row) => selectedKeys.includes(row.key));

    useEffect(() => {
        if (!isOpen) {
            setSelectedKeys([]);
            setEditableAmounts({});
            return;
        }

        setEditableAmounts(
            Object.fromEntries(
                rows.map((row) => [
                    row.key,
                    {
                        basePay: formatAmountInput(row.basePay),
                        overtimeAllowance: formatAmountInput(row.overtimeAllowance),
                        weekendAllowance: formatAmountInput(row.weekendAllowance),
                        annualAllowance: formatAmountInput(row.annualAllowance),
                        totalAmount: formatAmountInput(row.totalAmount),
                        isTotalManuallyEdited: false,
                    },
                ])
            )
        );
    }, [isOpen, rows]);

    const handleAmountChange = (
        rowKey: string,
        field: PayRollAmountField,
        value: string
    ) => {
        const sanitizedValue = value.replace(/[^\d,]/g, "");

        setEditableAmounts((prev) => {
            const current = prev[rowKey];

            if (!current) {
                return prev;
            }

            const next = {
                ...current,
                [field]: sanitizedValue,
            };

            if (field === "totalAmount") {
                next.isTotalManuallyEdited = true;
                return {
                    ...prev,
                    [rowKey]: next,
                };
            }

            if (!next.isTotalManuallyEdited) {
                next.totalAmount = sumAmountFields(next).toLocaleString("ko-KR");
            }

            return {
                ...prev,
                [rowKey]: next,
            };
        });
    };

    const handleAmountBlur = (rowKey: string, field: PayRollAmountField) => {
        setEditableAmounts((prev) => {
            const current = prev[rowKey];

            if (!current) {
                return prev;
            }

            return {
                ...prev,
                [rowKey]: {
                    ...current,
                    [field]: parseAmountInput(current[field]).toLocaleString("ko-KR"),
                },
            };
        });
    };

    const renderAmountInput = (rowKey: string, field: PayRollAmountField) => {
        const amounts = editableAmounts[rowKey];

        return (
            <input
                className="payRollUpdateModal-amountInput"
                inputMode="numeric"
                value={amounts?.[field] ?? ""}
                onChange={(event) => handleAmountChange(rowKey, field, event.target.value)}
                onBlur={() => handleAmountBlur(rowKey, field)}
            />
        );
    };

    const handleToggleAll = () => {
        setSelectedKeys(allSelected ? [] : rows.map((row) => row.key));
    };

    const handleToggleRow = (key: string) => {
        setSelectedKeys((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    const handleUpdate = () => {
        if (selectedKeys.length === 0) {
            window.alert("수정할 급여 항목을 선택해 주세요.");
            return;
        }

        window.alert("수정 기능은 아직 저장 API와 연결되지 않았습니다.");
    };

    return (
        <div className="payRollUpdateModalScope">
            <Modal
                title="급여작업"
                isOpen={isOpen}
                onClose={onClose}
                footer={
                    <div className="payRollUpdateModal-actions">
                        <button
                            type="button"
                            className="payRollUpdateModal-button payRollUpdateModal-button--primary"
                            onClick={handleUpdate}
                        >
                            수정
                        </button>
                        <button
                            type="button"
                            className="payRollUpdateModal-button payRollUpdateModal-button--secondary"
                            onClick={onClose}
                        >
                            취소
                        </button>
                    </div>
                }
            >
                <div className="payRollUpdateModal-panel">
                    <div className="payRollUpdateModal-headerBlock">
                        <h2 className="payRollUpdateModal-heading">급여대장</h2>
                        <p className="payRollUpdateModal-ledgerName">{resolvedPayrollLabel}</p>
                    </div>

                    <div className="payRollUpdateModal-tableWrap">
                        <table className="payRollUpdateModal-table">
                            <thead>
                                <tr>
                                    <th className="payRollUpdateModal-checkCell">
                                        <label className="payRollUpdateModal-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={handleToggleAll}
                                                aria-label="전체 선택"
                                            />
                                            <span />
                                        </label>
                                    </th>
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
                                        <td colSpan={10} className="payRollUpdateModal-empty">
                                            급여 내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.key}>
                                            <td className="payRollUpdateModal-checkCell">
                                                <label className="payRollUpdateModal-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedKeys.includes(row.key)}
                                                        onChange={() => handleToggleRow(row.key)}
                                                        aria-label={`${row.userName} 선택`}
                                                    />
                                                    <span />
                                                </label>
                                            </td>
                                            <td>{row.departmentName}</td>
                                            <td>{row.userName}</td>
                                            <td>{row.employeeId}</td>
                                            <td>{row.gradeName}</td>
                                            <td>{renderAmountInput(row.key, "basePay")}</td>
                                            <td>{renderAmountInput(row.key, "overtimeAllowance")}</td>
                                            <td>{renderAmountInput(row.key, "weekendAllowance")}</td>
                                            <td>{renderAmountInput(row.key, "annualAllowance")}</td>
                                            <td>{renderAmountInput(row.key, "totalAmount")}</td>
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

export default PayRollUpdateModal;
