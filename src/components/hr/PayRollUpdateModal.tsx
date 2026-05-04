import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    type PayRollMutationPayload,
    type PayRollRecord,
    useDeletePayRoll,
    usePutPayRoll,
} from "../../apis/hr/PayLollService.tsx";
import { getHr2Data } from "../../apis/hr2/Hr2Service.tsx";
import "../../assets/styles/hr/payRollUpdateModal.css";
import {
    calculatePayRollAllowances,
    normalizeAllowanceSourceRecords,
} from "../../utils/payRollAllowanceCalculator";
import ConfirmModal from "../ConfirmModal";
import Modal from "../Modal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void | Promise<void>;
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

const EMPTY_ALLOWANCE_RECORDS: unknown[] = [];
const EMPTY_PAYROLL_RECORDS: PayRollRecord[] = [];

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

const toPayrollMonth = (records: PayRollRecord[], payrollLabel?: string) => {
    const firstRecord = records[0] as LoosePayRollRecord | undefined;
    const salaryDate = firstRecord
        ? parseCompactDate(getNumberValue(firstRecord, "salaryDate", "salary_date"))
        : undefined;

    if (salaryDate) {
        return { year: salaryDate.getFullYear(), month: salaryDate.getMonth() + 1 };
    }

    const labelMatch = payrollLabel?.match(/(\d{4})[/-](\d{1,2})/);

    if (labelMatch) {
        return { year: Number(labelMatch[1]), month: Number(labelMatch[2]) };
    }

    return null;
};

const formatAmountInput = (value: number | null) =>
    value === null ? "" : value.toLocaleString("ko-KR");

