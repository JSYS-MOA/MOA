import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";
import type { HrCard } from "../../apis/HrCardService";
import { useHrCardAdd } from "../../apis/HrCardService";
import "../../assets/styles/hr/hrCardAdd.css";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type HrCardFormState = {
    employeeId: string;
    userName: string;
    password: string;
    birth: string;
    roleId: string;
    departmentId: string;
    departmentName: string;
    gradeId: string;
    gradeName: string;
    email: string;
    startDate: string;
    phone: string;
    bank: string;
    accountNum: string;
    accountOwner: string;
    address: string;
    performance: string;
};

type DateParts = {
    year: string;
    month: string;
    day: string;
};

type EmailParts = {
    local: string;
    domain: string;
};

type PhoneParts = {
    first: string;
    middle: string;
    last: string;
};

type Department = {
    departmentId: number;
    departmentName: string;
    departmentIsUse?: number;
};

type Grade = {
    gradeId: number;
    gradeName: string;
};

type DepartmentResponse = Department[] | { content?: Department[] };

type DepartmentKey = "HR" | "WML" | "ACLE";
type GradeGroup = "EXECUTIVE" | "LEAD" | "STAFF";

type RoleOption = {
    roleId: number;
    code: string;
    label: string;
};

type DateSelectInputProps = {
    value: string;
    onChange: (value: string) => void;
    minYear: number;
    maxYear: number;
    calendarLabel: string;
};

type AddressSearchResult = {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
};

declare global {
    interface Window {
        daum: {
            Postcode: new (options: { oncomplete: (data: AddressSearchResult) => void }) => {
                open: () => void;
            };
        };
    }
}

const initialForm: HrCardFormState = {
    employeeId: "",
    userName: "",
    password: "",
    birth: "",
    roleId: "",
    departmentId: "",
    departmentName: "",
    gradeId: "",
    gradeName: "",
    email: "",
    startDate: "",
    phone: "",
    bank: "",
    accountNum: "",
    accountOwner: "",
    address: "",
    performance: "",
};

const ROLE_OPTIONS: Record<string, RoleOption> = {
    EXECUTIVE: { roleId: 1, code: "C", label: "임원" },
    "HR:LEAD": { roleId: 2, code: "HR-R", label: "인사팀장" },
    "WML:LEAD": { roleId: 3, code: "WML-R", label: "물류팀장" },
    "ACLE:LEAD": { roleId: 4, code: "ACLE-R", label: "회계팀장" },
    "HR:STAFF": { roleId: 5, code: "HR-E", label: "인사 사원" },
    "WML:STAFF": { roleId: 6, code: "WML-E", label: "물류 사원" },
    "ACLE:STAFF": { roleId: 7, code: "ACLE-E", label: "회계 사원" },
};

const DEPARTMENT_QUERY_KEY = ["departmentOptions"] as const;
const GRADE_QUERY_KEY = ["gradeOptions"] as const;
const HR_CARD_LIST_QUERY_KEY = ["hrCardList"] as const;

const DEPARTMENT_API_BASE = "/api/base/dept";
const HR_CARD_API_BASE = "/api/hr/cards";

const DEPARTMENT_DATALIST_ID = "hrCardAddModal-department-options";
const GRADE_DATALIST_ID = "hrCardAddModal-grade-options";

const EXCLUDED_DEPARTMENT_KEYWORDS = ["이사회"];
const HIDDEN_GRADE_KEYWORDS = ["부장", "상무", "부사장", "사장", "임원", "이사"];
const CURRENT_YEAR = new Date().getFullYear();

const toNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
};

const toRequiredNumber = (value: string, label: string) => {
    const trimmed = value.trim();
    const parsed = Number(trimmed);

    if (trimmed === "" || !Number.isFinite(parsed)) {
        throw new Error(`${label}를 숫자로 입력해 주세요.`);
    }

    return parsed;
};

const normalizeText = (value: string) => {
    return value.trim().replace(/\s+/g, "").toLowerCase();
};

const getDateParts = (value: string): DateParts => {
    const [year = "", month = "", day = ""] = value.split("-");
    return { year, month, day };
};

const getEmailParts = (value: string): EmailParts => {
    if (!value) {
        return { local: "", domain: "" };
    }

    const atIndex = value.indexOf("@");

    if (atIndex === -1) {
        return { local: value, domain: "" };
    }

    return {
        local: value.slice(0, atIndex),
        domain: value.slice(atIndex + 1),
    };
};

