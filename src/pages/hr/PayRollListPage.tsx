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
import PayRollUpdateModal from "../../components/hr/PayRollUpdateModal.tsx";
import PayRollTable, {
    type PayRollTableAction,
    type PayRollTableRow,
} from "../../components/hr/PayRollTable.tsx";
import { useAuthStore } from "../../stores/useAuthStore";

const ITEMS_PER_PAGE = 10;
const PAYROLL_VENDOR_ID = 11;

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
    createdDateValue: number | null;
    payDateValue: number | null;
    totalAmountValue: number;
    transactionIds: number[];
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

const getTransactionId = (record: Record<string, unknown>) =>
    getNumberValue(record, "transactionId", "transaction_id");

const getVendorId = (record: Record<string, unknown>) =>
    getNumberValue(record, "vendorId", "vendor_id");

const getEmployeeKey = (record: Record<string, unknown>) => {
    const employeeId = getStringValue(record, "employeeId", "employee_id");

    if (employeeId !== "") {
        return `employee:${employeeId}`;
    }

    const userId = getNumberValue(record, "userId", "user_id");

    if (userId !== undefined) {
        return `user:${userId}`;
    }

    return "";
};

const parseIsoDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
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

const formatAmount = (amount: number) => amount.toLocaleString("ko-KR");

const toDateValue = (value: string) => {
    if (value.trim() === "") {
        return null;
    }

    const digits = value.replaceAll("-", "");
    const parsed = Number(digits);

    return Number.isFinite(parsed) ? parsed : null;
};

const toFormattedDateValue = (date: Date | undefined) => {
    if (!date) {
        return null;
    }

    return Number(formatDateValue(date).replaceAll("/", ""));
};

const getCreatedAtDate = (record: Record<string, unknown>) => {
    const createdAtText = getStringValue(
        record,
        "createdAt",
        "created_at",
        "transaction_created_at",
        "salary_ledger_created_at",
        "salary_created_at"
    );

    return createdAtText ? parseIsoDate(createdAtText) : undefined;
};

const getUpdatedAtDate = (record: Record<string, unknown>) => {
    const updatedAtText = getStringValue(
        record,
        "updatedAt",
        "updated_at",
        "transaction_updated_at",
        "salary_ledger_updated_at",
        "salary_updated_at"
    );

    return updatedAtText ? parseIsoDate(updatedAtText) : undefined;
};

const isSummaryMemoRecord = (record: Record<string, unknown>) =>
    getStringValue(record, "transactionMemo", "transaction_memo").includes("총합");