const parseAmountInput = (value: string) => {
    const parsed = Number(value.replaceAll(",", "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
};

const getNullableStringValue = (record: Record<string, unknown>, ...keys: string[]) =>
    getStringValue(record, ...keys) || null;

const buildUpdatePayload = (
    record: LoosePayRollRecord,
    amounts: PayRollEditableAmounts
): PayRollMutationPayload => {
    const salaryLedgerId = getNumberValue(record, "salaryLedgerId", "salary_ledger_id");
    const totalAmount = parseAmountInput(amounts.totalAmount);
    const basePay = parseAmountInput(amounts.basePay);
    const overtimeAllowance = parseAmountInput(amounts.overtimeAllowance);
    const weekendAllowance = parseAmountInput(amounts.weekendAllowance);
    const annualAllowance = parseAmountInput(amounts.annualAllowance);
    const salaryDate = getNumberValue(record, "salaryDate", "salary_date");

    return {
        transactionId: getNumberValue(record, "transactionId", "transaction_id") ?? 0,
        vendorId: getNumberValue(record, "vendorId", "vendor_id") ?? 0,
        salary_ledgerId: salaryLedgerId,
        salaryLedgerId,
        transactionNum: getNumberValue(record, "transactionNum", "transaction_num") ?? 0,
        transactionType: getStringValue(record, "transactionType", "transaction_type"),
        transactionPrice: String(totalAmount),
        transaction_price: String(totalAmount),
        transactionMemo: getStringValue(record, "transactionMemo", "transaction_memo"),
        transaction_memo: getStringValue(record, "transactionMemo", "transaction_memo"),
        vendorCord: getNullableStringValue(record, "vendorCord", "vendor_cord"),
        vendorName: getNullableStringValue(record, "vendorName", "vendor_name"),
        vendorIsUse: getNullableStringValue(record, "vendorIsUse", "vendor_is_use"),
        userId: getNumberValue(record, "userId", "user_id") ?? undefined,
        transferId: getNumberValue(record, "transferId", "transfer_id") ?? 0,
        salaryStatus: getNullableStringValue(record, "salaryStatus", "salary_status"),
        salaryId: getNumberValue(record, "salaryId", "salary_id") ?? 0,
        basePay,
        base_pay: basePay,
        bankTransferId: getNumberValue(record, "bankTransferId", "bank_transfer_id") ?? 0,
        salaryDate,
        salary_date: salaryDate,
        salaryAmount: totalAmount,
        salary_amount: totalAmount,
        overtimeAllowance,
        overtime_allowance: overtimeAllowance,
        weekendAllowance,
        weekend_allowance: weekendAllowance,
        annualAllowance,
        annual_allowance: annualAllowance,
        userName: getNullableStringValue(record, "userName", "user_name"),
        employeeId: getNullableStringValue(record, "employeeId", "employee_id"),
        departmentId: getNumberValue(record, "departmentId", "department_id") ?? 0,
        gradeId: getNumberValue(record, "gradeId", "grade_id") ?? 0,
        bank: getNullableStringValue(record, "bank"),
        account_num: getNullableStringValue(record, "account_num", "accountNum"),
        allowanceId: getNumberValue(record, "allowanceId", "allowance_id") ?? 0,
        allowanceCord: getStringValue(record, "allowanceCord", "allowance_cord"),
        allowanceName: getStringValue(record, "allowanceName", "allowance_name"),
        gradeName: getStringValue(record, "gradeName", "grade_name"),
        departmentName: getStringValue(record, "departmentName", "department_name"),
        transaction_created_at: getNullableStringValue(
            record,
            "transaction_created_at",
            "createdAt",
            "created_at"
        ),
        transaction_updated_at: getNullableStringValue(
            record,
            "transaction_updated_at",
            "updatedAt",
            "updated_at"
        ),
        transfe_created_at: getNullableStringValue(record, "transfe_created_at"),
        transfe_updated_at: getNullableStringValue(record, "transfe_updated_at"),
        salary_ledger_created_at: getNullableStringValue(record, "salary_ledger_created_at"),
        salary_ledger_updated_at: getNullableStringValue(record, "salary_ledger_updated_at"),
        salary_created_at: getNullableStringValue(record, "salary_created_at"),
        salary_updated_at: getNullableStringValue(record, "salary_updated_at"),
    };
};

const sumAmountFields = (amounts: Pick<
    PayRollEditableAmounts,
    "basePay" | "overtimeAllowance" | "weekendAllowance" | "annualAllowance"
>) =>
    parseAmountInput(amounts.basePay) +
    parseAmountInput(amounts.overtimeAllowance) +
    parseAmountInput(amounts.weekendAllowance) +
    parseAmountInput(amounts.annualAllowance);

const createEditableAmounts = (rows: PayRollDetailRow[]) =>
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
    ) as Record<string, PayRollEditableAmounts>;

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
    onUpdated,
    payrollLabel,
    records = EMPTY_PAYROLL_RECORDS,
}: Props) => {
    const updatePayRoll = usePutPayRoll();
    const deletePayRoll = useDeletePayRoll();
    const { data: workRecords = EMPTY_ALLOWANCE_RECORDS } = useQuery({
        queryKey: ["payRollAllowanceWork"],
        queryFn: async () => {
            try {
                return await getHr2Data("work");
            } catch {
                return EMPTY_ALLOWANCE_RECORDS;
            }
        },
        enabled: isOpen,
        retry: false,
    });
    const { data: vacationRecords = EMPTY_ALLOWANCE_RECORDS } = useQuery({
        queryKey: ["payRollAllowanceVacation"],
        queryFn: async () => {
            try {
                return await getHr2Data("vacation");
            } catch {
                return EMPTY_ALLOWANCE_RECORDS;
            }
        },
        enabled: isOpen,
        retry: false,
    });
    const payrollMonth = useMemo(
        () => toPayrollMonth(records, payrollLabel),
        [payrollLabel, records]
    );
    const rows = useMemo(() => {
        const rawRows = buildRows(records);

        return rawRows.map((row) => {
            const calculated = calculatePayRollAllowances({
                employee: {
                    employeeId: row.employeeId,
                    userName: row.userName,
                    basePay: row.basePay,
                },
                workRecords: normalizeAllowanceSourceRecords(workRecords),
                vacationRecords: normalizeAllowanceSourceRecords(vacationRecords),
                payrollMonth,
            });
            const overtimeAllowance =
                row.overtimeAllowance ?? calculated.overtimeAllowance ?? null;
            const weekendAllowance =
                row.weekendAllowance ?? calculated.weekendAllowance ?? null;
            const annualAllowance =
                row.annualAllowance ?? calculated.annualAllowance ?? null;
            const computedTotal =
                row.basePay === null
                    ? null
                    : row.basePay +
                      (overtimeAllowance ?? 0) +
                      (weekendAllowance ?? 0) +
                      (annualAllowance ?? 0);

            return {
                ...row,
                overtimeAllowance,
                weekendAllowance,
                annualAllowance,
                totalAmount: row.totalAmount ?? computedTotal,
            };
        });
    }, [payrollMonth, records, vacationRecords, workRecords]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
    const [editableAmounts, setEditableAmounts] = useState<Record<string, PayRollEditableAmounts>>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const resolvedPayrollLabel = useMemo(
        () => resolvePayrollLabel(payrollLabel, records),
        [payrollLabel, records]
    );
    const allSelected = rows.length > 0 && rows.every((row) => selectedKeys.includes(row.key));

    useEffect(() => {
        if (!isOpen) {
            setSelectedKeys([]);
            setDirtyKeys([]);
            setEditableAmounts({});
            setIsConfirmOpen(false);
            setIsDeleteConfirmOpen(false);
            setIsUpdating(false);
            setIsDeleting(false);
            return;
        }

        setEditableAmounts(createEditableAmounts(rows));
    }, [isOpen, rows]);

    const handleAmountChange = (
        rowKey: string,
        field: PayRollAmountField,
        value: string
    ) => {
        const sanitizedValue = value.replace(/[^\d,]/g, "");

        setDirtyKeys((prev) => (prev.includes(rowKey) ? prev : [...prev, rowKey]));
        setSelectedKeys((prev) => (prev.includes(rowKey) ? prev : [...prev, rowKey]));

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
        const targetKeys = Array.from(new Set([...selectedKeys, ...dirtyKeys]));

        if (targetKeys.length === 0) {
            window.alert("수정할 급여 항목을 선택해 주세요.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (selectedKeys.length === 0) {
            window.alert("\uC0AD\uC81C\uD560 \uAE09\uC5EC \uD56D\uBAA9\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
            return;
        }

        setIsDeleteConfirmOpen(true);
    };

    const handleClearSelection = () => {
        if (isUpdating || isDeleting) {
            return;
        }

        setSelectedKeys([]);
        setIsConfirmOpen(false);
        setIsDeleteConfirmOpen(false);
    };

    const handleConfirmUpdate = async () => {
        if (isUpdating) {
            return;
        }

        const targetKeys = Array.from(new Set([...selectedKeys, ...dirtyKeys]));
        const selectedRecordMap = new Map(
            records.map((record, index) => {
                const item = record as LoosePayRollRecord;
                const key =
                    getStringValue(item, "transactionId", "transaction_id", "salaryId", "salary_id") ||
                    String(index);

                return [key, item];
            })
        );

        setIsUpdating(true);

        try {
            for (const selectedKey of targetKeys) {
                const record = selectedRecordMap.get(selectedKey);
                const amounts = editableAmounts[selectedKey];

                if (!record || !amounts) {
                    continue;
                }

                const salaryLedgerId =
                    getNumberValue(record, "transactionId", "transaction_id") ??
                    getNumberValue(record, "salaryLedgerId", "salary_ledger_id") ??
                    getNumberValue(record, "salaryId", "salary_id");

                if (salaryLedgerId === null) {
                    continue;
                }

                await updatePayRoll.mutateAsync({
                    salaryLedgerId,
                    payload: buildUpdatePayload(record, amounts),
                });
            }

            await onUpdated?.();
            setDirtyKeys([]);
            setSelectedKeys([]);
            setIsConfirmOpen(false);
            onClose();
            window.alert("수정이 완료되었습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "수정 처리 중 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (isDeleting) {
            return;
        }

        const selectedRecordMap = new Map(
            records.map((record, index) => {
                const item = record as LoosePayRollRecord;
                const key =
                    getStringValue(item, "transactionId", "transaction_id", "salaryId", "salary_id") ||
                    String(index);

                return [key, item];
            })
        );

        setIsDeleting(true);

        try {
            for (const selectedKey of selectedKeys) {
                const record = selectedRecordMap.get(selectedKey);

                if (!record) {
                    continue;
                }

                const salaryLedgerId =
                    getNumberValue(record, "transactionId", "transaction_id") ??
                    getNumberValue(record, "salaryLedgerId", "salary_ledger_id") ??
                    getNumberValue(record, "salaryId", "salary_id");

                if (salaryLedgerId === null) {
                    continue;
                }

                await deletePayRoll.mutateAsync(salaryLedgerId);
            }

            await onUpdated?.();
            setSelectedKeys([]);
            setIsDeleteConfirmOpen(false);
            onClose();
            window.alert("\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "\uC0AD\uC81C \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="payRollUpdateModalScope">
                <Modal
                    title="급여작업"
                    isOpen={isOpen}
                    onClose={onClose}
                    footer={
                        <div className="payRollUpdateModal-actions">
                            <button
                                type="button"
                                className="payRollUpdateModal-button payRollUpdateModal-button--secondary"
                                onClick={handleClearSelection}
                                disabled={isUpdating || isDeleting || selectedKeys.length === 0}
                            >
                                {"\uC0AD\uC81C \uCDE8\uC18C"}
                            </button>
                            <button
                                type="button"
                                className="payRollUpdateModal-button payRollUpdateModal-button--primary"
                                onClick={handleUpdate}
                                disabled={isUpdating || isDeleting || (selectedKeys.length === 0 && dirtyKeys.length === 0)}
                            >
                                {isUpdating ? "저장 중..." : "저장"}
                            </button>
                            <button
                                type="button"
                                className="payRollUpdateModal-button payRollUpdateModal-button--danger"
                                onClick={handleDelete}
                            >
                                삭제
                            </button>

                            <button
                                type="button"
                                className="payRollUpdateModal-button payRollUpdateModal-button--secondary"
                                onClick={handleClearSelection}
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

            <ConfirmModal
                isOpen={isConfirmOpen}
                message={`선택한 급여 ${Array.from(new Set([...selectedKeys, ...dirtyKeys])).length}건을 수정하시겠습니까?`}
                onConfirm={handleConfirmUpdate}
                onClose={() => {
                    if (!isUpdating) {
                        setIsConfirmOpen(false);
                    }
                }}
            />
            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                message={`\uC120\uD0DD\uD55C \uAE09\uC5EC ${selectedKeys.length}\uAC74\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`}
                onConfirm={handleConfirmDelete}
                onClose={() => {
                    if (!isDeleting) {
                        setIsDeleteConfirmOpen(false);
                    }
                }}
            />
        </>
    );
};

export default PayRollUpdateModal;
