import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import type { HrCard } from "../../apis/HrCardService";
import { useHrCardDelete, useHrCardList } from "../../apis/HrCardService";
import "../../assets/styles/hr/hrCardList.css";
import Button from "../../components/Button.tsx";
import HrCardAddModal from "../../components/HrPage/HrCardAddModal.tsx";
import HrTable from "../../components/HrPage/HrTable.tsx";
import HrCardUpdateModal from "../../components/HrPage/HrCardUpdateModal.tsx";
import { useAuthStore } from "../../stores/useAuthStore.tsx";
import type { HrTableProps } from "../../types/HrTableProps.ts";

const ITEMS_PER_PAGE = 10;

const GRADE_NAME_MAP: Record<string, string> = {
    President: "?ъ옣",
    President7: "?ъ옣",
    "Vice President": "遺?ъ옣",
    "Executive Director": "?곷Т",
    "General Manager": "遺??,
    "Deputy General Manager": "怨쇱옣",
    "Assistant Manager": "?由?,
    Employee: "?ъ썝",
};

const RESTRICTED_EDIT_GRADE_KEYWORDS = ["遺??, "?곷Т", "遺?ъ옣", "?ъ옣", "?꾩썝", "?댁궗", "???];

const normalizeText = (value: string) => value.trim().replace(/\s+/g, "").toLowerCase();

const isRestrictedEditGrade = (gradeName?: string | null) => {
    const normalizedGradeName = normalizeText(gradeName ?? "");

    if (!normalizedGradeName) {
        return false;
    }

    return RESTRICTED_EDIT_GRADE_KEYWORDS.some((keyword) =>
        normalizedGradeName.includes(normalizeText(keyword))
    );
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

    return gradeId ? `吏곴툒 ${gradeId}` : "";
};

const getDepartmentName = (departmentName?: string | null, departmentId?: number) => {
    if (departmentName?.trim()) {
        return departmentName.trim();
    }

    return departmentId ? `遺??${departmentId}` : "";
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
        profileUrl: card.profileUrl ?? "",
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
        <div className="sepCardListPage-filter-group">
            <label>{label}</label>
            <div className={`sepCardListPage-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="sepCardListPage-chip-input-icon" aria-hidden="true" />
                {hasAppliedValue && (
                    <span className="sepCardListPage-chip">
                        <span>{appliedValue}</span>
                        <button
                        type="button"
                        className="sepCardListPage-chip-x"
                        onClick={onClear}
                        > 횞
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
                    className="sepCardListPage-chip-clear"
                    aria-label={`${label} ?낅젰媛???젣`}
                    onClick={handleClear}
                    disabled={!hasAnyValue}
                >x</button>
            </div>
        </div>
    );
};

const SepCardListPage = () => {
    const { user } = useAuthStore();
    const { data: cards = [], isLoading, isError } = useHrCardList();
    const deleteHrCard = useHrCardDelete();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailUserId, setSelectedDetailUserId] = useState<number | null>(null);
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
            alert("?몄궗??λ쭔 ?댁궗?먯뭅?쒕? ??젣?????덉뒿?덈떎.");
            return;
        }

        const confirmed = window.confirm(
            `?좏깮???댁궗?먯뭅??${selectedUserIds.length}嫄댁쓣 ??젣?섏떆寃좎뒿?덇퉴?`
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
            alert("?좏깮???댁궗?먯뭅?쒕? ??젣?덉뒿?덈떎.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "?댁궗?먯뭅????젣 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.";

            console.error(error);
            alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseUpdateModal = () => {
        setSelectedDetailUserId(null);
    };

    return (
        <div className="sepCardListPage-page">
            <div className="sepCardListPage-header">
                <span
                    className="sepCardListPage-star"
                    aria-expanded={isStarred}
                    onClick={() => setIsStarred((prev) => !prev)}
                >
                    {isStarred ? "?? : "??}
                </span>
                <h1 className="sepCardListPage-title">?댁궗??移대뱶 ?깅줉</h1>
                <Button
                    className="sepCardListPage-top-search-btn"
                    label={`寃??議곌굔 ${isSearchOpen ? "?? : "??}`}
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                />
            </div>

            <div className={`sepCardListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="sepCardListPage-filter-row">
                    <div className="sepCardListPage-filter-1">
                    <FilterChipInput
                        label="遺??
                        placeholder="遺??
                        draftValue={departmentDraft}
                        appliedValue={departmentFilter}
                        onDraftChange={setDepartmentDraft}
                        onClear={clearDepartmentFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="sepCardListPage-filter-2">
                    <FilterChipInput
                        label="吏곴툒/吏곸쐞"
                        placeholder="吏곴툒"
                        draftValue={gradeDraft}
                        appliedValue={gradeFilter}
                        onDraftChange={setGradeDraft}
                        onClear={clearGradeFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                    <div className="sepCardListPage-filter-3">
                    <FilterChipInput
                        label="?깅챸"
                        placeholder="?깅챸"
                        draftValue={keywordDraft}
                        appliedValue={keywordFilter}
                        onDraftChange={setKeywordDraft}
                        onClear={clearKeywordFilter}
                        onSubmit={applyFilters}
                    />
                    </div>
                </div>

                <div className="sepCardListPage-filter-actions">
                    <Button className="sepCardListPage-search-btn" label="寃?? onClick={applyFilters} />
                </div>
            </div>

            <div className="sepCardListPage-table-box">
                <div className="sepCardListPage-table-info">
                    <span>?꾩껜 {filteredItems.length}嫄?/span>
                </div>

                {isLoading ? (
                    <div>?몄궗 移대뱶 紐⑸줉??遺덈윭?ㅻ뒗 以묒엯?덈떎.</div>
                ) : isError ? (
                    <div>?몄궗 移대뱶 紐⑸줉??遺덈윭?ㅼ? 紐삵뻽?듬땲??</div>
                ) : (
                    <HrTable
                        items={paginatedItems}
                        selectedUserIds={selectedUserIds}
                        onToggleItem={handleToggleItem}
                        onToggleAll={handleToggleAll}
                    />
                )}

                <div className="sepCardListPage-bottom-actions">
                    {user && (
                        <Button
                            className="sepCardListPage-add-btn"
                            label="?좉퇋"
                            onClick={() => setIsAddModalOpen(true)}
                        />
                    )}

                    <Button
                        className="sepCardListPage-disabled-btn"
                        disabled={selectedUserIds.length === 0 || isDeleting}
                        label={isDeleting ? "??젣 以?.." : "??젣"}
                        onClick={handleDeleteSelected}
                    />
                </div>

                <div className="sepCardListPage-paging-group">
                    <div className="sepCardListPage-paging-group-min">
                    <Button
                        className="sepCardListPage-paging-prev-btn"
                        onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                        disabled={resolvedCurrentPage === 1}
                        label="?댁쟾"
                    />

                    {pageNumbers.map((pageNumber) => (
                        <Button
                            className="sepCardListPage-paging-num-btn"
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            disabled={pageNumber === resolvedCurrentPage}
                            label={pageNumber}
                        />
                    ))}

                    <Button
                        className="sepCardListPage-paging-next-btn"
                        onClick={() => setCurrentPage(Math.min(resolvedCurrentPage + 1, totalPages))}
                        disabled={resolvedCurrentPage === totalPages}
                        label="?ㅼ쓬"
                    />
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

export default SepCardListPage;