const getPhoneParts = (value: string): PhoneParts => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    return {
        first: digits.slice(0, 3),
        middle: digits.slice(3, 7),
        last: digits.slice(7, 11),
    };
};

const formatDateValue = ({ year, month, day }: DateParts) => {
    if (!year || !month || !day) {
        return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const formatEmailValue = (local: string, domain: string) => {
    const safeLocal = local.replace(/@/g, "").trim();
    const safeDomain = domain.replace(/@/g, "").trim();

    if (!safeLocal && !safeDomain) {
        return "";
    }

    if (!safeDomain) {
        return safeLocal;
    }

    if (!safeLocal) {
        return `@${safeDomain}`;
    }

    return `${safeLocal}@${safeDomain}`;
};

const formatPhoneValue = (first: string, middle: string, last: string) => {
    const safeFirst = first.replace(/\D/g, "").slice(0, 3);
    const safeMiddle = middle.replace(/\D/g, "").slice(0, 4);
    const safeLast = last.replace(/\D/g, "").slice(0, 4);

    return [safeFirst, safeMiddle, safeLast].filter(Boolean).join("-");
};

const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) {
        return 31;
    }

    return new Date(Number(year), Number(month), 0).getDate();
};

const includesAnyNormalized = (value: string, keywords: string[]) => {
    const normalizedValue = normalizeText(value);

    return keywords.some((keyword) =>
        normalizedValue.includes(normalizeText(keyword))
    );
};

const isSelectableDepartment = (departmentName: string) => {
    return !includesAnyNormalized(departmentName, EXCLUDED_DEPARTMENT_KEYWORDS);
};

const isSelectableGrade = (gradeName: string) => {
    return !includesAnyNormalized(gradeName, HIDDEN_GRADE_KEYWORDS);
};

const findDepartmentByName = (departments: Department[], value: string) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return undefined;
    }

    return departments.find(
        (department) => normalizeText(department.departmentName) === normalizedValue
    );
};

const findGradeByName = (grades: Grade[], value: string) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return undefined;
    }

    return grades.find((grade) => normalizeText(grade.gradeName) === normalizedValue);
};

const buildGradeOptions = (cards: HrCard[]) => {
    const gradeMap = new Map<number, Grade>();

    cards.forEach((card) => {
        const gradeName = card.gradeName?.trim();

        if (!gradeName || !Number.isFinite(card.gradeId)) {
            return;
        }

        if (!gradeMap.has(card.gradeId)) {
            gradeMap.set(card.gradeId, {
                gradeId: card.gradeId,
                gradeName,
            });
        }
    });

    return Array.from(gradeMap.values()).sort((left, right) => left.gradeId - right.gradeId);
};

const getDepartmentKey = (departmentName: string): DepartmentKey | undefined => {
    const normalizedDepartment = normalizeText(departmentName);

    if (!normalizedDepartment) {
        return undefined;
    }

    if (normalizedDepartment.includes("인사") || normalizedDepartment.includes("hr")) {
        return "HR";
    }

    if (normalizedDepartment.includes("물류") || normalizedDepartment.includes("wml")) {
        return "WML";
    }

    if (normalizedDepartment.includes("회계") || normalizedDepartment.includes("acle")) {
        return "ACLE";
    }

    return undefined;
};

const getGradeGroup = (gradeName: string): GradeGroup | undefined => {
    const normalizedGrade = normalizeText(gradeName);

    if (!normalizedGrade) {
        return undefined;
    }

    if (
        ["임원", "사장", "부사장", "상무"].some((keyword) =>
            normalizedGrade.includes(normalizeText(keyword))
        )
    ) {
        return "EXECUTIVE";
    }

    if (
        ["팀장", "부장"].some((keyword) =>
            normalizedGrade.includes(normalizeText(keyword))
        )
    ) {
        return "LEAD";
    }

    if (
        ["사원", "대리", "과장"].some((keyword) =>
            normalizedGrade.includes(normalizeText(keyword))
        )
    ) {
        return "STAFF";
    }

    return undefined;
};

