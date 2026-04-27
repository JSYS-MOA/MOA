import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import {
    type CertificatesCardRecord,
    useGetCertificatesCardList,
} from "../../apis/hr/CertificatesCardService";
import "../../assets/styles/hr/CertificatesCardList.css";
import CertificatesCardUpdateModal from "../../components/hr/CertificatesCardUpdateModal";
import CertificatesTable from "../../components/hr/CertificatesTable";
import {
    getHrGradeNameById as getCertificatesGradeNameById,
    resolveHrGradeId as resolveCertificatesGradeId,
} from "../../constants/hrGradeOptions";
import type { HrTableProps } from "../../types/HrTableProps";
import { FaStar } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;
const MANAGER_GRADE_ID = 4;

type CertificatesModalTarget = number;

type FilterChipInputProps = {
    label: string;
    placeholder: string;
    draftValue: string;
    appliedValue: string;
    onDraftChange: (value: string) => void;
    onClear: () => void;
    onSubmit: () => void;
};

type CertificatesTableProps = HrTableProps;
type LooseCertificatesCard = CertificatesCardRecord & Record<string, unknown>;

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

    return getCertificatesGradeNameById(gradeId) || (gradeId > 0 ? `직급 ${gradeId}` : "");
};

const mapCardToRow = (card: CertificatesCardRecord): CertificatesTableProps | null => {
    const record = card as LooseCertificatesCard;
    const userId = getNumberValue(record, "userId", "user_id");

    if (userId === undefined) {
        return null;
    }

    const departmentId = getNumberValue(record, "departmentId", "department_id") ?? 0;
    const rawGradeId = getNumberValue(record, "gradeId", "grade_id") ?? 0;
    const gradeId = resolveCertificatesGradeId(rawGradeId) ?? rawGradeId;
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

const isVisibleCertificatesRow = (item: CertificatesTableProps) => {
    const hasQuitDate = item.quitDate !== undefined;
    const isManagerOrAbove = item.gradeId > 0 && item.gradeId <= MANAGER_GRADE_ID;

    return !hasQuitDate && !isManagerOrAbove;
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
        <div className="certificatesCardListPage-filter-group">
            <label>{label}</label>
            <div className={`certificatesCardListPage-chip-input${hasAppliedValue ? " has-chip" : ""}`}>
                <span className="certificatesCardListPage-chip-input-icon" aria-hidden="true" />

                {hasAppliedValue && (
                    <span className="certificatesCardListPage-chip">
                        <span>{appliedValue}</span>
                        <button
                            type="button"
                            className="certificatesCardListPage-chip-x"
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
                    className="certificatesCardListPage-chip-clear"
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

const CertificatesCardListPage = () => {
    const { data: cards = [], isLoading, isError } = useGetCertificatesCardList();

    const [isSearchOpen, setIsSearchOpen] = useState(true);
    const [modalTarget, setModalTarget] = useState<CertificatesModalTarget | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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
                .filter((item): item is CertificatesTableProps => item !== null)
                .filter(isVisibleCertificatesRow),
        [cards]
    );

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesKeyword =
                keywordFilter.trim() === "" ||
                includesText(item.userName, keywordFilter) ||
                includesText(item.employeeId, keywordFilter);

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

    const handleOpenUpdateModal = (userId: number) => {
        setModalTarget(userId);
    };

    const handleCloseUpdateModal = () => {
        setModalTarget(null);
    };

    return (
        <div className="certificatesCardListPage-page">
            <div className="favorite-Header">
                <FaStar size={18} color="#C4C4C4" />
                <span>인사 관리 현황</span>

                <button
                    type="button"
                    className="certificatesCardListPage-top-search-btn"
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                    검색 조건 {isSearchOpen ? "닫기" : "열기"}
                </button>
            </div>

            <div className={`certificatesCardListPage-filter-box${isSearchOpen ? "" : " is-collapsed"}`}>
                <div className="certificatesCardListPage-filter-row">
                    <div className="certificatesCardListPage-filter-1">
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

                    <div className="certificatesCardListPage-filter-2">
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

                    <div className="certificatesCardListPage-filter-3">
                        <FilterChipInput
                            label="검색어"
                            placeholder="이름, 사번"
                            draftValue={keywordDraft}
                            appliedValue={keywordFilter}
                            onDraftChange={setKeywordDraft}
                            onClear={clearKeywordFilter}
                            onSubmit={applyFilters}
                        />
                    </div>
                </div>

                <div className="certificatesCardListPage-filter-actions">
                    <button
                        type="button"
                        className="certificatesCardListPage-search-btn"
                        onClick={applyFilters}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div className="certificatesCardListPage-table-box">
                {isLoading ? (
                    <div>인사 발령 목록을 불러오는 중입니다.</div>
                ) : isError ? (
                    <div>인사 발령 목록을 불러오지 못했습니다.</div>
                ) : (
                    <CertificatesTable
                        items={paginatedItems}
                        onSelectItem={handleOpenUpdateModal}
                    />
                )}

                <div className="certificatesCardListPage-paging-group">
                    <div className="certificatesCardListPage-paging-group-min">
                        <button
                            type="button"
                            className="certificatesCardListPage-paging-prev-btn"
                            onClick={() => setCurrentPage(Math.max(resolvedCurrentPage - 1, 1))}
                            disabled={resolvedCurrentPage === 1}
                        >
                            이전
                        </button>

                        {pageNumbers.map((pageNumber) => (
                            <button
                                type="button"
                                className="certificatesCardListPage-paging-num-btn"
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                disabled={pageNumber === resolvedCurrentPage}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="certificatesCardListPage-paging-next-btn"
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

            <CertificatesCardUpdateModal
                isOpen={modalTarget !== null}
                userId={typeof modalTarget === "number" ? modalTarget : null}
                onClose={handleCloseUpdateModal}
            />
        </div>
    );
};

export default CertificatesCardListPage;
