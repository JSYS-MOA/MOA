import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { FaStar } from "react-icons/fa";
import { useGetHrCardList } from "../../apis/hr/HrCardService";
import {
    useDeleteLeaverCard,
    useGetLeaverCardList,
} from "../../apis/hr/LeaverCardService";
import "../../assets/styles/hr/leaverCardList.css";
import LeaverCardAddModal from "../../components/hr/LeaverCardAddModal";
import LeaverCardUpdateModal from "../../components/hr/LeaverCardUpdateModal";
import LeaverTable from "../../components/hr/LeaverTable";
import { getHrGradeNameById, resolveHrGradeId } from "../../constants/hrGradeOptions";
import { useAuthStore } from "../../stores/useAuthStore";
import type { LeaverTableProps } from "../../types/LeaverTableProps";

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

const normalizeText = (value: string) => value.trim().toLowerCase();

const includesText = (source: string | number | undefined, keyword: string) =>
    normalizeText(String(source ?? "")).includes(normalizeText(keyword));

const parseDate = (value?: string | null) => {
    if (!value) {
        return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getGradeName = (gradeName?: string | null, gradeId?: number) => {
    const trimmedGradeName = gradeName?.trim() ?? "";

    if (trimmedGradeName) {
        return trimmedGradeName;
    }

    return getHrGradeNameById(gradeId) || (gradeId ? `직급 ${gradeId}` : "");
};

const getDepartmentName = (departmentName?: string | null, departmentId?: number) => {
    const trimmedDepartmentName = departmentName?.trim() ?? "";

    if (trimmedDepartmentName) {
        return trimmedDepartmentName;
    }

    return departmentId ? `부서 ${departmentId}` : "";
};

const mapCardToRow = (card: LeaverCard): LeaverTableProps => {
    const gradeId = resolveHrGradeId(card.gradeId) ?? card.gradeId;

    return {
        userId: card.userId,
        userName: card.userName,
        employeeId: card.employeeId,
        phone: card.phone ?? "",
        email: card.email ?? "",
        address: card.address ?? "",
        startDate: parseDate(card.startDate) ?? new Date(0),
        quitDate: parseDate(card.quitDate),
        departmentId: card.departmentId,
        departmentName: getDepartmentName(card.departmentName, card.departmentId),
        gradeId,
        gradeName: getGradeName(card.gradeName, gradeId),
        birth: parseDate(card.birth),
        performance: card.performance ?? "",
        bank: card.bank ?? "",
        accountNum: card.accountNum ?? "",
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
        <div className="leaverCardListPage-filter-group">
            <label>{label}</label>
            <div className={`leaverCardListPage-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="leaverCardListPage-chip-input-icon" aria-hidden="true" />

                {hasAppliedValue && (
                    <span className="leaverCardListPage-chip">
                        <span>{appliedValue}</span>
                        <button
                            type="button"
                            className="leaverCardListPage-chip-x"
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
                    className="leaverCardListPage-chip-clear"
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

const LeaverCardListPage = () => {
    const { user } = useAuthStore();
    const { data: cards = [], isLoading, isError } = useGetLeaverCardList();
    const deleteLeaverCard = useDeleteLeaverCard();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailUserId, setSelectedDetailUserId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [checkedUserIds, setCheckedUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [keywordDraft, setKeywordDraft] = useState("");
    const [departmentDraft, setDepartmentDraft] = useState("");
    const [gradeDraft, setGradeDraft] = useState("");

    const [keywordFilter, setKeywordFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");

    const items = useMemo(
        () => cards.map(mapCardToRow).filter((item) => item.quitDate !== undefined),
        [cards]
    );
    const validUserIdSet = useMemo(
        () => new Set(items.map((item) => item.userId)),
        [items]
    );
    const selectedUserIds = useMemo(
        () => checkedUserIds.filter((userId) => validUserIdSet.has(userId)),
        [checkedUserIds, validUserIdSet]
    );
    const canDeleteLeaverCard = user?.roleId === 2;

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
        setCheckedUserIds((prev) => {
            const nextSelectedUserIds = prev.filter((id) => validUserIdSet.has(id));

            return nextSelectedUserIds.includes(userId)
                ? nextSelectedUserIds.filter((id) => id !== userId)
                : [...nextSelectedUserIds, userId];
        });
    };

    const handleToggleAll = () => {
        const visibleUserIds = paginatedItems.map((item) => item.userId);
        const isAllSelected =
            visibleUserIds.length > 0 &&
            visibleUserIds.every((userId) => selectedUserIds.includes(userId));

        setCheckedUserIds((prev) => {
            const nextSelectedUserIds = prev.filter((id) => validUserIdSet.has(id));

            if (isAllSelected) {
                return nextSelectedUserIds.filter((id) => !visibleUserIds.includes(id));
            }

            return Array.from(new Set([...nextSelectedUserIds, ...visibleUserIds]));
        });
    };

    const handleDeleteSelected = async () => {
        const targetUserIds = selectedUserIds;

        if (targetUserIds.length === 0 || isDeleting) {
            return;
        }

        if (!canDeleteLeaverCard) {
            alert("인사팀장만 퇴사자 카드를 삭제할 수 있습니다.");
            return;
        }

        const confirmed = window.confirm(
            `선택한 퇴사자 카드 ${targetUserIds.length}건을 삭제하시겠습니까?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            for (const userId of targetUserIds) {
                await deleteLeaverCard.mutateAsync(userId);
            }

            setCheckedUserIds([]);

            if (
                selectedDetailUserId !== null &&
                targetUserIds.includes(selectedDetailUserId)
            ) {
                setSelectedDetailUserId(null);
            }

            alert("선택한 퇴사자 카드를 삭제했습니다.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "퇴사자 카드 삭제 중 오류가 발생했습니다.";

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
        <div className="leaverCardListPage-page">
            <div className="leaverCardListPage-header">
                <button
                    type="button"
                    className="leaverCardListPage-star"
                    aria-pressed={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    <FaStar size={18} color={isStarred ? "#f2c94c" : "#c4c4c4"} />
                </button>

                <h1 className="leaverCardListPage-title">퇴사자 카드 목록</h1>

                <button
                    type="button"
                    className="leaverCardListPage-top-search-btn"
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                    검색 조건 {isSearchOpen ? "닫기" : "열기"}
                </button>
            </div>

            <div className={`leaverCardListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="leaverCardListPage-filter-row">
                    <div className="leaverCardListPage-filter-1">
                        <FilterChipInput
                            label="부서"
                            placeholder="부서명을 입력하세요"
                            draftValue={departmentDraft}
                            appliedValue={departmentFilter}
                            onDraftChange={setDepartmentDraft}
                            onClear={clearDepartmentFilter}
                            onSubmit={applyFilters}
                        />
                    </div>

                    <div className="leaverCardListPage-filter-2">
                        <FilterChipInput
                            label="직급"
                            placeholder="직급명을 입력하세요"
                            draftValue={gradeDraft}
                            appliedValue={gradeFilter}
                            onDraftChange={setGradeDraft}
                            onClear={clearGradeFilter}
                            onSubmit={applyFilters}
                        />
                    </div>

                    <div className="leaverCardListPage-filter-3">
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

                <div className="leaverCardListPage-filter-actions">
                    <button
                        type="button"
                        className="leaverCardListPage-search-btn"
                        onClick={applyFilters}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="leaverCardListPage-table-box">
                <div className="leaverCardListPage-table-info">
                    <span>전체 {filteredItems.length}건</span>
                </div>

                {isLoading ? (
                    <div>퇴사자 카드 목록을 불러오는 중입니다.</div>
                ) : isError ? (
                    <div>퇴사자 카드 목록을 불러오지 못했습니다.</div>
                ) : (
                    <LeaverTable
                        items={paginatedItems}
                        selectedUserIds={selectedUserIds}
                        onToggleItem={handleToggleItem}
                        onToggleAll={handleToggleAll}
                        onSelectItem={handleOpenUpdateModal}
                    />
                )}

                <div className="leaverCardListPage-bottom-actions">
                    {user && (
                        <button
                            type="button"
                            className="leaverCardListPage-add-btn"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            추가
                        </button>
                    )}

                    <button
                        type="button"
                        className="leaverCardListPage-disabled-btn"
                        disabled={selectedUserIds.length === 0 || isDeleting}
                        onClick={handleDeleteSelected}
                    >
                        {isDeleting ? "삭제 중.." : "삭제"}
                    </button>
                </div>

                <div className="leaverCardListPage-paging-group">
                    <div className="leaverCardListPage-paging-group-min">
                        <button
                            type="button"
                            className="leaverCardListPage-paging-prev-btn"
                            onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                            disabled={resolvedCurrentPage === 1}
                        >
                            이전
                        </button>

                        {pageNumbers.map((pageNumber) => (
                            <button
                                type="button"
                                className="leaverCardListPage-paging-num-btn"
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                disabled={pageNumber === resolvedCurrentPage}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="leaverCardListPage-paging-next-btn"
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

            <LeaverCardAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <LeaverCardUpdateModal
                isOpen={selectedDetailUserId !== null}
                userId={selectedDetailUserId}
                onClose={handleCloseUpdateModal}
            />
        </div>
    );
};

export default LeaverCardListPage;
