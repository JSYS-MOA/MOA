import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    useDeleteHrCard,
    useGetHrCardList,
    type HrCardRecord,
} from "../../apis/hr/HrCardService";
import "../../assets/styles/hr/hrCardList.css";
import HrCardAddModal from "../../components/hr/HrCardAddModal";
import HrCardUpdateModal from "../../components/hr/HrCardUpdateModal";
import HrTable from "../../components/hr/HrTable.tsx";
import { getHrGradeNameById, resolveHrGradeId } from "../../constants/hrGradeOptions";
import { useAuthStore } from "../../stores/useAuthStore";
import type { HrTableProps } from "../../types/HrTableProps";
import {FaStar} from "react-icons/fa";

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

type LooseHrCard = HrCardRecord & Record<string, unknown>;

const normalizeText = (value: string) => value.trim().toLowerCase();

const parseDateValue = (value: unknown) => {
    if (!value || typeof value !== "string") {
        return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getStringValue = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }

        if (typeof value === "number") {
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
            const parsed = Number(value);

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return undefined;
};

const includesText = (source: string | number | undefined, keyword: string) =>
    normalizeText(String(source ?? "")).includes(normalizeText(keyword));

const getGradeName = (record: Record<string, unknown>, gradeId: number) => {
    const rawGradeName = getStringValue(record, "gradeName", "grade_name");

    if (rawGradeName) {
        return rawGradeName;
    }

    return getHrGradeNameById(gradeId) || (gradeId > 0 ? `직급 ${gradeId}` : "");
};

const mapCardToRow = (card: HrCardRecord): HrTableProps | null => {
    const record = card as LooseHrCard;
    const userId = getNumberValue(record, "userId", "user_id");

    if (userId === undefined) {
        return null;
    }

    const departmentId = getNumberValue(record, "departmentId", "department_id") ?? 0;
    const rawGradeId = getNumberValue(record, "gradeId", "grade_id") ?? 0;
    const gradeId = resolveHrGradeId(rawGradeId) ?? rawGradeId;
    const departmentName =
        getStringValue(record, "departmentName", "department_name") ||
        (departmentId > 0 ? `부서 ${departmentId}` : "");

    return {
        userId,
        userName: getStringValue(record, "userName", "user_name") || `사용자 ${userId}`,
        employeeId: getStringValue(record, "employeeId", "employee_id"),
        phone: getStringValue(record, "phone"),
        email: getStringValue(record, "email"),
        address: getStringValue(record, "address"),
        startDate: parseDateValue(record.startDate ?? record.start_date) ?? new Date(0),
        quitDate: parseDateValue(record.quitDate ?? record.quit_date),
        departmentId,
        departmentName,
        gradeId,
        gradeName: getGradeName(record, gradeId),
        birth: parseDateValue(record.birth),
        performance: getStringValue(record, "performance"),
        bank: getStringValue(record, "bank"),
        accountNum: getStringValue(record, "accountNum", "account_num"),
    };
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
        <div className="hrCardListPage-filter-group">
            <label>{label}</label>
            <div className={`hrCardListPage-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="hrCardListPage-chip-input-icon" aria-hidden="true" />

                {hasAppliedValue && (
                    <span className="hrCardListPage-chip">
                        <span>{appliedValue}</span>
                        <button
                            type="button"
                            className="hrCardListPage-chip-x"
                            onClick={onClear}
                        >
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
                    className="hrCardListPage-chip-clear"
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

const HrCardListPage = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { data: cards = [], isLoading, isError } = useGetHrCardList();
    const deleteHrCard =useDeleteHrCard();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailUserId, setSelectedDetailUserId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStarred, setIsStarred] = useState(false);

    const [keywordDraft, setKeywordDraft] = useState("");
    const [departmentDraft, setDepartmentDraft] = useState("");
    const [gradeDraft, setGradeDraft] = useState("");

    const [keywordFilter, setKeywordFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");

    const items = useMemo(
        () =>
            cards
                .map(mapCardToRow)
                .filter((item): item is HrTableProps => item !== null)
                .filter((item) => item.quitDate === undefined),
        [cards]
    );

    const canDeleteHrCard = user?.roleId === 2;

    useEffect(() => {
        const validUserIds = new Set(items.map((item) => item.userId));

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedUserIds((prev) => prev.filter((userId) => validUserIds.has(userId)));
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesKeyword =
                keywordFilter.trim() === "" ||
                includesText(item.userName, keywordFilter) ||
                includesText(item.employeeId, keywordFilter) ||
                includesText(item.email, keywordFilter);

            const matchesDepartment =
                departmentFilter.trim() === "" ||
                includesText(item.departmentName, departmentFilter);

            const matchesGrade =
                gradeFilter.trim() === "" || includesText(item.gradeName, gradeFilter);

            return matchesKeyword && matchesDepartment && matchesGrade;
        });
    }, [items, keywordFilter, departmentFilter, gradeFilter]);

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

    const applyFilters = () => {
        setKeywordFilter(keywordDraft.trim());
        setDepartmentFilter(departmentDraft.trim());
        setGradeFilter(gradeDraft.trim());
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

    const clearGradeFilter = () => {
        setGradeDraft("");
        setGradeFilter("");
        setCurrentPage(1);
    };

    const handleToggleItem = (userId: number) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleToggleAll = () => {
        const visibleUserIds = paginatedItems.map((item) => item.userId);
        const isAllSelected =
            visibleUserIds.length > 0 &&
            visibleUserIds.every((id) => selectedUserIds.includes(id));

        setSelectedUserIds((prev) => {
            if (isAllSelected) {
                return prev.filter((id) => !visibleUserIds.includes(id));
            }

            return Array.from(new Set([...prev, ...visibleUserIds]));
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedUserIds.length === 0 || isDeleting) {
            return;
        }

        if (!canDeleteHrCard) {
            alert("인사팀장만 인사카드를 삭제할 수 있습니다.");
            return;
        }

        const confirmed = window.confirm(
            `선택한 인사카드 ${selectedUserIds.length}건을 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            for (const userId of selectedUserIds) {
                await deleteHrCard.mutateAsync(userId);
            }

            await queryClient.invalidateQueries({
                queryKey: ["hrCardList"],
            });

            setSelectedUserIds([]);
            alert("선택한 인사카드를 삭제했습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "인사카드 삭제 중 오류가 발생했습니다.";

            console.error(error);
            alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenUpdateModal = (userId: number) => {
        setSelectedDetailUserId(userId);
    };

    const handleCloseUpdateModal = () => {
        setSelectedDetailUserId(null);
    };

    return (
        <div className="hrCardListPage-page">
            <div className="favorite-Header">
                <button
                    type="button"
                    className="hrCardListPage-star"
                    aria-pressed={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    <FaStar size={18} color={isStarred ? "#f2c94c" : "#c4c4c4"} />
                </button>
                <span>인사카드 목록</span>

                <button
                    type="button"
                    className="hrCardListPage-top-search-btn"
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                    검색 조건 {isSearchOpen ? "닫기" : "열기"}
                </button>
            </div>

            <div className={`hrCardListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="hrCardListPage-filter-row">
                    <div className="hrCardListPage-filter-1">
                        <FilterChipInput
                            label="부서"
                            placeholder="부서명 입력"
                            draftValue={departmentDraft}
                            appliedValue={departmentFilter}
                            onDraftChange={setDepartmentDraft}
                            onClear={clearDepartmentFilter}
                            onSubmit={applyFilters}
                        />
                    </div>

                    <div className="hrCardListPage-filter-2">
                        <FilterChipInput
                            label="직급"
                            placeholder="직급명 입력"
                            draftValue={gradeDraft}
                            appliedValue={gradeFilter}
                            onDraftChange={setGradeDraft}
                            onClear={clearGradeFilter}
                            onSubmit={applyFilters}
                        />
                    </div>

                    <div className="hrCardListPage-filter-3">
                        <FilterChipInput
                            label="검색어"
                            placeholder="이름, 사번, 이메일"
                            draftValue={keywordDraft}
                            appliedValue={keywordFilter}
                            onDraftChange={setKeywordDraft}
                            onClear={clearKeywordFilter}
                            onSubmit={applyFilters}
                        />
                    </div>
                </div>

                <div className="hrCardListPage-filter-actions">
                    <button
                        type="button"
                        className="hrCardListPage-search-btn"
                        onClick={applyFilters}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="hrCardListPage-table-box">
                <div className="hrCardListPage-table-info">
                    <span>전체 {filteredItems.length}건</span>
                </div>

                {isLoading ? (
                    <div>인사카드 목록을 불러오는 중입니다.</div>
                ) : isError ? (
                    <div>인사카드 목록을 불러오지 못했습니다.</div>
                ) : (
                    <HrTable
                        items={paginatedItems}
                        selectedUserIds={selectedUserIds}
                        onToggleItem={handleToggleItem}
                        onToggleAll={handleToggleAll}
                        onSelectItem={handleOpenUpdateModal}
                    />
                )}

                <div className="hrCardListPage-bottom-actions">
                    {user && (
                        <button
                            type="button"
                            className="btn-Primary"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            추가
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn-Secondary"
                        disabled={selectedUserIds.length === 0 || isDeleting}
                        onClick={handleDeleteSelected}
                    >
                        {isDeleting ? "삭제 중..." : "삭제"}
                    </button>
                </div>

                <div className="hrCardListPage-paging-group">
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
                                className="hrCardListPage-paging-num-btn"
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

            <HrCardAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <HrCardUpdateModal
                isOpen={selectedDetailUserId !== null}
                userId={selectedDetailUserId}
                onClose={handleCloseUpdateModal}
            />
        </div>
    );
};

export default HrCardListPage;
