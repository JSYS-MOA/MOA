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
// 1. activeField.id와 매칭되는 설정을 filterFields에서 찾거나 fields에서 찾음
        const fieldConfig = config.filterFields.find((f: any) => f.id === activeField.id);

        // 2. mapTo가 없으면 기본값(id, name) 사용, 백엔드 오타(cord) 대응 로직 추가
        const mapping = (fieldConfig as any)?.mapTo || { id: 'id', name: 'name' };

        // 3. newItem 생성 시 DTO의 키값(mapping.id/name)을 사용하여 동적 추출
        // 백엔드에서 오타난 필드명(allowanceCord 등)이 들어와도 안전하게 매핑되도록 fallback 추가
        const newItem = {
            id: item[mapping.id] || item['employeeId'] || item['allowanceCode'] || item['allowanceCord'],
            name: item[mapping.name] || item['userName'] || item['allowanceName']
        };

        if (!newItem.id) {
            console.error("ID 매핑 실패:", item);
            return;
        }

        setSearchValues((prev: any) => {
            const currentList = prev[activeField.id] || [];
            if (currentList.find((i: any) => i.id === newItem.id)) return prev;
            return {
                ...prev,
                [activeField.id]: [...currentList, newItem]
            };
        });
        setIsModalOpen(false);
        setResults([]);
        setKeyword("");
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
            {/* 필터 필드 루프 내에서 타입별 분기 처리 (그룹버튼 위치 수정) */}
            {config.filterFields.map((field) => {
                if (field.type === "groupButton") {
                    return (
                        <div key={field.id} className="group-button-filter" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>{field.label}:</span>
                            <div className="btn-group">
                                <button
                                    className={!searchValues[field.id] ? "active" : ""}
                                    onClick={() => setSearchValues({ ...searchValues, [field.id]: null })}
                                >전체</button>
                                {(field as any).option?.map((opt: any) => (
                                    <button
                                        key={opt.value}
                                        className={searchValues[field.id] === opt.value ? "active" : ""}
                                        onClick={() => setSearchValues({ ...searchValues, [field.id]: opt.value })}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                }
                return (
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
                );
            })}

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
            // 여기에 그룹버튼
            {config.filterFields.map((field) => {
                // 1. 그룹 버튼 타입일 경우
                if (field.type === "groupButton") {
                    return (
                        <div key={field.id} className="group-button-filter" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{field.label}:</span>
                            <div className="btn-group" style={{ display: 'flex', gap: '2px' }}>
                                <button
                                    className={!searchValues[field.id] ? "active" : ""}
                                    onClick={() => setSearchValues({ ...searchValues, [field.id]: null })}
                                >전체</button>

                                {/* API 등으로 받아온 옵션들 (지금은 임시 데이터나 config에서 가져옴) */}
                                {(field as any).option?.map((opt: any) => (
                                    <button
                                        key={opt.value}
                                        className={searchValues[field.id] === opt.value ? "active" : ""}
                                        onClick={() => setSearchValues({ ...searchValues, [field.id]: opt.value })}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                )}
                return null;
            })}
        </div>
    )
}

export default Filter;