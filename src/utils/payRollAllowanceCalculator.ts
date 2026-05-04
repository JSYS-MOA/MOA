export type PayRollAllowanceSourceRecord = Record<string, unknown>;

export type PayRollAllowanceEmployee = {
    userId?: number | null;
    employeeId?: string | null;
    userName?: string | null;
    basePay: number | null;
};

export type PayRollCalculatedAllowances = {
    overtimeAllowance: number;
    weekendAllowance: number;
    annualAllowance: number;
};

export const normalizeAllowanceSourceRecords = (
    value: unknown
): PayRollAllowanceSourceRecord[] => {
    if (Array.isArray(value)) {
        return value as PayRollAllowanceSourceRecord[];
    }

    if (typeof value === "object" && value !== null) {
        const content = (value as { content?: unknown }).content;

        if (Array.isArray(content)) {
            return content as PayRollAllowanceSourceRecord[];
        }
    }

    return [];
};

const STANDARD_MONTHLY_HOURS = 209;
const DAILY_WORK_HOURS = 8;
const EXTRA_WORK_RATE = 1.5;

export const getStringValue = (
    record: PayRollAllowanceSourceRecord,
    ...keys: string[]
) => {
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

export const getNumberValue = (
    record: PayRollAllowanceSourceRecord,
    ...keys: string[]
) => {
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

const normalizeEmployeeId = (value: string | null | undefined) =>
    String(value ?? "").replace(/\D/g, "");

const isSameEmployee = (
    source: PayRollAllowanceSourceRecord,
    employee: PayRollAllowanceEmployee
) => {
    const sourceUserId = getNumberValue(source, "userId", "user_id");
    const employeeUserId = employee.userId ?? null;

    if (sourceUserId !== null && employeeUserId !== null && sourceUserId === employeeUserId) {
        return true;
    }

    const sourceEmployeeId = normalizeEmployeeId(
        getStringValue(source, "employeeId", "employee_id", "employeeNo")
    );
    const employeeId = normalizeEmployeeId(employee.employeeId);

    if (sourceEmployeeId !== "" && employeeId !== "" && sourceEmployeeId === employeeId) {
        return true;
    }

    const sourceName = getStringValue(source, "userName", "user_name", "name");
    return sourceName !== "" && employee.userName !== "-" && sourceName === employee.userName;
};

const parseRecordDate = (value: unknown) => {
    const rawValue = String(value ?? "").trim();

    if (rawValue === "") {
        return null;
    }

    const digits = rawValue.replace(/\D/g, "");

    if (digits.length < 6) {
        return null;
    }

    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));

    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
        return null;
    }

    return { year, month };
};

const isInPayrollMonth = (
    record: PayRollAllowanceSourceRecord,
    payrollMonth?: { year: number; month: number } | null
) => {
    if (!payrollMonth) {
        return true;
    }

    const recordDate = parseRecordDate(
        record.workDate ??
            record.work_date ??
            record.attendanceDate ??
            record.attendance_date ??
            record.createdAt ??
            record.created_at
    );

    if (!recordDate) {
        return true;
    }

    return recordDate.year === payrollMonth.year && recordDate.month === payrollMonth.month;
};

const getWorkAmount = (
    record: PayRollAllowanceSourceRecord,
    basePay: number,
    fallbackHours: number
) => {
    const directAmount = getNumberValue(
        record,
        "allowanceAmount",
        "allowance_amount",
        "workAllowance",
        "work_allowance",
        "amount",
        "price",
        "pay"
    );

    if (directAmount !== null) {
        return directAmount;
    }

    const hours =
        getNumberValue(
            record,
            "workHours",
            "work_hours",
            "workHour",
            "work_hour",
            "overtimeHours",
            "overtime_hours",
            "weekendHours",
            "weekend_hours",
            "hours",
            "hour"
        ) ?? fallbackHours;

    return Math.round((basePay / STANDARD_MONTHLY_HOURS) * hours * EXTRA_WORK_RATE);
};

const getWorkStatus = (record: PayRollAllowanceSourceRecord) =>
    getStringValue(
        record,
        "workStatus",
        "work_status"
    ).toLowerCase();

const getAllowanceLabel = (record: PayRollAllowanceSourceRecord) =>
    getStringValue(record, "allowanceName", "allowance_name").toLowerCase();

const getCompactWorkStatus = (record: PayRollAllowanceSourceRecord) =>
    `${getWorkStatus(record)} ${getAllowanceLabel(record)}`.replace(/\s/g, "");