const buildRows = (cards: PayRollRecord[]) => {
    const groupedRows = new Map<
        number,
        {
            id: number;
            yearMonth: string;
            ledgerName: string;
            createdDateValue: number | null;
            payDate: string;
            payDateValue: number | null;
            employeeCount: number;
            employeeKeys: Set<string>;
            transactionIds: number[];
            totalAmountValue: number;
            status: string;
        }
    >();

    for (const card of cards) {
        const record = card as LoosePayRoll;

        if (getVendorId(record) !== PAYROLL_VENDOR_ID) {
            continue;
        }

        if (isSummaryMemoRecord(record)) {
            continue;
        }

        const employeeKey = getEmployeeKey(record);

        if (employeeKey === "") {
            continue;
        }

        const createdAt = getCreatedAtDate(record);
        const updatedAt = getUpdatedAtDate(record);
        const createdDateValue = toFormattedDateValue(createdAt);
        const payDateValue = toFormattedDateValue(updatedAt);
        const transactionId = getTransactionId(record);
        const groupId = createdDateValue ?? transactionId;

        if (groupId === undefined) {
            continue;
        }

        const createdDateLabel = formatDateValue(createdAt);
        const ledgerName =
            getStringValue(record, "transactionMemo", "transaction_memo") ||
            (createdDateLabel === "-" ? "급여" : `${createdDateLabel} 급여`);
        const payDate = formatDateValue(updatedAt);
        const amount =
            getNumberValue(record, "salaryAmount", "salary_amount") ??
            getNumberValue(record, "transactionPrice", "transaction_price") ??
            0;
        const status =
            getStringValue(
                record,
                "salaryStatus",
                "salary_status",
                "transactionType",
                "transaction_type"
            ) || "-";

        const currentRow = groupedRows.get(groupId);

        if (!currentRow) {
            groupedRows.set(groupId, {
                id: groupId,
                yearMonth: createdDateLabel,
                ledgerName,
                createdDateValue,
                payDate,
                payDateValue,
                employeeCount: 1,
                employeeKeys: new Set([employeeKey]),
                transactionIds: transactionId === undefined ? [] : [transactionId],
                totalAmountValue: amount,
                status,
            });
            continue;
        }

        if (!currentRow.employeeKeys.has(employeeKey)) {
            currentRow.employeeKeys.add(employeeKey);
            currentRow.employeeCount += 1;
        }

        currentRow.totalAmountValue += amount;

        if (transactionId !== undefined) {
            currentRow.transactionIds.push(transactionId);
        }

        if (currentRow.payDate === "-" && payDate !== "-") {
            currentRow.payDate = payDate;
            currentRow.payDateValue = payDateValue;
        }

        if (currentRow.status === "-" && status !== "-") {
            currentRow.status = status;
        }
    }

    return [...groupedRows.values()]
        .map<PayRollListRow>((row) => ({
            id: row.id,
            yearMonth: row.yearMonth,
            ledgerName: row.ledgerName,
            createdDateValue: row.createdDateValue,
            payDate: row.payDate,
            payDateValue: row.payDateValue,
            employeeCount: row.employeeCount,
            totalAmount: formatAmount(row.totalAmountValue),
            totalAmountValue: row.totalAmountValue,
            transactionIds: row.transactionIds,
            status: row.status,
            departmentText: "",
            searchText: [row.yearMonth, row.ledgerName, row.payDate, row.status]
                .filter(Boolean)
                .join(" "),
        }))
        .sort((left, right) => {
            const dateDiff = (right.createdDateValue ?? 0) - (left.createdDateValue ?? 0);

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
    const [isPayRollModalOpen, setIsPayRollModalOpen] = useState(false);
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
                (item.createdDateValue !== null && item.createdDateValue >= startDateValue);

            const matchesEndDate =
                endDateValue === null ||
                (item.createdDateValue !== null && item.createdDateValue <= endDateValue);

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

    const selectedLedgerRecords = useMemo(() => {
        if (activeSelectedLedgerId === null) {
            return [];
        }

        return cards.filter((card) => {
            const record = card as LoosePayRoll;

            return (
                getVendorId(record) === PAYROLL_VENDOR_ID &&
                toFormattedDateValue(getCreatedAtDate(record)) === activeSelectedLedgerId
            );
        });
    }, [cards, activeSelectedLedgerId]);

    const selectedPayrollLabel = useMemo(() => {
        return selectedLedger?.ledgerName ?? "급여";
    }, [selectedLedger]);

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

    const handleOpenPayRollModal = (ledgerId: number) => {
        setSelectedLedgerId(ledgerId);
        setIsPayRollModalOpen(true);
    };

    const actionMessages: Record<Exclude<PayRollTableAction, "view">, string> = {
        edit: "수정 기능은 아직 연결되지 않았습니다.",
        cancelConfirm: "확정취소 기능은 아직 연결되지 않았습니다.",
        createVoucher: "전표생성 기능은 아직 연결되지 않았습니다.",
    };

    const handleTableAction = (action: PayRollTableAction, ledgerId: number) => {
        setSelectedLedgerId(ledgerId);

        if (action === "view") {
            setIsPayRollModalOpen(true);
            return;
        }

        window.alert(actionMessages[action]);
    };

    const handleClosePayRollModal = () => {
        setIsPayRollModalOpen(false);
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
        const targetTransactionIds = activeSelectedLedgerIds.flatMap((ledgerId) => {
            const item = items.find((row) => row.id === ledgerId);
            return item?.transactionIds ?? [];
        });

        if (targetTransactionIds.length === 0 || isDeleting) {
            return;
        }

        if (!canDeletePayRoll) {
            window.alert("HR 관리자만 급여 대장을 삭제할 수 있습니다.");
            return;
        }

        const confirmed = window.confirm(
            `선택한 급여 ${targetTransactionIds.length}건을 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await Promise.all(
                targetTransactionIds.map((transactionId) =>
                    deletePayRoll.mutateAsync(transactionId)
                )
            );

            await queryClient.invalidateQueries({
                queryKey: ["PayRollList"],
            });

            setSelectedLedgerIds([]);

            if (
                activeSelectedLedgerId !== null &&
                activeSelectedLedgerIds.includes(activeSelectedLedgerId)
            ) {
                setSelectedLedgerId(null);
                setIsPayRollModalOpen(false);
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
                        placeholder="대장명 입력"
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
                            선택됨 {selectedLedger.ledgerName}
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
                        onSelectItem={handleOpenPayRollModal}
                        onAction={handleTableAction}
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

            <PayRollUpdateModal
                isOpen={isPayRollModalOpen && activeSelectedLedgerId !== null}
                onClose={handleClosePayRollModal}
                payrollLabel={selectedPayrollLabel}
                records={selectedLedgerRecords}
            />
        </div>
    );
};

export default PayRollListPage;