const getRoleOption = (departmentName: string, gradeName: string) => {
    const gradeGroup = getGradeGroup(gradeName);

    if (!gradeGroup) {
        return undefined;
    }

    if (gradeGroup === "EXECUTIVE") {
        return ROLE_OPTIONS.EXECUTIVE;
    }

    const departmentKey = getDepartmentKey(departmentName);

    if (!departmentKey) {
        return undefined;
    }

    return ROLE_OPTIONS[`${departmentKey}:${gradeGroup}`];
};

const DateSelectInput = ({
    value,
    onChange,
    minYear,
    maxYear,
    calendarLabel,
}: DateSelectInputProps) => {
    const parsedValue = useMemo(() => getDateParts(value), [value]);
    const [parts, setParts] = useState<DateParts>(parsedValue);
    const dateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setParts(parsedValue);
    }, [parsedValue]);

    const yearOptions = useMemo(() => {
        return Array.from(
            { length: maxYear - minYear + 1 },
            (_, index) => String(maxYear - index)
        );
    }, [maxYear, minYear]);

    const monthOptions = useMemo(() => {
        return Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
    }, []);

    const dayOptions = useMemo(() => {
        const dayCount = getDaysInMonth(parts.year, parts.month);
        return Array.from({ length: dayCount }, (_, index) =>
            String(index + 1).padStart(2, "0")
        );
    }, [parts.month, parts.year]);

    const updatePart = (key: keyof DateParts, nextValue: string) => {
        setParts((prev) => {
            const nextParts = { ...prev, [key]: nextValue };

            if (
                (key === "year" || key === "month") &&
                nextParts.day &&
                Number(nextParts.day) > getDaysInMonth(nextParts.year, nextParts.month)
            ) {
                nextParts.day = "";
            }

            onChange(formatDateValue(nextParts));
            return nextParts;
        });
    };

    const openNativePicker = () => {
        const input = dateInputRef.current;

        if (!input) {
            return;
        }

        const pickerInput = input as HTMLInputElement & {
            showPicker?: () => void;
        };

        if (pickerInput.showPicker) {
            pickerInput.showPicker();
            return;
        }

        input.focus();
        input.click();
    };

    return (
        <div className="hrCardAddModal-dateRow">
            <div className="hrCardAddModal-dateBox">
                <select
                    className="hrCardAddModal-dateSelect"
                    value={parts.year}
                    onChange={(event) => updatePart("year", event.target.value)}
                    aria-label="연도"
                >
                    <option value="">연도</option>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <span className="hrCardAddModal-dateArrow" aria-hidden="true">
                    v
                </span>
            </div>

            <span className="hrCardAddModal-dateDivider">/</span>

            <div className="hrCardAddModal-dateBox">
                <select
                    className="hrCardAddModal-dateSelect"
                    value={parts.month}
                    onChange={(event) => updatePart("month", event.target.value)}
                    aria-label="월"
                >
                    <option value="">월</option>
                    {monthOptions.map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
                <span className="hrCardAddModal-dateArrow" aria-hidden="true">
                    v
                </span>
            </div>

            <span className="hrCardAddModal-dateDivider">/</span>

            <div className="hrCardAddModal-dateBox">
                <select
                    className="hrCardAddModal-dateSelect"
                    value={parts.day}
                    onChange={(event) => updatePart("day", event.target.value)}
                    aria-label="일"
                >
                    <option value="">일</option>
                    {dayOptions.map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                    ))}
                </select>
                <span className="hrCardAddModal-dateArrow" aria-hidden="true">
                    v
                </span>
            </div>

            <div className="hrCardAddModal-dateCalendarWrap">
                <input
                    ref={dateInputRef}
                    className="hrCardAddModal-dateNativeInput"
                    type="date"
                    value={value}
                    min={`${minYear}-01-01`}
                    max={`${maxYear}-12-31`}
                    onChange={(event) => onChange(event.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                />
                <button
                    type="button"
                    className="hrCardAddModal-dateCalendarButton"
                    onClick={openNativePicker}
                    aria-label={calendarLabel}
                >
                    <svg
                        className="hrCardAddModal-dateCalendarIcon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                        <path d="M7.5 3.5v3" />
                        <path d="M16.5 3.5v3" />
                        <path d="M3.5 9.5h17" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const HrCardAddModal = ({ isOpen, onClose }: Props) => {
    const [form, setForm] = useState<HrCardFormState>(initialForm);
    const addHrCard = useHrCardAdd();
    const queryClient = useQueryClient();

    const { data: departmentOptions = [] } = useQuery<Department[]>({
        queryKey: DEPARTMENT_QUERY_KEY,
        enabled: isOpen,
        queryFn: async () => {
            const response = await axios.get<DepartmentResponse>(DEPARTMENT_API_BASE, {
                withCredentials: true,
            });

            return Array.isArray(response.data)
                ? response.data
                : response.data.content ?? [];
        },
    });

    const { data: gradeOptions = [] } = useQuery<Grade[]>({
        queryKey: GRADE_QUERY_KEY,
        enabled: isOpen,
        initialData: () => {
            const cachedCards = queryClient.getQueryData<HrCard[]>(HR_CARD_LIST_QUERY_KEY);
            return cachedCards ? buildGradeOptions(cachedCards) : undefined;
        },
        queryFn: async () => {
            const response = await axios.get<HrCard[]>(HR_CARD_API_BASE, {
                withCredentials: true,
            });

            return buildGradeOptions(response.data ?? []);
        },
    });

    const searchableDepartments = useMemo(() => {
        return departmentOptions
            .filter(
                (department) =>
                    department.departmentIsUse !== 0 &&
                    department.departmentName?.trim() &&
                    isSelectableDepartment(department.departmentName)
            )
            .sort((left, right) =>
                left.departmentName.localeCompare(right.departmentName, "ko")
            );
    }, [departmentOptions]);

    const searchableGrades = useMemo(() => {
        return gradeOptions
            .filter(
                (grade) => grade.gradeName?.trim() && isSelectableGrade(grade.gradeName)
            )
            .sort((left, right) => left.gradeId - right.gradeId);
    }, [gradeOptions]);

    const emailParts = useMemo(() => getEmailParts(form.email), [form.email]);
    const phoneParts = useMemo(() => getPhoneParts(form.phone), [form.phone]);
    const selectedRole = useMemo(() => {
        return getRoleOption(form.departmentName, form.gradeName);
    }, [form.departmentName, form.gradeName]);

    useEffect(() => {
        if (!isOpen) {
            setForm(initialForm);
        }
    }, [isOpen]);

    useEffect(() => {
        const nextRoleId = selectedRole ? String(selectedRole.roleId) : "";

        setForm((prev) => {
            if (prev.roleId === nextRoleId) {
                return prev;
            }

            return {
                ...prev,
                roleId: nextRoleId,
            };
        });
    }, [selectedRole]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        if (name === "departmentName") {
            const matchedDepartment = findDepartmentByName(searchableDepartments, value);

            setForm((prev) => ({
                ...prev,
                departmentName: matchedDepartment ? matchedDepartment.departmentName : value,
                departmentId: matchedDepartment ? String(matchedDepartment.departmentId) : "",
            }));
            return;
        }

        if (name === "gradeName") {
            const matchedGrade = findGradeByName(searchableGrades, value);

            setForm((prev) => ({
                ...prev,
                gradeName: matchedGrade ? matchedGrade.gradeName : value,
                gradeId: matchedGrade ? String(matchedGrade.gradeId) : "",
            }));
            return;
        }

        if (name === "departmentId" || name === "gradeId" || name === "roleId") {
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const payload: Partial<HrCard> = {
                employeeId: form.employeeId.trim(),
                userName: form.userName.trim(),
                password: form.password.trim(),
                birth: toNullable(form.birth),
                roleId: toRequiredNumber(form.roleId, "권한 코드"),
                departmentId: toRequiredNumber(form.departmentId, "부서 코드"),
                departmentName: toNullable(form.departmentName),
                gradeId: toRequiredNumber(form.gradeId, "직급 코드"),
                gradeName: toNullable(form.gradeName),
                email: toNullable(form.email),
                startDate: toNullable(form.startDate) ?? undefined,
                phone: toNullable(form.phone),
                bank: toNullable(form.bank),
                accountNum: toNullable(form.accountNum),
                address: toNullable(form.address),
                performance: toNullable(form.performance),
            };

            await addHrCard.mutateAsync(payload);
            onClose();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "인사카드 등록에 실패했습니다.";

            console.error(error);
            alert(message);
        }
    };

    const updateEmail = (nextLocal: string, nextDomain: string) => {
        setForm((prev) => ({
            ...prev,
            email: formatEmailValue(nextLocal, nextDomain),
        }));
    };

    const updatePhone = (part: keyof PhoneParts, nextValue: string) => {
        const nextParts = {
            ...phoneParts,
            [part]: nextValue,
        };

        setForm((prev) => ({
            ...prev,
            phone: formatPhoneValue(nextParts.first, nextParts.middle, nextParts.last),
        }));
    };

    const handleSearchAddress = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                let fullAddress = data.address;
                let extraAddress = "";

                if (data.addressType === "R") {
                    if (data.bname) {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName) {
                        extraAddress += extraAddress
                            ? `, ${data.buildingName}`
                            : data.buildingName;
                    }
                    if (extraAddress) {
                        fullAddress += ` (${extraAddress})`;
                    }
                }

                setForm((prev) => ({
                    ...prev,
                    address: fullAddress,
                }));
            },
        }).open();
    };

    const roleHintText = selectedRole
        ? `${selectedRole.code} / ${selectedRole.label}`
        : "부서와 직급을 선택하면 권한 코드가 자동 입력됩니다.";

    return (
        <div className="hrCardAddModal-backdrop" onClick={onClose}>

            <div
                className="hrCardAddModal-panel"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="hrCardAddModal-min-title">
                    <p className="hrCardAddModal-min-text" >인사카드</p>
                    <button
                        type="button"
                        className="hrCardAddModal-closeButton"
                        onClick={onClose}
                    >
                        x
                    </button>
                </div>
                <div className="hrCardAddModal-header">

                    <h2 className="hrCardAddModal-title">인사카드 등록</h2>

                </div>

                <form className="hrCardAddModal-form" onSubmit={handleSubmit}>
                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">사번번호</label>
                            <input
                                className="hrCardAddModal-input"
                                name="employeeId"
                                type="text"
                                value={form.employeeId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">권한 코드</label>
                            <input
                                className="hrCardAddModal-input hrCardAddModal-input--readonly"
                                name="roleId"
                                type="text"
                                value={form.roleId}
                                readOnly
                                required
                                title="부서와 직급 선택 결과로 자동 입력됩니다."
                            />
                            <span className="hrCardAddModal-hint">{roleHintText}</span>
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">성명</label>
                            <input
                                className="hrCardAddModal-input"
                                name="userName"
                                type="text"
                                value={form.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">비밀번호</label>
                            <input
                                className="hrCardAddModal-input"
                                name="password"
                                type="text"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">부서</label>
                            <input
                                className="hrCardAddModal-input"
                                name="departmentName"
                                type="text"
                                placeholder="부서를 선택하세요"
                                value={form.departmentName}
                                list={DEPARTMENT_DATALIST_ID}
                                autoComplete="off"
                                onChange={handleChange}
                                required
                            />
                            <datalist id={DEPARTMENT_DATALIST_ID}>
                                {searchableDepartments.map((department) => (
                                    <option
                                        key={department.departmentId}
                                        value={department.departmentName}
                                    />
                                ))}
                            </datalist>
                            <span className="hrCardAddModal-hint">
                                부서를 선택하면 코드가 자동으로 입력됩니다.
                            </span>
                        </div>

                        <div className="hrCardAddModal-field hrCardAddModal-field--small">
                            <label className="hrCardAddModal-label">부서 코드</label>
                            <input
                                className="hrCardAddModal-input hrCardAddModal-input--readonly"
                                name="departmentId"
                                type="text"
                                value={form.departmentId}
                                readOnly
                                required
                                title="선택한 부서에 따라 자동 입력됩니다."
                            />
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">직급/직책</label>
                            <input
                                className="hrCardAddModal-input"
                                name="gradeName"
                                type="text"
                                placeholder="직급을 선택하세요"
                                value={form.gradeName}
                                list={GRADE_DATALIST_ID}
                                autoComplete="off"
                                onChange={handleChange}
                                required
                            />
                            <datalist id={GRADE_DATALIST_ID}>
                                {searchableGrades.map((grade) => (
                                    <option
                                        key={grade.gradeId}
                                        value={grade.gradeName}
                                    />
                                ))}
                            </datalist>
                            <span className="hrCardAddModal-hint">
                                직급을 선택하면 코드가 자동으로 입력됩니다.
                            </span>
                        </div>

                        <div className="hrCardAddModal-field hrCardAddModal-field--small">
                            <label className="hrCardAddModal-label">직급 코드</label>
                            <input
                                className="hrCardAddModal-input hrCardAddModal-input--readonly"
                                name="gradeId"
                                type="text"
                                value={form.gradeId}
                                readOnly
                                required
                                title="선택한 직급에 따라 자동 입력됩니다."
                            />
                        </div>
                    </div>

                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">이메일</label>
                            <div className="hrCardAddModal-emailRow">
                                <input
                                    className="hrCardAddModal-input"
                                    type="text"
                                    value={emailParts.local}
                                    onChange={(event) =>
                                        updateEmail(event.target.value, emailParts.domain)
                                    }
                                    placeholder="id"
                                    inputMode="email"
                                />
                                <span className="hrCardAddModal-emailAt">@</span>
                                <input
                                    className="hrCardAddModal-input"
                                    type="text"
                                    value={emailParts.domain}
                                    onChange={(event) =>
                                        updateEmail(emailParts.local, event.target.value)
                                    }
                                    placeholder="domain.com"
                                    inputMode="email"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">입사일</label>
                            <DateSelectInput
                                value={form.startDate}
                                onChange={(nextValue) =>
                                    setForm((prev) => ({ ...prev, startDate: nextValue }))
                                }
                                minYear={CURRENT_YEAR - 30}
                                maxYear={CURRENT_YEAR + 5}
                                calendarLabel="입사일 달력 열기"
                            />
                        </div>
                    </div>

                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">전화번호</label>
                            <div className="hrCardAddModal-phoneRow">
                                <div className="hrCardAddModal-phoneBox hrCardAddModal-phoneBox--short">
                                    <input
                                        className="hrCardAddModal-input"
                                        type="tel"
                                        value={phoneParts.first}
                                        onChange={(event) =>
                                            updatePhone("first", event.target.value)
                                        }
                                        inputMode="numeric"
                                        maxLength={3}
                                        placeholder="010"
                                    />
                                </div>
                                <span className="hrCardAddModal-phoneDash">-</span>
                                <div className="hrCardAddModal-phoneBox">
                                    <input
                                        className="hrCardAddModal-input"
                                        type="tel"
                                        value={phoneParts.middle}
                                        onChange={(event) =>
                                            updatePhone("middle", event.target.value)
                                        }
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="1234"
                                    />
                                </div>
                                <span className="hrCardAddModal-phoneDash">-</span>
                                <div className="hrCardAddModal-phoneBox">
                                    <input
                                        className="hrCardAddModal-input"
                                        type="tel"
                                        value={phoneParts.last}
                                        onChange={(event) =>
                                            updatePhone("last", event.target.value)
                                        }
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="5678"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">계좌번호</label>
                            <input
                                className="hrCardAddModal-input"
                                name="accountNum"
                                type="text"
                                value={form.accountNum}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="hrCardAddModal-row">
                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">은행</label>
                            <input
                                className="hrCardAddModal-input"
                                name="bank"
                                type="text"
                                value={form.bank}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="hrCardAddModal-field">
                            <label className="hrCardAddModal-label">예금주</label>
                            <input
                                className="hrCardAddModal-input"
                                name="accountOwner"
                                type="text"
                                value={form.accountOwner}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="hrCardAddModal-column">
                        <label className="hrCardAddModal-label">생년월일</label>
                        <DateSelectInput
                            value={form.birth}
                            onChange={(nextValue) =>
                                setForm((prev) => ({ ...prev, birth: nextValue }))
                            }
                            minYear={1950}
                            maxYear={CURRENT_YEAR}
                            calendarLabel="생년월일 달력 열기"
                        />
                    </div>

                    <div className="hrCardAddModal-column">
                        <label className="hrCardAddModal-label">주소</label>
                        <div className="hrCardAddModal-addressRow">
                            <input
                                className="hrCardAddModal-input"
                                name="address"
                                type="text"
                                value={form.address}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="hrCardAddModal-addressButton"
                                onClick={handleSearchAddress}
                            >
                                주소검색
                            </button>
                        </div>
                    </div>

                    <div className="hrCardAddModal-column">
                        <label className="hrCardAddModal-label">인사평가</label>
                        <textarea
                            className="hrCardAddModal-textarea"
                            name="performance"
                            value={form.performance}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="hrCardAddModal-buttonRow">
                        <button
                            type="button"
                            className="hrCardAddModal-button hrCardAddModal-button--secondary"
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="hrCardAddModal-button hrCardAddModal-button--primary"
                            disabled={addHrCard.isPending}
                        >
                            {addHrCard.isPending ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HrCardAddModal;
