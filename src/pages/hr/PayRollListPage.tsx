import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaStar } from "react-icons/fa";
import {
    type PayRollDateMutationPayload,
    type PayRollRecord,
    useCancelPayRollConfirm,
    useConfirmPayRollCreatedAt,
    useGetPayRollList,
} from "../../apis/hr/PayLollService.tsx";
import "../../assets/styles/hr/hrPage.css";
import PayRollAddModal from "../../components/hr/PayRollAddModal.tsx";
import PayRollInfoModal from "../../components/hr/PayRollInfoModal.tsx";
import PayRollUpdateModal from "../../components/hr/PayRollUpdateModal.tsx";
import PayRollVoucherModal from "../../components/hr/PayRollVoucherModal.tsx";
import PayRollTable, { type PayRollTableAction, type PayRollTableRow,} from "../../components/hr/PayRollTable.tsx";

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

const parseCompactDate = (value: string | number | null | undefined) => {
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

const formatAmount = (amount: number) => amount.toLocaleString("ko-KR");

const formatLocalDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

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

const getPayrollDate = (record: Record<string, unknown>) =>
    parseCompactDate(getStringValue(record, "salaryDate", "salary_date")) ??
    getCreatedAtDate(record);

const isSummaryMemoRecord = (record: Record<string, unknown>) =>
    getStringValue(record, "transactionMemo", "transaction_memo").includes("총합");

const buildDateMutationPayload = (
    record: Record<string, unknown>,
    updatedAt: string | null
): PayRollDateMutationPayload => ({
    transactionId: getNumberValue(record, "transactionId", "transaction_id"),
    vendorId: getNumberValue(record, "vendorId", "vendor_id"),
    salaryLedgerId: getNumberValue(record, "salaryLedgerId", "salary_ledger_id") ?? null,
    transactionNum: getNumberValue(record, "transactionNum", "transaction_num"),
    transactionType: getStringValue(record, "transactionType", "transaction_type"),
    transactionPrice: getNumberValue(record, "transactionPrice", "transaction_price"),
    transactionMemo: getStringValue(record, "transactionMemo", "transaction_memo"),
    createdAt:
        getStringValue(
            record,
            "createdAt",
            "created_at",
            "transaction_created_at",
            "salary_ledger_created_at",
            "salary_created_at"
        ) || null,
    created_at:
        getStringValue(
            record,
            "createdAt",
            "created_at",
            "transaction_created_at",
            "salary_ledger_created_at",
            "salary_created_at"
        ) || null,
    updatedAt,
    updated_at: updatedAt,
    clearUpdatedAt: updatedAt === null ? true : undefined,
    clear_updated_at: updatedAt === null ? true : undefined,
});

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

        const payrollDate = getPayrollDate(record);
        const updatedAt = getUpdatedAtDate(record);
        const createdDateValue = toFormattedDateValue(payrollDate);
        const payDateValue = toFormattedDateValue(updatedAt);
        const transactionId = getTransactionId(record);
        const groupId = createdDateValue ?? transactionId;

        if (groupId === undefined) {
            continue;
        }

        const createdDateLabel = formatDateValue(payrollDate);
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
        <div className="filter-group">
            <label>{label}</label>
            <div className={`chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="chip-input-icon" aria-hidden="true" />

                {hasAppliedValue && (
                    <span className="chip">
                        <span>{appliedValue}</span>
                        <button type="button" className="chip-x" onClick={onClear}>
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
                    className="chip-clear"
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
    const queryClient = useQueryClient();
    const { data: cards = [], isLoading, isError, refetch: refetchPayRollList } = useGetPayRollList();
    const cancelPayRollConfirm = useCancelPayRollConfirm();
    const confirmPayRollCreatedAt = useConfirmPayRollCreatedAt();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [activePayRollModal, setActivePayRollModal] = useState<"view" | "edit" | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);
    const [selectedLedgerIds, setSelectedLedgerIds] = useState<number[]>([]);
    const [isCancelingConfirm, setIsCancelingConfirm] = useState(false);
    const [isConfirmingPayRoll, setIsConfirmingPayRoll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStarred, setIsStarred] = useState(false);
    const [keywordDraft, setKeywordDraft] = useState("");

    //set 안써서 주석처리
    // const [departmentDraft, setDepartmentDraft] = useState("");
    const [departmentDraft] = useState("");

    const [keywordFilter, setKeywordFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [startDateDraft, setStartDateDraft] = useState("");
    const [endDateDraft, setEndDateDraft] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const items = useMemo(() => buildRows(cards), [cards]);
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

        const selectedTransactionIds = selectedLedger?.transactionIds ?? [];

        return cards.filter((card) => {
            const record = card as LoosePayRoll;
            const transactionId = getTransactionId(record);

            return (
                getVendorId(record) === PAYROLL_VENDOR_ID &&
                transactionId !== undefined &&
                selectedTransactionIds.includes(transactionId)
            );
        });
    }, [cards, activeSelectedLedgerId, selectedLedger]);

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

    // 필터 사용 안해서 없앰
    // const clearDepartmentFilter = () => {
    //     setDepartmentDraft("");
    //     setDepartmentFilter("");
    //     setCurrentPage(1);
    // };

    const handleToggleItem = (ledgerId: number) => {
        setSelectedLedgerIds((prev) =>
            prev.includes(ledgerId)
                ? prev.filter((id) => id !== ledgerId)
                : [...prev, ledgerId]
        );
    };

    const handleOpenPayRollModal = (ledgerId: number) => {
        setSelectedLedgerId(ledgerId);
        setActivePayRollModal("view");
    };

    const actionMessages: Record<Exclude<PayRollTableAction, "view" | "edit">, string> = {
        cancelConfirm: "확정취소 기능은 아직 연결되지 않았습니다.",
        createVoucher: "전표로 연결할 거래 내역이 없습니다.",
    };

    const handleCancelConfirm = async (ledgerId: number) => {
        const item = items.find((row) => row.id === ledgerId);
        const targetRecords = cards.filter((card) => {
            const transactionId = getTransactionId(card as LoosePayRoll);

            return transactionId !== undefined && item?.transactionIds.includes(transactionId);
        });

        if (targetRecords.length === 0 || isCancelingConfirm) {
            return;
        }

        const confirmed = window.confirm(
            `${item?.ledgerName ?? "선택한 급여"}의 지급일을 비워 확정을 취소하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsCancelingConfirm(true);

        try {
            for (const record of targetRecords) {
                const transactionId = getTransactionId(record as LoosePayRoll);

                if (
                    typeof transactionId !== "number" ||
                    !Number.isFinite(transactionId) ||
                    transactionId <= 0
                ) {
                    continue;
                }

                await cancelPayRollConfirm.mutateAsync({
                    transactionId,
                    payload: buildDateMutationPayload(record as LoosePayRoll, null),
                });
            }

            const canceledTransactionIds = new Set(
                targetRecords
                    .map((record) => getTransactionId(record as LoosePayRoll))
                    .filter((transactionId): transactionId is number => transactionId !== undefined)
            );

            queryClient.setQueriesData<PayRollRecord[]>(
                { queryKey: ["PayRollList"] },
                (oldData) => {
                    if (!Array.isArray(oldData)) {
                        return oldData;
                    }

                    return oldData.map((record) => {
                        const transactionId = getTransactionId(record as LoosePayRoll);

                        if (transactionId === undefined || !canceledTransactionIds.has(transactionId)) {
                            return record;
                        }

                        return {
                            ...record,
                            updatedAt: null,
                            updated_at: null,
                            transaction_updated_at: null,
                            salary_ledger_updated_at: null,
                            salary_updated_at: null,
                        } as PayRollRecord;
                    });
                }
            );

            await queryClient.invalidateQueries({
                queryKey: ["PayRollList"],
            });
            await refetchPayRollList();

            window.alert("확정취소가 완료되었습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "확정취소 처리 중 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsCancelingConfirm(false);
        }
    };

    const handleTableAction = (action: PayRollTableAction, ledgerId: number) => {
        setSelectedLedgerId(ledgerId);

        if (action === "view") {
            setActivePayRollModal("view");
            return;
        }

        if (action === "edit") {
            setActivePayRollModal("edit");
            return;
        }

        if (action === "cancelConfirm") {
            void handleCancelConfirm(ledgerId);
            return;
        }

        if (action === "createVoucher") {
            const item = items.find((row) => row.id === ledgerId);

            if (!item || item.transactionIds.length === 0) {
                window.alert(actionMessages.createVoucher);
                return;
            }

            setIsVoucherModalOpen(true);
            return;
        }

        window.alert(actionMessages[action]);
    };

    const handleClosePayRollModal = () => {
        setActivePayRollModal(null);
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

    const handleCreatePayRoll = () => {
        setIsCreateModalOpen(true);
    };

    const handleConfirmSelected = async () => {
        const targetTransactionIds = activeSelectedLedgerIds.flatMap((ledgerId) => {
            const item = items.find((row) => row.id === ledgerId);
            return item?.transactionIds ?? [];
        });

        const targetRecords = cards.filter((card) => {
            const transactionId = getTransactionId(card as LoosePayRoll);
            return transactionId !== undefined && targetTransactionIds.includes(transactionId);
        });

        if (targetRecords.length === 0 || isConfirmingPayRoll) {
            return;
        }

        const confirmed = window.confirm(
            `선택한 급여 ${targetRecords.length}건을 확정하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsConfirmingPayRoll(true);

        try {
            const now = formatLocalDateTime(new Date());

            for (const record of targetRecords) {
                const item = record as LoosePayRoll;
                const transactionId = getTransactionId(item);

                if (transactionId === undefined) {
                    continue;
                }

                await confirmPayRollCreatedAt.mutateAsync({
                    transactionId,
                    payload: buildDateMutationPayload(item, now),
                });
            }

            const confirmedTransactionIds = new Set(targetTransactionIds);

            queryClient.setQueriesData<PayRollRecord[]>(
                { queryKey: ["PayRollList"] },
                (oldData) => {
                    if (!Array.isArray(oldData)) {
                        return oldData;
                    }

                    return oldData.map((record) => {
                        const transactionId = getTransactionId(record as LoosePayRoll);

                        if (transactionId === undefined || !confirmedTransactionIds.has(transactionId)) {
                            return record;
                        }

                        return {
                            ...record,
                            updatedAt: now,
                            updated_at: now,
                            transaction_updated_at: now,
                            salary_ledger_updated_at: now,
                            salary_updated_at: now,
                        } as PayRollRecord;
                    });
                }
            );

            await queryClient.invalidateQueries({
                queryKey: ["PayRollList"],
            });
            await refetchPayRollList();
            setSelectedLedgerIds([]);

            window.alert("확정이 완료되었습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "확정 처리 중 오류가 발생했습니다.";

            console.error(error);
            window.alert(message);
        } finally {
            setIsConfirmingPayRoll(false);
        }
    };

    const handleClearSelection = () => {
        setSelectedLedgerIds([]);
        setSelectedLedgerId(null);
    };

    return (
        <>
            <div className="hrPage-page-filter">
                <div className="favorite-Header">
                    <button
                        type="button"
                        aria-pressed={isStarred}
                        onClick={() => setIsStarred((prev) => !prev)}
                    >
                        <FaStar size={18} color={isStarred ? "#f2c94c" : "#c4c4c4"} />
                    </button>
                    <span>급여대장 목록</span>
                </div>
                <div>
                    <button
                        type="button"
                        className="top-search-btn"
                        aria-expanded={isSearchOpen}
                        onClick={() => setIsSearchOpen((prev) => !prev)}
                    >
                        검색 조건 {isSearchOpen ? "닫기" : "열기"}
                    </button>
                </div>

            </div>

            <div className={`filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="filter-row">
                    <div style={{display:"flex", alignItems:"center"}}>
                        <label style={{marginRight:"16px", fontSize:"12px"}}>일자</label>
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
                        label="검색어"
                        placeholder="대장명 입력"
                        draftValue={keywordDraft}
                        appliedValue={keywordFilter}
                        onDraftChange={setKeywordDraft}
                        onClear={clearKeywordFilter}
                        onSubmit={applyFilters}
                    />
                </div>

                <div className="filter-actions">
                    <button
                        type="button"
                        className="btn-Primary"
                        onClick={applyFilters}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="payRollListPage-table-box">
                <div className="payRollListPage-table-info">
                    <span style={{fontSize:"14px"}}>전체 {filteredItems.length}건</span>
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

                <div className="btn-Wrap" style={{marginTop:"12px"}}>
                    <button
                        type="button"
                        className="btn-Primary"
                        onClick={handleCreatePayRoll}
                    >
                        신규
                    </button>

                    <button
                        type="button"
                        className="btn-Secondary"
                        disabled={activeSelectedLedgerIds.length === 0 || isConfirmingPayRoll}
                        onClick={handleConfirmSelected}
                    >
                        {isConfirmingPayRoll ? "확정 중..." : "확정"}
                    </button>

                    <button
                        type="button"
                        className="btn-Secondary"
                        disabled={
                            activeSelectedLedgerIds.length === 0 &&
                            activeSelectedLedgerId === null
                        }
                        onClick={handleClearSelection}
                    >
                        취소
                    </button>
                </div>

                <div className="payRollListPage-paging-group">
                    <div className="Page-Btn-container">
                        <button
                            type="button"
                            className="btn-Primary"
                            onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                            disabled={resolvedCurrentPage === 1}
                        >
                            이전
                        </button>

                        {pageNumbers.map((pageNumber) => (
                            <button
                                type="button"
                                className="paging-num-btn"
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                disabled={pageNumber === resolvedCurrentPage}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="btn-Primary"
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
                isOpen={activePayRollModal === "edit" && activeSelectedLedgerId !== null}
                onClose={handleClosePayRollModal}
                onUpdated={async () => {
                    await queryClient.invalidateQueries({
                        queryKey: ["PayRollList"],
                    });
                    await refetchPayRollList();
                }}
                payrollLabel={selectedPayrollLabel}
                records={selectedLedgerRecords}
            />
            <PayRollAddModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={async () => {
                    await queryClient.invalidateQueries({
                        queryKey: ["PayRollList"],
                    });
                    await refetchPayRollList();
                }}
            />
            <PayRollInfoModal
                isOpen={activePayRollModal === "view" && activeSelectedLedgerId !== null}
                onClose={handleClosePayRollModal}
                payrollLabel={selectedPayrollLabel}
                records={selectedLedgerRecords}
            />
            <PayRollVoucherModal
                isOpen={isVoucherModalOpen && activeSelectedLedgerId !== null}
                onClose={() => setIsVoucherModalOpen(false)}
                onDeleted={async () => {
                    await queryClient.invalidateQueries({
                        queryKey: ["PayRollList"],
                    });
                    await refetchPayRollList();
                    setSelectedLedgerId(null);
                    setSelectedLedgerIds([]);
                }}
                payrollLabel={selectedPayrollLabel}
                records={selectedLedgerRecords}
            />
        </>
    );
};

export default PayRollListPage;