const isOvertimeWorkStatus = (record: PayRollAllowanceSourceRecord) => {
    const workStatus = getWorkStatus(record);
    const allowanceLabel = getAllowanceLabel(record);

    return (
        workStatus.includes("\uC57C\uADFC") ||
        workStatus.includes("\uC5F0\uC7A5") ||
        allowanceLabel.includes("\uC57C\uADFC") ||
        allowanceLabel.includes("\uC5F0\uC7A5") ||
        workStatus.includes("night") ||
        workStatus.includes("over") ||
        allowanceLabel.includes("night") ||
        allowanceLabel.includes("over")
    );
};

const isWeekendWorkStatus = (record: PayRollAllowanceSourceRecord) => {
    const workStatus = getWorkStatus(record);
    const allowanceLabel = getAllowanceLabel(record);
    const compactWorkStatus = getCompactWorkStatus(record);

    return (
        compactWorkStatus.includes("\uC8FC\uB9D0\uADFC\uBB34") ||
        compactWorkStatus.includes("\uD734\uC77C\uADFC\uBB34") ||
        allowanceLabel.includes("\uC8FC\uB9D0") ||
        allowanceLabel.includes("\uD734\uC77C") ||
        workStatus.includes("weekend") ||
        workStatus.includes("holiday") ||
        allowanceLabel.includes("weekend") ||
        allowanceLabel.includes("holiday")
    );
};

const getAllowanceName = (record: PayRollAllowanceSourceRecord) => {
    if (isOvertimeWorkStatus(record)) {
        return "over";
    }

    if (isWeekendWorkStatus(record)) {
        return "weekend";
    }

    return "";
};

const getRemainingVacationDays = (
    vacationRecords: PayRollAllowanceSourceRecord[],
    employee: PayRollAllowanceEmployee
) => {
    const vacationRecord = vacationRecords.find((record) => isSameEmployee(record, employee));

    if (!vacationRecord) {
        return 0;
    }

    const directRemaining = getNumberValue(
        vacationRecord,
        "remainingVacationDay",
        "remaining_vacation_day",
        "remainingDays",
        "remaining_days",
        "remainVacationDay",
        "remain_vacation_day",
        "remainDays",
        "remain_days",
        "vacationBalance",
        "vacation_balance",
        "leaveBalance",
        "leave_balance",
        "annualLeaveBalance",
        "annual_leave_balance",
        "restVacationDay",
        "rest_vacation_day",
        "unusedVacationDay",
        "unused_vacation_day"
    );

    if (directRemaining !== null) {
        return directRemaining;
    }

    const basicDays = getNumberValue(
        vacationRecord,
        "basicVacationDay",
        "basic_vacation_day",
        "totalVacationDay",
        "total_vacation_day",
        "annualVacationDay",
        "annual_vacation_day"
    );
    const usedDays = getNumberValue(
        vacationRecord,
        "usedVacationDay",
        "used_vacation_day",
        "useVacationDay",
        "use_vacation_day",
        "usedDays",
        "used_days"
    );

    if (basicDays !== null && usedDays !== null) {
        return Math.max(basicDays - usedDays, 0);
    }

    return basicDays ?? 0;
};

export const calculatePayRollAllowances = ({
    employee,
    workRecords,
    vacationRecords,
    payrollMonth,
}: {
    employee: PayRollAllowanceEmployee;
    workRecords: PayRollAllowanceSourceRecord[];
    vacationRecords: PayRollAllowanceSourceRecord[];
    payrollMonth?: { year: number; month: number } | null;
}): PayRollCalculatedAllowances => {
    const basePay = employee.basePay ?? 0;

    if (basePay <= 0) {
        return {
            overtimeAllowance: 0,
            weekendAllowance: 0,
            annualAllowance: 0,
        };
    }

    const employeeWorkRecords = workRecords.filter(
        (record) => isSameEmployee(record, employee) && isInPayrollMonth(record, payrollMonth)
    );

    const overtimeAllowance = employeeWorkRecords
        .filter((record) => {
            const allowanceName = getAllowanceName(record);

            return (
                allowanceName.includes("야근") ||
                allowanceName.includes("연장") ||
                allowanceName.includes("night") ||
                allowanceName.includes("over")
            );
        })
        .reduce((total, record) => total + getWorkAmount(record, basePay, 1), 0);

    const weekendAllowance = employeeWorkRecords
        .filter((record) => {
            const allowanceName = getAllowanceName(record);

            return (
                allowanceName.includes("주말") ||
                allowanceName.includes("휴일") ||
                allowanceName.includes("weekend") ||
                allowanceName.includes("holiday")
            );
        })
        .reduce((total, record) => total + getWorkAmount(record, basePay, DAILY_WORK_HOURS), 0);

    const annualAllowance = Math.round(
        payrollMonth?.month === 4
            ? (basePay / STANDARD_MONTHLY_HOURS) *
              DAILY_WORK_HOURS *
              getRemainingVacationDays(vacationRecords, employee)
            : 0
    );

    return {
        overtimeAllowance,
        weekendAllowance,
        annualAllowance,
    };
};
