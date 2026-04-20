import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { HrCard } from "../../apis/HrCardService";
import { useHrCardList } from "../../apis/HrCardService";
import "../../assets/styles/hrCard.css";
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

const paginationStyle: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "16px",
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
        <div className="hrCardList-filter-group">
            <label>{label}</label>
            <div className={`hrCardList-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="hrCardList-chip-input-icon" aria-hidden="true" />
                {hasAppliedValue && (
                    <span className="hrCardList-chip">
                        <span>{appliedValue}</span>
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
                    className="hrCardList-chip-clear"
                    aria-label={`${label} 입력값 삭제`}
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
    const { data: cards = [], isLoading, isError } = useHrCardList();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage]);

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

    return (
        <div className="hrCardList-page">
            <div className="hrCardList-header">
                <span
                    className="hrCardList-star"
                    aria-expanded={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    {isStarred ? "★" : "☆"}
                </span>
                <h1 className="hrCardList-title">인사 카드 등록</h1>
                <Button
                    className="hrCardList-top-search-btn"
                    label={`검색 조건 ${isSearchOpen ? "▲" : "▼"}`}
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                />
            </div>

            <div className={`hrCardList-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="hrCardList-filter-row">
                    <div className="hrCardList-filter-1">
                    <FilterChipInput
                        label="부서"
                        placeholder="부서 입력"
                        draftValue={departmentDraft}
                        appliedValue={departmentFilter}
                        onDraftChange={setDepartmentDraft}
                        onClear={clearDepartmentFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="hrCardList-filter-2">
                    <FilterChipInput
                        label="직급/직위"
                        placeholder="직급 입력"
                        draftValue={gradeDraft}
                        appliedValue={gradeFilter}
                        onDraftChange={setGradeDraft}
                        onClear={clearGradeFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="hrCardList-filter-3">
                    <FilterChipInput
                        label="성명"
                        placeholder="성명 입력"
                        draftValue={keywordDraft}
                        appliedValue={keywordFilter}
                        onDraftChange={setKeywordDraft}
                        onClear={clearKeywordFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                </div>

                <div className="hrCardList-filter-actions">
                    <Button className="hrCardList-search-btn" label="검색" onClick={applyFilters} />
                </div>
            </div>

            <div className="hrCardList-table-box">
                <div className="hrCardList-table-info">
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

                <div className="hrCardList-bottom-actions">
                    {user && (
                        <Button
                            className="hrCardList-add-btn"
                            label="신규"
                            onClick={() => setIsAddModalOpen(true)}
                        />
                    )}

                    <Button
                        className="hrCardList-disabled-btn"
                        disabled={selectedUserIds.length === 0}
                        label="삭제"
                    />
                </div>

                <div style={paginationStyle}>
                    <Button
                        className="hrCardList-paging-prev-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        label="이전"
                    />

                    {pageNumbers.map((pageNumber) => (
                        <Button
                            className="hrCardList-paging-num-btn"
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            disabled={pageNumber === currentPage}
                            label={pageNumber}
                        />
                    ))}

                    <Button
                        className="hrCardList-paging-next-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        label="다음"
                    />
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
