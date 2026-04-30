import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaStar } from "react-icons/fa";
import {
    type PayRollRecord,
    useDeletePayRoll,
    useGetPayRollList,
} from "../../apis/hr/PayLollService.tsx";
import "../../assets/styles/hr/payRollList.css";
import PayRollTable, {
    type PayRollTableRow,
} from "../../components/hr/PayRollTable.tsx";
import { useAuthStore } from "../../stores/useAuthStore";

const ITEMS_PER_PAGE = 10;

type FilterChipInputProps = {
    label: string;
    placeholder: string;
    draftValue: string;
    appliedValue: string;
    onDraftChange: (value: string) => void;
    onClear: () => void;
    onSubmit: () => void;
};

type LoosePayRoll = PayRollRecord & Record<string, unknown>;

type PayRollListRow = PayRollTableRow & {
    payDateValue: number | null;
    totalAmountValue: number;
    departmentText: string;
    searchText: string;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const includesText = (source: string | number | undefined, keyword: string) =>
    normalizeText(String(source ?? "")).includes(normalizeText(keyword));

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

    return undefined;
};

const parseIsoDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed;
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

const formatDateValue = (date: Date | undefined) => {
    if (!date) {
        return "-";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
};

const formatYearMonth = (date: Date | undefined) => {
    if (!date) {
        return "-";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}/${month}`;
};

const formatAmount = (amount: number) => amount.toLocaleString("ko-KR");

const toDateValue = (value: string) => {
    if (value.trim() === "") {
        return null;
    }

    const digits = value.replaceAll("-", "");
    const parsed = Number(digits);

    return Number.isFinite(parsed) ? parsed : null;
};

const buildRows = (cards: PayRollRecord[]) => {
    const groupedRows = new Map<
        number,
        {
            id: number;
            yearMonth: string;
            ledgerName: string;
            payDate: string;
            payDateValue: number | null;
            employeeIds: Set<number>;
            employeeNames: Set<string>;
            employeeNumbers: Set<string>;
            departmentNames: Set<string>;
            fallbackCount: number;
            totalAmountValue: number;
            status: string;
        }
    >();

    for (const card of cards) {
        const record = card as LoosePayRoll;
        const ledgerId = getNumberValue(
            record,
            "salaryLedgerId",
            "salary_ledger_id",
            "transactionId",
            "transaction_id"
        );

        if (ledgerId === undefined) {
            continue;
        }

        const salaryDateNumber = getNumberValue(record, "salaryDate", "salary_date");
        const fallbackDateText = getStringValue(
            record,
            "salary_ledger_created_at",
            "transaction_created_at",
            "salary_created_at"
        );
        const payDate =
            parseCompactDate(salaryDateNumber) ||
            (fallbackDateText ? parseIsoDate(fallbackDateText) : undefined);
        const payDateValue = payDate
            ? Number(formatDateValue(payDate).replaceAll("/", ""))
            : null;
        const yearMonth = formatYearMonth(payDate);
        const ledgerName =
            getStringValue(record, "transactionMemo", "transaction_memo") ||
            (yearMonth === "-" ? "Payroll Ledger" : `${yearMonth} Payroll`);
        const status =
            getStringValue(record, "salaryStatus", "salary_status") || "Pending";
        const amount =
            getNumberValue(record, "salaryAmount", "salary_amount") ??
            getNumberValue(record, "transactionPrice", "transaction_price") ??
            0;
        const userId = getNumberValue(record, "userId", "user_id");
        const userName = getStringValue(record, "userName", "user_name");
        const employeeNumber = getStringValue(record, "employeeId", "employee_id");
        const departmentName = getStringValue(record, "departmentName", "department_name");

        const currentRow = groupedRows.get(ledgerId);

        if (!currentRow) {
            groupedRows.set(ledgerId, {
                id: ledgerId,
                yearMonth,
                ledgerName,
                payDate: formatDateValue(payDate),
                payDateValue,
                employeeIds:
                    userId === undefined
                        ? new Set<number>()
                        : new Set<number>([userId]),
                employeeNames: userName ? new Set<string>([userName]) : new Set<string>(),
                employeeNumbers: employeeNumber
                    ? new Set<string>([employeeNumber])
                    : new Set<string>(),
                departmentNames: departmentName
                    ? new Set<string>([departmentName])
                    : new Set<string>(),
                fallbackCount: 1,
                totalAmountValue: amount,
                status,
            });
            continue;
        }

        if (userId !== undefined) {
            currentRow.employeeIds.add(userId);
        } else {
            currentRow.fallbackCount += 1;
        }

        if (userName) {
            currentRow.employeeNames.add(userName);
        }

        if (employeeNumber) {
            currentRow.employeeNumbers.add(employeeNumber);
        }

        if (departmentName) {
            currentRow.departmentNames.add(departmentName);
        }

        currentRow.totalAmountValue += amount;

        if (currentRow.payDateValue === null && payDateValue !== null) {
            currentRow.payDateValue = payDateValue;
            currentRow.payDate = formatDateValue(payDate);
            currentRow.yearMonth = yearMonth;
        }

        if (currentRow.ledgerName === "Payroll Ledger" && ledgerName !== "Payroll Ledger") {
            currentRow.ledgerName = ledgerName;
        }

        if (currentRow.status === "Pending" && status !== "Pending") {
            currentRow.status = status;
        }
    }

    return [...groupedRows.values()]
        .map<PayRollListRow>((row) => {
            const departmentText = [...row.departmentNames].join(" ");
            const searchText = [
                row.ledgerName,
                row.yearMonth,
                row.status,
                departmentText,
                [...row.employeeNames].join(" "),
                [...row.employeeNumbers].join(" "),
            ]
                .filter(Boolean)
                .join(" ");

            return {
                id: row.id,
                yearMonth: row.yearMonth,
                ledgerName: row.ledgerName,
                payDate: row.payDate,
                payDateValue: row.payDateValue,
                employeeCount:
                    row.employeeIds.size > 0 ? row.employeeIds.size : row.fallbackCount,
                totalAmount: formatAmount(row.totalAmountValue),
                totalAmountValue: row.totalAmountValue,
                status: row.status,
                departmentText,
                searchText,
            };
        })
        .sort((left, right) => {
            const dateDiff = (right.payDateValue ?? 0) - (left.payDateValue ?? 0);

            if (dateDiff !== 0) {
                return dateDiff;
            }

            return right.id - left.id;
        });
};

const FilterChipInput = ({
    label,
    placeholder,
    draftValue,
    appliedValue,
    onDraftChange,
    onClear,
    onSubmit,
}: FilterChipInputProps) => {
    const hasAppliedValue = appliedValue.trim() !== "";
    const hasAnyValue = hasAppliedValue || draftValue.trim() !== "";

    const handleClear = () => {
        if (hasAppliedValue) {
            onClear();
            return;
        }

        onDraftChange("");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onSubmit();
        }
    };

    return (
        <div className="payRollListPage-filter-group">
            <label>{label}</label>
            <div className={`payRollListPage-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="payRollListPage-chip-input-icon" aria-hidden="true" />

                {hasAppliedValue && (
                    <span className="payRollListPage-chip">
                        <span>{appliedValue}</span>
                        <button type="button" className="payRollListPage-chip-x" onClick={onClear}>
                            x
                        </button>
                    </span>
                )}

                <input
                    type="text"
                    placeholder={hasAppliedValue ? "" : placeholder}
                    value={hasAppliedValue ? "" : draftValue}
                    onChange={(event) => onDraftChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    className="payRollListPage-chip-clear"
                    aria-label={`${label} 초기화`}
                    onClick={handleClear}
                    disabled={!hasAnyValue}
                >
                    x
                </button>
            </div>
        </div>
    );
};

const PayRollListPage = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { data: cards = [], isLoading, isError } = useGetPayRollList();
    const deletePayRoll = useDeletePayRoll();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);
    const [selectedLedgerIds, setSelectedLedgerIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStarred, setIsStarred] = useState(false);
    const [keywordDraft, setKeywordDraft] = useState("");
    const [departmentDraft, setDepartmentDraft] = useState("");
    const [keywordFilter, setKeywordFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [startDateDraft, setStartDateDraft] = useState("");
    const [endDateDraft, setEndDateDraft] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const items = useMemo(() => buildRows(cards), [cards]);
    const canDeletePayRoll = user?.roleId === 2;
    const validLedgerIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
    const activeSelectedLedgerId =
        selectedLedgerId !== null && validLedgerIds.has(selectedLedgerId)
            ? selectedLedgerId
            : null;
    const activeSelectedLedgerIds = useMemo(
        () => selectedLedgerIds.filter((ledgerId) => validLedgerIds.has(ledgerId)),
        [selectedLedgerIds, validLedgerIds]
    );

    const filteredItems = useMemo(() => {
        const startDateValue = toDateValue(startDateFilter);
        const endDateValue = toDateValue(endDateFilter);

        return items.filter((item) => {
            const matchesKeyword =
                keywordFilter.trim() === "" || includesText(item.searchText, keywordFilter);

            const matchesDepartment =
                departmentFilter.trim() === "" ||
                includesText(item.departmentText, departmentFilter);

            const matchesStartDate =
                startDateValue === null ||
                (item.payDateValue !== null && item.payDateValue >= startDateValue);

            const matchesEndDate =
                endDateValue === null ||
                (item.payDateValue !== null && item.payDateValue <= endDateValue);

            return (
                matchesKeyword &&
                matchesDepartment &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [items, keywordFilter, departmentFilter, startDateFilter, endDateFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const resolvedCurrentPage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const startIndex = (resolvedCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, resolvedCurrentPage]);

    const pageNumbers = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const selectedLedger = useMemo(
        () => items.find((item) => item.id === activeSelectedLedgerId) ?? null,
        [items, activeSelectedLedgerId]
    );

    const applyFilters = () => {
        setKeywordFilter(keywordDraft.trim());
        setDepartmentFilter(departmentDraft.trim());
        setStartDateFilter(startDateDraft);
        setEndDateFilter(endDateDraft);
        setCurrentPage(1);
    };

    const clearKeywordFilter = () => {
        setKeywordDraft("");
        setKeywordFilter("");
        setCurrentPage(1);
    };

    const clearDepartmentFilter = () => {
        setDepartmentDraft("");
        setDepartmentFilter("");
        setCurrentPage(1);
    };

    const handleToggleItem = (ledgerId: number) => {
        setSelectedLedgerIds((prev) =>
            prev.includes(ledgerId)
                ? prev.filter((id) => id !== ledgerId)
                : [...prev, ledgerId]
        );
    };

    const handleToggleAll = () => {
        const visibleLedgerIds = paginatedItems.map((item) => item.id);
        const isAllSelected =
            visibleLedgerIds.length > 0 &&
            visibleLedgerIds.every((id) => activeSelectedLedgerIds.includes(id));

        setSelectedLedgerIds((prev) => {
            if (isAllSelected) {
                return prev.filter((id) => !visibleLedgerIds.includes(id));
            }

            return Array.from(new Set([...prev, ...visibleLedgerIds]));
        });
    };

    const handleDeleteSelected = async () => {
        const targetLedgerIds = activeSelectedLedgerIds;

        if (targetLedgerIds.length === 0 || isDeleting) {
            return;
        }

        if (!canDeletePayRoll) {
            window.alert("HR 관리자만 급여 대장을 삭제할 수 있습니다.");
            return;
        }

        const confirmed = window.confirm(
            `선택한 급여 ${targetLedgerIds.length}건을 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await Promise.all(
                targetLedgerIds.map((ledgerId) => deletePayRoll.mutateAsync(ledgerId))
            );

            await queryClient.invalidateQueries({
                queryKey: ["PayRollList"],
            });

            setSelectedLedgerIds([]);

            if (
                activeSelectedLedgerId !== null &&
                targetLedgerIds.includes(activeSelectedLedgerId)
            ) {
                setSelectedLedgerId(null);
            }

            window.alert("선택한 급여 대장을 삭제했습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "급여 대장을 삭제하는 동안 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearSelection = () => {
        setSelectedLedgerIds([]);
        setSelectedLedgerId(null);
    };

    return (
        <div className="payRollListPage-page">
            <div className="payRollListPage-header">
                <button
                    type="button"
                    className="payRollListPage-star"
                    aria-pressed={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    <FaStar size={18} color={isStarred ? "#f2c94c" : "#c4c4c4"} />
                </button>

                <h1 className="payRollListPage-title">급여 대장 목록</h1>

                <button
                    type="button"
                    className="payRollListPage-top-search-btn"
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                    검색 조건 {isSearchOpen ? "닫기" : "열기"}
                </button>
            </div>

            <div className={`payRollListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="payRollListPage-filter-row">
                    <div>
                        <label>일자</label>
                        <div className="payRollListPage-dateRange">
                            <input
                                type="date"
                                value={startDateDraft}
                                onChange={(event) => setStartDateDraft(event.target.value)}
                            />
                            <span>~</span>
                            <input
                                type="date"
                                value={endDateDraft}
                                onChange={(event) => setEndDateDraft(event.target.value)}
                            />
                        </div>
                    </div>

                    <FilterChipInput
                        label="부서"
                        placeholder="부서명을 입력하세요"
                        draftValue={departmentDraft}
                        appliedValue={departmentFilter}
                        onDraftChange={setDepartmentDraft}
                        onClear={clearDepartmentFilter}
                        onSubmit={applyFilters}
                    />

                    <FilterChipInput
                        label="검색어"
                        placeholder="대장명, 이름, 사번"
                        draftValue={keywordDraft}
                        appliedValue={keywordFilter}
                        onDraftChange={setKeywordDraft}
                        onClear={clearKeywordFilter}
                        onSubmit={applyFilters}
                    />
                </div>

                <div className="payRollListPage-filter-actions">
                    <button
                        type="button"
                        className="payRollListPage-search-btn"
                        onClick={applyFilters}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="payRollListPage-table-box">
                <div className="payRollListPage-table-info">
                    <span>전체 {filteredItems.length}건</span>
                    {selectedLedger && (
                        <span className="payRollListPage-selectionInfo">
                            선택됨: {selectedLedger.ledgerName}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div>급여 대장 목록을 불러오는 중입니다.</div>
                ) : isError ? (
                    <div>급여 대장 목록을 불러오지 못했습니다.</div>
                ) : (
                    <PayRollTable
                        items={paginatedItems}
                        selectedLedgerIds={activeSelectedLedgerIds}
                        onToggleItem={handleToggleItem}
                        onToggleAll={handleToggleAll}
                        onSelectItem={setSelectedLedgerId}
                    />
                )}

                <div className="payRollListPage-bottom-actions">
                    <button
                        type="button"
                        className="payRollListPage-disabled-btn"
                        disabled={
                            activeSelectedLedgerIds.length === 0 &&
                            activeSelectedLedgerId === null
                        }
                        onClick={handleClearSelection}
                    >
                        선택 해제
                    </button>

                    <button
                        type="button"
                        className="payRollListPage-disabled-btn"
                        disabled={activeSelectedLedgerIds.length === 0 || isDeleting}
                        onClick={handleDeleteSelected}
                    >
                        {isDeleting ? "삭제 중..." : "삭제"}
                    </button>
                </div>

                <div className="payRollListPage-paging-group">
                    <div className="payRollListPage-paging-group-min">
                        <button
                            type="button"
                            className="payRollListPage-paging-prev-btn"
                            onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                            disabled={resolvedCurrentPage === 1}
                        >
                            이전
                        </button>

                        {pageNumbers.map((pageNumber) => (
                            <button
                                type="button"
                                className="payRollListPage-paging-num-btn"
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                disabled={pageNumber === resolvedCurrentPage}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="payRollListPage-paging-next-btn"
                            onClick={() =>
                                setCurrentPage(Math.min(resolvedCurrentPage + 1, totalPages))
                            }
                            disabled={resolvedCurrentPage === totalPages}
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayRollListPage;
