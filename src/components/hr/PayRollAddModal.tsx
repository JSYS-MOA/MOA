import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { type HrCardRecord, useGetHrCardList } from "../../apis/hr/HrCardService";
import {
    type PayRollCreatePayload,
    type PayRollRecord,
    type SalaryRecord,
    useGetPayRollList,
    useGetSalaryList,
    usePostPayRollRecord,
} from "../../apis/hr/PayLollService";
import "../../assets/styles/hr/payRollAddModal.css";
import Modal from "../Modal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void | Promise<void>;
};

type DateParts = {
    year: string;
    month: string;
    day: string;
};

type EmployeeRow = {
    key: string;
    userId: number | null;
    employeeId: string;
    userName: string;
    departmentName: string;
};

type SalarySnapshot = {
    salaryId: number | null;
    basePay: number;
};

const currentYear = new Date().getFullYear();

const toStringValue = (value: unknown) => {
    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return "";
};

const toNumberValue = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
};

const formatDateAsLocalDateTime = (value: string) => `${value}T13:00:00`;

const isActiveEmployeeRecord = (record: HrCardRecord) =>
    toStringValue(record.quitDate ?? record.quit_date) === "";

const toEmployeeRows = (records: HrCardRecord[]) =>
    records
        .filter(isActiveEmployeeRecord)
        .map<EmployeeRow>((record, index) => {
            const userId = toNumberValue(record.userId ?? record.user_id);
            const employeeId = toStringValue(record.employeeId ?? record.employee_id);

            return {
                key: userId === null ? employeeId || String(index) : String(userId),
                userId,
                employeeId: employeeId || "-",
                userName: toStringValue(record.userName ?? record.user_name) || "-",
                departmentName:
                    toStringValue(record.departmentName ?? record.department_name) || "-",
            };
        });

const toSalarySnapshotMap = (records: PayRollRecord[]) => {
    const salaryMap = new Map<number, SalarySnapshot>();

    for (const record of records) {
        const item = record as PayRollRecord & Record<string, unknown>;
        const userId = toNumberValue(item.userId ?? item.user_id);
        const basePay = toNumberValue(item.basePay ?? item.base_pay);

        if (userId === null || basePay === null || salaryMap.has(userId)) {
            continue;
        }

        salaryMap.set(userId, {
            salaryId: toNumberValue(item.salaryId ?? item.salary_id),
            basePay,
        });
    }

    return salaryMap;
};

const toSalaryRecordSnapshotMap = (records: SalaryRecord[]) => {
    const salaryMap = new Map<number, SalarySnapshot>();

    for (const record of records) {
        const item = record as SalaryRecord & Record<string, unknown>;
        const userId = toNumberValue(item.userId ?? item.user_id);
        const basePay = toNumberValue(item.basePay ?? item.base_pay);

        if (userId === null || basePay === null) {
            continue;
        }

        salaryMap.set(userId, {
            salaryId: toNumberValue(item.salaryId ?? item.salary_id),
            basePay,
        });
    }

    return salaryMap;
};

const getDateParts = (value: string): DateParts => {
    const [year = "", month = "", day = ""] = value.split("-");
    return { year, month, day };
};

