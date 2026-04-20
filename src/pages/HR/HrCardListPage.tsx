import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/hrCard.css";
import type { HrCard } from "../../apis/HrCardService.tsx";
import type { HrTableProps } from "../../types/HrTableProps.ts";

import { useHrCardList } from "../../apis/HrCardService.tsx";
import Button from "../../components/Button.tsx";
import HrTable from "../../components/HrTable.tsx";
import { useAuthStore } from "../../stores/useAuthStore.tsx";

const ITEMS_PER_PAGE = 10;

const GRADE_NAME_MAP: Record<string, string> = {
    "President": "사장",
    "President7": "사장",
    "Vice President": "부사장",
    "Executive Director": "상무",
    "General Manager": "부장",
    "Deputy General Manager": "과장",
    "Assistant Manager": "대리",
    "Employee": "사원",
};

const translateGradeName = (gradeName?: string | null) => {
    if (!gradeName) {
        return "";
    }

    return GRADE_NAME_MAP[gradeName.trim()] ?? gradeName;
};

type FilterChipInputProps = {
    label: string;
    placeholder: string;
    inputValue: string;
    activeValue: string;
    onInputChange: (value: string) => void;
    onClear: () => void;
    onSubmit: () => void;
};

const FilterChipInput = ({
    label,
    placeholder,
    inputValue,
    activeValue,
    onInputChange,
    onClear,
    onSubmit,
}: FilterChipInputProps) => {
    const hasActiveValue = activeValue.trim() !== "";
    const hasAnyValue = hasActiveValue || inputValue.trim() !== "";

    const handleClear = () => {
        if (hasActiveValue) {
            onClear();
            return;
        }

        onInputChange("");
    };

    return (
        <div className="hrCardList-filter-group">
            <label>{label}</label>
            <div className={`hrCardList-chip-input${hasActiveValue ? " has-chip" : ""}`}>
                <span className="hrCardList-chip-input-icon" aria-hidden="true" />
                {hasActiveValue && (
                    <span className="hrCardList-chip">
                        <span>{activeValue}</span>
                    </span>
                )}

                <input
                    type="text"
                    placeholder={hasActiveValue ? "" : placeholder}
                    value={hasActiveValue ? "" : inputValue}
                    onChange={(e) => {
                        onInputChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSubmit();
                        }
                    }}
                />
                <button
                    type="button"
                    className="hrCardList-chip-clear"
                    aria-label={`${label} 입력값 삭제`}
                    onClick={handleClear}
                    disabled={!hasAnyValue}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const HrCardListPage = () => {
    const { user } = useAuthStore();
    const { data: cards = [] } = useHrCardList();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [departmentKeywordInput, setDepartmentKeywordInput] = useState("");
    const [gradeKeywordInput, setGradeKeywordInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [departmentKeyword, setDepartmentKeyword] = useState("");
    const [gradeKeyword, setGradeKeyword] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStarred, setIsStarred] = useState(false);

    const items: HrTableProps[] = useMemo(() => {
        return (cards as HrCard[]).map((card) => ({
            userId: card.userId,
            userName: card.userName,
            employeeId: card.employeeId,
            phone: card.phone ?? "",
            email: card.email ?? "",
            address: card.address ?? "",
            startDate: new Date(card.startDate),
            quitDate: card.quitDate ? new Date(card.quitDate) : undefined,
            departmentName: card.departmentName ?? "",
            gradeName: translateGradeName(card.gradeName),
            birth: card.birth ? new Date(card.birth) : undefined,
            performance: card.performance ?? "",
            bank: card.bank ?? "",
            accountNum: card.accountNum ?? "",
        }));
    }, [cards]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesKeyword =
                keyword.trim() === "" ||
                item.userName.includes(keyword) ||
                String(item.employeeId ?? "").includes(keyword) ||
                item.email.includes(keyword);

            const matchesDepartment =
                departmentKeyword.trim() === "" || item.departmentName.includes(departmentKeyword);

            const matchesGrade =
                gradeKeyword.trim() === "" || item.gradeName.includes(gradeKeyword);

            return matchesKeyword && matchesDepartment && matchesGrade;
        });
    }, [items, keyword, departmentKeyword, gradeKeyword]);

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

    const handleSearch = () => {
        setKeyword(keywordInput);
        setDepartmentKeyword(departmentKeywordInput);
        setGradeKeyword(gradeKeywordInput);
        setCurrentPage(1);
    };

    const clearDepartmentKeyword = () => {
        setDepartmentKeyword("");
        setDepartmentKeywordInput("");
        setCurrentPage(1);
    };

    const clearGradeKeyword = () => {
        setGradeKeyword("");
        setGradeKeywordInput("");
        setCurrentPage(1);
    };

    const clearKeyword = () => {
        setKeyword("");
        setKeywordInput("");
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
                <span className="hrCardList-star"
                      aria-expanded={isStarred}
                      onClick={() => setIsStarred(!isStarred)}
                    >
                         {isStarred ? "★" : "★"}
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
                    <FilterChipInput
                        label="부서"
                        placeholder="부서"
                        inputValue={departmentKeywordInput}
                        activeValue={departmentKeyword}
                        onInputChange={setDepartmentKeywordInput}
                        onClear={clearDepartmentKeyword}
                        onSubmit={handleSearch}
                    />

                    <FilterChipInput
                        label="직급"
                        placeholder="직급/직위"
                        inputValue={gradeKeywordInput}
                        activeValue={gradeKeyword}
                        onInputChange={setGradeKeywordInput}
                        onClear={clearGradeKeyword}
                        onSubmit={handleSearch}
                    />

                    <FilterChipInput
                        label="이름"
                        placeholder="성명"
                        inputValue={keywordInput}
                        activeValue={keyword}
                        onInputChange={setKeywordInput}
                        onClear={clearKeyword}
                        onSubmit={handleSearch}
                    />
                </div>

                <div className="hrCardList-filter-actions">
                    <Button className="hrCardList-search-btn" label="검색" onClick={handleSearch} />
                </div>
            </div>



            <div className="hrCardList-table-box">
                <div className="hrCardList-table-info">
                    <span>전체 {filteredItems.length}건</span>
                </div>

                <HrTable
                    items={paginatedItems}
                    selectedUserIds={selectedUserIds}
                    onToggleItem={handleToggleItem}
                    onToggleAll={handleToggleAll}
                />
                <div className="hrCardList-bottom-actions">
                    {user && (
                        <Link to="/hr/cards/add">
                            <Button
                                className="hrCardList-add-btn"
                                label="신규" onClick={() => {}} />
                        </Link>
                    )}

                    <Button
                        className="hrCardList-disabled-btn"
                        disabled={selectedUserIds.length === 0}
                        label="삭제"
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "16px",
                    }}
                >
                    <Button
                        className={"hrCardList-paging-prev-btn"}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        label="이전"
                    />

                    {pageNumbers.map((pageNumber) => (
                        <Button
                            className={"hrCardList-paging-num-btn"}
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            disabled={pageNumber === currentPage}
                            label={pageNumber}
                        />
                    ))}

                    <Button
                        className={"hrCardList-paging-next-btn"}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        label="다음"
                    />
                </div>
            </div>


        </div>
    );
};

export default HrCardListPage;
