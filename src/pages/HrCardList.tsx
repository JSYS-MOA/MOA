import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useHrCardList } from "../apis/HrCardService";
import Button from "../components/Button";
import Table from "../components/Table";
import { useAuthStore } from "../stores/useAuthStore";

import type { HrTableProps } from "../types/HrTableProps.ts";

type HrCardApi = {
    user_id: number;
    user_name: string;
    employee_id: number;
    phone: string;
    email: string;
    address?: string;
    start_date: string;
    quit_date?: string | null;
    department_id: number;
    grade_id: number;
    birth?: string | null;
    performance?: string;
    bank?: string;
    account_num?: string;
};

const HrCardList = () => {
    const { user } = useAuthStore();
    const { data: cards = [] } = useHrCardList();

    const [keyword, setKeyword] = useState("");
    const [departmentKeyword, setDepartmentKeyword] = useState("");
    const [gradeKeyword, setGradeKeyword] = useState("");

    const items: HrTableProps[] = useMemo(() => {
        return (cards as HrCardApi[]).map((card) => ({
            user_id: card.user_id,
            userName: card.user_name,
            employeeId: card.employee_id,
            phone: card.phone,
            email: card.email,
            address: card.address ?? "",
            startDate: new Date(card.start_date),
            quitDate: card.quit_date ? new Date(card.quit_date) : undefined,
            departmentId: card.department_id,
            gradeId: card.grade_id,
            birth: card.birth ? new Date(card.birth) : undefined,
            performance: card.performance ?? "",
            bank: card.bank ?? "",
            accountNum: card.account_num ?? "",
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
                departmentKeyword.trim() === "" ||
                String(item.departmentId).includes(departmentKeyword);

            const matchesGrade =
                gradeKeyword.trim() === "" ||
                String(item.gradeId).includes(gradeKeyword);

            return matchesKeyword && matchesDepartment && matchesGrade;
        });
    }, [items, keyword, departmentKeyword, gradeKeyword]);

    return (
        <div className="hrCardList-page">
            <div className="hrCardList-header">
                <h1 className="hrCardList-title">인사 카드 등록</h1>
                <button type="button" className="hrCardList-top-search">
                    검색 조건
                </button>
            </div>

            <div className="hrCardList-filter-box">
                <div className="hrCardList-filter-row">
                    <div className="hrCardList-filter-group">
                        <label>부서</label>
                        <input
                            type="text"
                            placeholder="부서"
                            value={departmentKeyword}
                            onChange={(e) => setDepartmentKeyword(e.target.value)}
                        />
                    </div>

                    <div className="hrCardList-filter-group">
                        <label>직급/직책</label>
                        <input
                            type="text"
                            placeholder="직급"
                            value={gradeKeyword}
                            onChange={(e) => setGradeKeyword(e.target.value)}
                        />
                    </div>

                    <div className="hrCardList-filter-group">
                        <label>성명</label>
                        <input
                            type="text"
                            placeholder="이름 / 사번 / 이메일"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="hrCardList-filter-actions">
                    <button type="button" className="hrCardList-search-btn" onClick={() => {}}>
                        검색
                    </button>

                    <button
                        type="button"
                        className="hrCardList-reset-btn"
                        onClick={() => {
                            setKeyword("");
                            setDepartmentKeyword("");
                            setGradeKeyword("");
                        }}
                    >
                        초기화
                    </button>
                </div>
            </div>

            <div className="hrCardList-table-box">
                <div className="hrCardList-table-info">
                    <span>전체 {filteredItems.length}건</span>
                </div>

                <Table items={filteredItems} />
            </div>

            <div className="hrCardList-bottom-actions">
                {user && (
                    <Link to="/hr/cards/add">
                        <Button label="추가" onClick={() => {}} />
                    </Link>
                )}

                <button type="button" className="hrCardList-disabled-btn" disabled>
                    삭제
                </button>
            </div>
        </div>
    );
};

export default HrCardList;
