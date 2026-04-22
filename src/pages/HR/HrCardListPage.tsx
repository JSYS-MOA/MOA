import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import type { HrCard } from "../../apis/HrCardService";
import { useHrCardDelete, useHrCardList } from "../../apis/HrCardService";
import "../../assets/styles/hr/hrCardList.css";
import Button from "../../components/Button.tsx";
import HrCardAddModal from "../../components/HrPage/HrCardAddModal.tsx";
import HrTable from "../../components/HrPage/HrTable.tsx";
import { useAuthStore } from "../../stores/useAuthStore.tsx";
import type { HrTableProps } from "../../types/HrTableProps.ts";

const ITEMS_PER_PAGE = 10;

const GRADE_NAME_MAP: Record<string, string> = {
    President: "사장",
    President7: "사장",
    "Vice President": "부사장",
    "Executive Director": "상무",
    "General Manager": "부장",
    "Deputy General Manager": "과장",
    "Assistant Manager": "대리",
    Employee: "사원",
};


const parseDate = (value?: string | null) => {
    if (!value) {
        return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getGradeName = (gradeName?: string | null, gradeId?: number) => {
    if (gradeName?.trim()) {
        return GRADE_NAME_MAP[gradeName.trim()] ?? gradeName.trim();
    }

    return gradeId ? `직급 ${gradeId}` : "";
};

const getDepartmentName = (departmentName?: string | null, departmentId?: number) => {
    if (departmentName?.trim()) {
        return departmentName.trim();
    }

    return departmentId ? `부서 ${departmentId}` : "";
};

const mapCardToRow = (card: HrCard): HrTableProps => {
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
        gradeId: card.gradeId,
        gradeName: getGradeName(card.gradeName, card.gradeId),
        birth: parseDate(card.birth),
        performance: card.performance ?? "",
        bank: card.bank ?? "",
        accountNum: card.accountNum ?? "",
    };
};

type FilterChipInputProps = {
    label: string;
    placeholder: string;
    draftValue: string;
    appliedValue: string;
    onDraftChange: (value: string) => void;
    onClear: () => void;
    onSubmit: () => void;
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
                        > ×
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
                    aria-label={`${label} 입력값 삭제`}
                    onClick={handleClear}
                    disabled={!hasAnyValue}
                >x</button>
            </div>
        </div>
    );
};

const HrCardListPage = () => {
    const { user } = useAuthStore();
    const { data: cards = [], isLoading, isError } = useHrCardList();
    const deleteHrCard = useHrCardDelete();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [keywordDraft, setKeywordDraft] = useState("");
    const [departmentDraft, setDepartmentDraft] = useState("");
    const [gradeDraft, setGradeDraft] = useState("");

    const [keywordFilter, setKeywordFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");

    const items = useMemo(() => cards.map(mapCardToRow), [cards]);
    const canDeleteHrCard = user?.roleId === 2;

    useEffect(() => {
        const validUserIds = new Set(items.map((item) => item.userId));

        setSelectedUserIds((prev) => prev.filter((userId) => validUserIds.has(userId)));
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesKeyword =
                keywordFilter.trim() === "" ||
                item.userName.includes(keywordFilter) ||
                String(item.employeeId ?? "").includes(keywordFilter) ||
                item.email.includes(keywordFilter);

            const matchesDepartment =
                departmentFilter.trim() === "" ||
                (item.departmentName ?? "").includes(departmentFilter);

            const matchesGrade =
                gradeFilter.trim() === "" || (item.gradeName ?? "").includes(gradeFilter);

            return matchesKeyword && matchesDepartment && matchesGrade;
        });
    }, [items, keywordFilter, departmentFilter, gradeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const resolvedCurrentPage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const startIndex = (resolvedCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, resolvedCurrentPage]);

    const pageNumbers = useMemo(() => {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }, [totalPages]);

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

    return (
        <div className="hrCardListPage-page">
            <div className="hrCardListPage-header">
                <span
                    className="hrCardListPage-star"
                    aria-expanded={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    {isStarred ? "★" : "☆"}
                </span>
                <h1 className="hrCardListPage-title">인사 카드 등록</h1>
                <Button
                    className="hrCardListPage-top-search-btn"
                    label={`검색 조건 ${isSearchOpen ? "▲" : "▼"}`}
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                />
            </div>

            <div className={`hrCardListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="hrCardListPage-filter-row">
                    <div className="hrCardListPage-filter-1">
                    <FilterChipInput
                        label="부서"
                        placeholder="부서"
                        draftValue={departmentDraft}
                        appliedValue={departmentFilter}
                        onDraftChange={setDepartmentDraft}
                        onClear={clearDepartmentFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="hrCardListPage-filter-2">
                    <FilterChipInput
                        label="직급/직위"
                        placeholder="직급"
                        draftValue={gradeDraft}
                        appliedValue={gradeFilter}
                        onDraftChange={setGradeDraft}
                        onClear={clearGradeFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="hrCardListPage-filter-3">
                    <FilterChipInput
                        label="성명"
                        placeholder="성명"
                        draftValue={keywordDraft}
                        appliedValue={keywordFilter}
                        onDraftChange={setKeywordDraft}
                        onClear={clearKeywordFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                </div>

                <div className="hrCardListPage-filter-actions">
                    <Button className="hrCardListPage-search-btn" label="검색" onClick={applyFilters} />
                </div>
            </div>

            <div className="hrCardListPage-table-box">
                <div className="hrCardListPage-table-info">
                    <span>전체 {filteredItems.length}건</span>
                </div>

                {isLoading ? (
                    <div>인사 카드 목록을 불러오는 중입니다.</div>
                ) : isError ? (
                    <div>인사 카드 목록을 불러오지 못했습니다.</div>
                ) : (
                    <HrTable
                        items={paginatedItems}
                        selectedUserIds={selectedUserIds}
                        onToggleItem={handleToggleItem}
                        onToggleAll={handleToggleAll}
                    />
                )}

                <div className="hrCardListPage-bottom-actions">
                    {user && (
                        <Button
                            className="hrCardListPage-add-btn"
                            label="신규"
                            onClick={() => setIsAddModalOpen(true)}
                        />
                    )}

                    <Button
                        className="hrCardListPage-disabled-btn"
                        disabled={selectedUserIds.length === 0 || isDeleting}
                        label={isDeleting ? "삭제 중..." : "삭제"}
                        onClick={handleDeleteSelected}
                    />
                </div>

                <div className="hrCardListPage-paging-group">
                    <div className="hrCardListPage-paging-group-min">
                    <Button
                        className="hrCardListPage-paging-prev-btn"
                        onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                        disabled={resolvedCurrentPage === 1}
                        label="이전"
                    />

                    {pageNumbers.map((pageNumber) => (
                        <Button
                            className="hrCardListPage-paging-num-btn"
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            disabled={pageNumber === resolvedCurrentPage}
                            label={pageNumber}
                        />
                    ))}

                    <Button
                        className="hrCardListPage-paging-next-btn"
                        onClick={() => setCurrentPage(Math.min(resolvedCurrentPage + 1, totalPages))}
                        disabled={resolvedCurrentPage === totalPages}
                        label="다음"
                    />
                    </div>
                </div>
            </div>

            <HrCardAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default HrCardListPage;
