import {hr2Configs} from "../../types/hr2Configs.tsx";
import {useState} from "react";
import FilterDate from "./FilterDate.tsx";
import FilterSearch from "./FilterSearch.tsx";
import Modal from "../Modal.tsx";


interface FilterProps {
    apiType: keyof typeof hr2Configs;
    onFilter: (params: any) => void;
}


const Filter = ({ apiType, onFilter }: FilterProps) => {
    const config = hr2Configs[apiType];
    const [dates, setDates] = useState({start: {y: '2025', m: '01', d: '01'}, end: {y: '2025', m: '01', d: '01'}});
    const [searchValues, setSearchValues] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<any>(null);

    // 모달 내 검색 결과 및 입력어 상태
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const handleModalSearch = async () => {
        if (!keyword.trim()) return alert("검색어를 입력하세요.");

        try {
            // 1. configs에서 설정한 url 가져오기 (없으면 기본값)
            const baseUrl = activeField.fetchUrl || "/api/hr2/getFilterList";

            // 2. 템플릿 리터럴 `${}` 사용해서 쿼리 스트링 조립
            // 예: /api/hr2/getFilterList?fieldId=user&keyword=김철수
            const response = await fetch(`${baseUrl}?fieldId=${activeField.id}&keyword=${keyword}`);
            const data = await response.json();

            setResults(data);
        } catch (e) {
            console.error("검색 실패:", e);
            setResults([]);
        }
    };

    const handleSelectItem = (item: any) => {
        setSearchValues({
            ...searchValues,
            [activeField.id]: item.name // 화면엔 이름을 보여줌
            // 만약 ID나 사번을 따로 서버에 보내야 한다면 추가 상태를 만드세요
        });
        setIsModalOpen(false);
        setResults([]); // 초기화
        setKeyword(""); // 초기화
    };

    return (
        <div className="filter-container">
            {/* 1. 무조건 있는 날짜 컴포넌트 */}
            <FilterDate
                label="일자"
                value={dates.start}
                onChange={(val: any) => setDates({...dates, start: val})}
            />
            ~
            <FilterDate
                value={dates.end}
                onChange={(val: any) => setDates({...dates, end: val})}
            />

            {/* 2. Config에 따라 동적으로 생성되는 검색 컴포넌트 */}
            {config.filterFields?.map(field => (
                <FilterSearch
                    key={field.id}
                    label={field.label}
                    value={searchValues[field.id]}
                    onOpenModal={() => {
                        setActiveField(field);
                        setIsModalOpen(true);
                    }}
                />
            ))}

            <button onClick={() => onFilter({dates, searchValues})}>검색</button>

            {/* 3. 공용 모달 연결 */}
            <Modal
                title={`${activeField?.label} 검색`} // 모달 헤더와 타이틀에 자동 반영
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setResults([]);
                    setKeyword("");
                }}
                footer={
                    <button onClick={() => setIsModalOpen(false)}>닫기</button>
                }
            >
                <div className="search-content">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleModalSearch()}
                        placeholder="검색어를 입력하세요"
                    />
                    <button onClick={handleModalSearch}>검색</button>

                    <table className="modal-table">
                        <thead>
                        <tr>
                            {/* configs에 정의된 컬럼들만 자동으로 출력 */}
                            {activeField?.columns?.map((col: any) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {results.length > 0 ? (
                            results.map((item: any, idx: number) => (
                                <tr key={item.id || idx} onClick={() => handleSelectItem(item)} style={{cursor: 'pointer'}}>
                                    {activeField.columns.map((col: any) => (
                                        <td key={col.key}>{item[col.key]}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={activeField?.columns?.length || 1} style={{textAlign: 'center', padding: '20px'}}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
}

export default Filter;