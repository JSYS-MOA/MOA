import {hr2Configs} from "../../types/hr2Configs.tsx";
import {useState} from "react";
import {saveHr2Data} from "../../apis/hr2/Hr2Service.tsx";
import HRSearchModal from "./HRSearchModal.tsx";
import FilterDate from "./FilterDate.tsx";


interface HRModalProps {

    apiType: keyof typeof hr2Configs; // 어떤 페이지인지 알아야 함
    isOpen: boolean;
    onClose: () => void;
    baseData: any; // input 데이터 (초기 insert 시 null)
    fetchData: () => void; // 새로고침 함수

}

interface HRFormData {

    workDate?: string;
    userName?: string;
    employeeId?: string;
    allowanceName?: string;
    allowanceCode?: string;
    workMemo?: string;
    [key: string]: any;

}



const HRModal = ({ isOpen, onClose, apiType, baseData, fetchData }: HRModalProps) => {

    const config = hr2Configs[apiType];
    const fields = (config && "fields" in config) ? config.fields : [];


    const [formData, setFormData] = useState<HRFormData>((baseData as HRFormData) || ({} as HRFormData));
    const [currentField, setCurrentField] = useState<any>(null);
    const [isSearchOpen, setSearchOpen] = useState(false);


    if (!isOpen || !config) return null;



// 입력값 변경 핸들러

    const handleChange = (key: string, value: any) => {

        setFormData((prev: any) => ({ ...prev, [key]: value }));

    };

    const handleSave = async () => {
        try {

            await saveHr2Data(apiType, formData);

            alert("저장되었습니다.");

            // 목록 갱신
            fetchData();

            // 저장 성공 후 모달 닫기
            onClose();
        } catch (err) {
            alert("저장 실패"+err);
        }
    };


    const handleOpenSearch = (field: any) => {
        setCurrentField(field); // 클릭한 필드의 config 전체(searchType, mapTo 등)를 저장
        setSearchOpen(true);    // 3층 검색 모달 열기
    };

// 3. 검색 결과 처리 핸들러 (수당코드 등 자동 채우기 핵심 로직)
    const handleSearchResult = (selectedData: any) => {
        if (!currentField || !currentField.mapTo) return;
        console.log("원본 데이터 전체:", selectedData);
        const { mapTo } = currentField;
        const updates: any = {};

        // mapTo 설정대로 데이터 매핑 (예: allowanceName -> selectedData['allowanceName'])
        Object.keys(mapTo).forEach((formKey) => {
            const dataKey = mapTo[formKey];
            updates[formKey] = selectedData[dataKey];
        });

        console.log("업데이트될 데이터:", updates)

        setFormData((prev) => ({
            ...prev,
            ...updates
        }));

        setSearchOpen(false); // 검색 완료 후 모달 닫기
    };

    return (

        <div className="modal-Overlay">

            <div className="modal-Container">



                <div className="modal-Header">

                    <h2>{(config as any).title} {baseData ? '수정' : '등록'}</h2>

                    <button onClick={onClose}>X</button>

                </div>



                {/* 본문 */}

                <div>
                    {fields.map((f:any) => {
                        return (
                            <div key={f.key} className="modal-Title">
                                <label>{f.label}</label>
                                <div className="modal-Body">
                                    {f.isDate ? (
                                        <FilterDate
                                            value={formData[f.key] || ""}
                                            onChange={(newDate:any) => handleChange(f.key, newDate)}
                                        />
                                    ) : (
                                        // 2. 일반 타입인 경우 기존 input 사용
                                        <input
                                            type={f.type || "text"}
                                            value={formData[f.key] || ""}
                                            readOnly={f.readOnly}
                                            onChange={(e) => handleChange(f.key, e.target.value)}
                                            style={{
                                                backgroundColor: f.readOnly ? '#f0f0f0' : 'white',
                                                cursor: f.readOnly ? 'not-allowed' : 'text'
                                            }}
                                        />
                                    )}
                                    {/* 돋보기 버튼 */}
                                    {f.hasSearch && (
                                        <button type="button" onClick={() => handleOpenSearch(f)}>
                                            🔍
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>



                {/* 하단 버튼 */}

                <div className="confirm-Footer btn-Wrap">

                    <button className="btn-Primary" onClick={handleSave}>저장</button>

                    <button className="btn-Secondary" onClick={onClose}>취소</button>

                </div>

            <div>
                {/* 3층 검색 모달: SearchModal이 만들어지면 활성화 */}
                {isSearchOpen && (
                    <HRSearchModal
                        searchType={currentField?.searchType} // "user" 또는 "allowance"
                        onSelect={handleSearchResult}        // 선택 시 데이터 자동 매핑
                        onClose={() => setSearchOpen(false)}  // 닫기
                    />
                )}
            </div>
         </div>
        </div>

    );

};


export default HRModal;