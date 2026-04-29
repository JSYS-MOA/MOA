import {hr2Configs} from "../../types/hr2Configs.tsx";
import {useState} from "react";
import FilterDate from "./FilterDate.tsx";
import Modal from "../Modal.tsx";
import TestTagInput from "../input/TestTagInput.tsx";
import {getFilterSearch} from "../../apis/hr2/FilterService.tsx";


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
            const data = await getFilterSearch(activeField.id, keyword);
            setResults(data);

        } catch (e) {
            console.error("검색 실패:", e);
            setResults([]);
        }
    };

    const handleSelectItem = (item: any) => {

        const detail = config.fields.find((f: any) => f.searchType === activeField.id || f.key === activeField.id);

        const mapping = detail?.mapTo || { id: 'id', name: 'name' };

        const newItem = {
            id: item[mapping.id],
            name: item[mapping.name]
        };

        setSearchValues((prev: any) => {
            const currentList = prev[activeField.id] || [];
            // 중복 선택 방지
            if (currentList.find((i: any) => i.id === newItem.id)) return prev;
            return {
                ...prev,
                [activeField.id]: [...currentList, newItem] // 무조건 배열로 관리!
            };
        });
        setIsModalOpen(false);
        setResults([]); // 초기화
        setKeyword(""); // 초기화
    };

    const handleSearchClick = () => {
        // 1. searchValues에서 ID만 추출해서 백엔드용 포맷으로 변환
        const formattedFilters = Object.keys(searchValues).reduce((acc: any, key) => {
            acc[key] = searchValues[key].map((item: any) => item.id);
            return acc;
        }, {});

        // 2. 날짜와 합쳐서 부모에게 전달
        onFilter({
            ...formattedFilters,
            startDate: `${dates.start.y}-${dates.start.m}-${dates.start.d}`,
            endDate: `${dates.end.y}-${dates.end.m}-${dates.end.d}`
        });
    };


    return (
        <div className="filter-container">
            {/* 1. 무조건 있는 날짜 컴포넌트 */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FilterDate
                    label="일자"
                    value={dates.start}
                    onChange={(val: any) => setDates({...dates, start: val})}
                />
                <span style={{ alignSelf: 'center', padding: '10px auto' }}>~</span>
                <FilterDate
                    value={dates.end}
                    onChange={(val: any) => setDates({...dates, end: val})}
                />
            </div>
            {config.filterFields.map((field) => (
                <div key={field.id} style={{ width: "200px" }}>
                    <TestTagInput
                        placeholder={field.label}
                        selectedItems={searchValues[field.id] || []}
                        onClick={() =>{
                            setActiveField(field);
                            setIsModalOpen(true);
                        }} // 해당 필드의 모달 오픈
                        onRemove={(itemId) => {
                            setSearchValues((prev:any) => ({
                                ...prev,
                                [field.id]: prev[field.id].filter((item:any) => item.id !== itemId)
                            }));
                        }}
                        onClear={() => setSearchValues((prev:any) => ({ ...prev, [field.id]: [] }))}
                    />
                </div>
            ))}

            <button onClick={handleSearchClick}>검색</button>

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
                            {(activeField?.columns || config.columns.slice(1, 3)).map((col: any) => (
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