const formatDateValue = ({ year, month, day }: DateParts) => {
    if (!year || !month || !day) {
        return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const DateSelect = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) => {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const parts = getDateParts(value);
    const years = useMemo(
        () => Array.from({ length: 8 }, (_, index) => String(currentYear - index)),
        []
    );
    const months = useMemo(
        () => Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")),
        []
    );
    const days = useMemo(() => {
        const year = Number(parts.year || currentYear);
        const month = Number(parts.month || 1);
        const count = new Date(year, month, 0).getDate();

        return Array.from({ length: count }, (_, index) =>
            String(index + 1).padStart(2, "0")
        );
    }, [parts.month, parts.year]);

    const updatePart = (key: keyof DateParts, nextValue: string) => {
        const nextParts = { ...parts, [key]: nextValue };
        onChange(formatDateValue(nextParts));
    };

    const openDatePicker = () => {
        const dateInput = dateInputRef.current as
            | (HTMLInputElement & { showPicker?: () => void })
            | null;

        if (!dateInput) {
            return;
        }

        if (dateInput.showPicker) {
            dateInput.showPicker();
            return;
        }

        dateInput.click();
        dateInput.focus();
    };

    return (
        <div className="payRollAddModal-dateRow">
            <input
                ref={dateInputRef}
                className="payRollAddModal-nativeDateInput"
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                tabIndex={-1}
                aria-hidden="true"
            />
            <select
                className="payRollAddModal-select"
                value={parts.year}
                onChange={(event) => updatePart("year", event.target.value)}
            >
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
            <span>/</span>
            <select
                className="payRollAddModal-select"
                value={parts.month}
                onChange={(event) => updatePart("month", event.target.value)}
            >
                {months.map((month) => (
                    <option key={month} value={month}>
                        {month}
                    </option>
                ))}
            </select>
            <span>/</span>
            <select
                className="payRollAddModal-select"
                value={parts.day}
                onChange={(event) => updatePart("day", event.target.value)}
            >
                {days.map((day) => (
                    <option key={day} value={day}>
                        {day}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="payRollAddModal-calendarButton"
                aria-label="달력"
                onClick={openDatePicker}
            >
                <FaRegCalendarAlt aria-hidden="true" />
            </button>
        </div>
    );
};

const EmployeeSelectModal = ({
    isOpen,
    employees,
    selectedKeys,
    onApply,
    onClose,
}: {
    isOpen: boolean;
    employees: EmployeeRow[];
    selectedKeys: string[];
    onApply: (keys: string[]) => void;
    onClose: () => void;
}) => {
    const [search, setSearch] = useState("");
    const [draftKeys, setDraftKeys] = useState<string[]>(selectedKeys);

    useEffect(() => {
        if (isOpen) {
            setDraftKeys(selectedKeys);
            setSearch("");
        }
    }, [isOpen, selectedKeys]);

    const filteredEmployees = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return employees;
        }

        return employees.filter((employee) =>
            [employee.employeeId, employee.userName, employee.departmentName]
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [employees, search]);

    const allFilteredSelected =
        filteredEmployees.length > 0 &&
        filteredEmployees.every((employee) => draftKeys.includes(employee.key));

    const toggleAllFiltered = () => {
        const filteredKeys = filteredEmployees.map((employee) => employee.key);

        setDraftKeys((prev) => {
            if (allFilteredSelected) {
                return prev.filter((key) => !filteredKeys.includes(key));
            }

            return Array.from(new Set([...prev, ...filteredKeys]));
        });
    };

    const toggleEmployee = (key: string) => {
        setDraftKeys((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    return (
        <div className="payRollEmployeeSelectModalScope">
            <Modal
                title="대상사원설정"
                isOpen={isOpen}
                onClose={onClose}
                footer={
                    <div className="payRollAddModal-actions">
                        <button
                            type="button"
                            className="payRollAddModal-button payRollAddModal-button--primary"
                            onClick={() => onApply(draftKeys)}
                        >
                            적용
                        </button>
                        <button
                            type="button"
                            className="payRollAddModal-button payRollAddModal-button--secondary"
                            onClick={onClose}
                        >
                            취소
                        </button>
                    </div>
                }
            >
                <div className="payRollAddModal-panel">
                    <div className="payRollAddModal-subHeader">
                        <h3>대상사원설정</h3>
                        <div className="payRollAddModal-search">
                            <input
                                type="text"
                                placeholder="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <button type="button">검색</button>
                        </div>
                    </div>

                    <div className="payRollAddModal-tableWrap">
                        <table className="payRollAddModal-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={allFilteredSelected}
                                            onChange={toggleAllFiltered}
                                        />
                                    </th>
                                    <th>사원번호</th>
                                    <th>성명</th>
                                    <th>부서명</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="payRollAddModal-empty">
                                            대상 사원이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <tr key={employee.key}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={draftKeys.includes(employee.key)}
                                                    onChange={() => toggleEmployee(employee.key)}
                                                />
                                            </td>
                                            <td>{employee.employeeId}</td>
                                            <td>{employee.userName}</td>
                                            <td>{employee.departmentName}</td>
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

const PayRollAddModal = ({ isOpen, onClose, onCreated }: Props) => {
    const today = useMemo(() => new Date(), []);
    const initialDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    const { data: hrCards = [] } = useGetHrCardList();
    const { data: payRollRecords = [] } = useGetPayRollList();
    const { data: salaryRecords = [] } = useGetSalaryList();
    const createPayRoll = usePostPayRollRecord();
    const employees = useMemo(() => toEmployeeRows(hrCards), [hrCards]);
    const payRollSalaryMap = useMemo(
        () => toSalarySnapshotMap(payRollRecords),
        [payRollRecords]
    );
    const salaryRecordMap = useMemo(
        () => toSalaryRecordSnapshotMap(salaryRecords),
        [salaryRecords]
    );
    const salaryMap = useMemo(() => {
        const mergedMap = new Map(payRollSalaryMap);

        for (const [userId, salary] of salaryRecordMap) {
            mergedMap.set(userId, salary);
        }

        return mergedMap;
    }, [payRollSalaryMap, salaryRecordMap]);
    const [payDate, setPayDate] = useState(initialDate);
    const [ledgerName, setLedgerName] = useState("");
    const [targetType, setTargetType] = useState<"all" | "selected">("all");
    const [selectedEmployeeKeys, setSelectedEmployeeKeys] = useState<string[]>([]);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const selectedCount =
        targetType === "all" ? employees.length : selectedEmployeeKeys.length;

    useEffect(() => {
        if (!isOpen) {
            setPayDate(initialDate);
            setLedgerName("");
            setTargetType("all");
            setSelectedEmployeeKeys([]);
            setIsEmployeeModalOpen(false);
            setIsSaving(false);
        }
    }, [initialDate, isOpen]);

    const handleApplyEmployees = (keys: string[]) => {
        setSelectedEmployeeKeys(keys);
        setTargetType("selected");
        setIsEmployeeModalOpen(false);
    };

    useEffect(() => {
        const activeEmployeeKeys = new Set(employees.map((employee) => employee.key));

        setSelectedEmployeeKeys((prev) =>
            prev.filter((key) => activeEmployeeKeys.has(key))
        );
    }, [employees]);

    const handleSave = async () => {
        if (isSaving) {
            return;
        }

        const targetEmployees =
            targetType === "all"
                ? employees
                : employees.filter((employee) => selectedEmployeeKeys.includes(employee.key));

        if (targetEmployees.length === 0) {
            window.alert("대상 사원을 선택해 주세요.");
            return;
        }

        const missingSalaryEmployees = targetEmployees.filter(
            (employee) => employee.userId === null || !salaryMap.has(employee.userId)
        );

        if (missingSalaryEmployees.length > 0) {
            window.alert(
                `급여 정보를 찾을 수 없는 사원이 있습니다: ${missingSalaryEmployees
                    .map((employee) => employee.userName)
                    .join(", ")}`
            );
            return;
        }

        const selectedDateTime = formatDateAsLocalDateTime(payDate);
        const transactionMemo =
            ledgerName.trim() ||
            `${payDate.replaceAll("-", "/").slice(0, 7)} 일반전표`;

        setIsSaving(true);

        try {
            for (const employee of targetEmployees) {
                const userId = employee.userId;

                if (userId === null) {
                    continue;
                }

                const salary = salaryMap.get(userId);

                if (!salary) {
                    continue;
                }

                const payload: PayRollCreatePayload = {
                    userId,
                    user_id: userId,
                    bankTransferId: 2,
                    bank_transfer_id: 2,
                    salaryDate: selectedDateTime,
                    salary_date: selectedDateTime,
                    salaryAmount: salary.basePay,
                    salary_amount: salary.basePay,
                    basePay: salary.basePay,
                    base_pay: salary.basePay,
                    transactionMemo,
                    transaction_memo: transactionMemo,
                    transactionType: "일반전표",
                    transactionPrice: String(salary.basePay),
                    transaction_price: String(salary.basePay),
                    salaryStatus: "일반전표",
                    salary_status: "일반전표",
                    vendorId: 11,
                    vendor_id: 11,
                    createdAt: selectedDateTime,
                    created_at: selectedDateTime,
                    salary_ledger_created_at: selectedDateTime,
                };

                console.log("payroll add payload", payload);
                await createPayRoll.mutateAsync(payload);
            }

            await onCreated?.();
            window.alert("급여작업이 저장되었습니다.");
            onClose();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "급여작업 저장 중 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="payRollAddModalScope">
                <Modal
                    title="급여작업"
                    isOpen={isOpen}
                    onClose={onClose}
                    footer={
                        <div className="payRollAddModal-actions">
                            <button
                                type="button"
                                className="payRollAddModal-button payRollAddModal-button--primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? "저장 중..." : "저장"}
                            </button>
                            <button
                                type="button"
                                className="payRollAddModal-button payRollAddModal-button--secondary"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                취소
                            </button>
                        </div>
                    }
                >
                    <div className="payRollAddModal-panel">
                        <h2 className="payRollAddModal-heading">급여작업등록</h2>

                        <div className="payRollAddModal-formBox">
                            <div className="payRollAddModal-fieldRow">
                                <label>지급일</label>
                                <DateSelect value={payDate} onChange={setPayDate} />
                            </div>

                            <div className="payRollAddModal-fieldRow">
                                <label>급여대장명</label>
                                <input
                                    className="payRollAddModal-input"
                                    type="text"
                                    value={ledgerName}
                                    onChange={(event) => setLedgerName(event.target.value)}
                                />
                            </div>

                            <div className="payRollAddModal-fieldRow payRollAddModal-targetRow">
                                <label>대상사원</label>
                                <label className="payRollAddModal-radio">
                                    <input
                                        type="radio"
                                        checked={targetType === "all"}
                                        onChange={() => setTargetType("all")}
                                    />
                                    전체
                                </label>
                                <label className="payRollAddModal-radio">
                                    <input
                                        type="radio"
                                        checked={targetType === "selected"}
                                        onChange={() => {
                                            setTargetType("selected");
                                            setIsEmployeeModalOpen(true);
                                        }}
                                    />
                                    선택
                                </label>
                                <button
                                    type="button"
                                    className="payRollAddModal-linkButton"
                                    onClick={() => setIsEmployeeModalOpen(true)}
                                >
                                    사원설정
                                </button>
                                <span className="payRollAddModal-targetCount">
                                    {selectedCount}명
                                </span>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                employees={employees}
                selectedKeys={selectedEmployeeKeys}
                onApply={handleApplyEmployees}
                onClose={() => setIsEmployeeModalOpen(false)}
            />
        </>
    );
};

export default PayRollAddModal;
