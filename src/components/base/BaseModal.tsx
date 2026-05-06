import {baseConfigs} from "../../types/baseConfigs.tsx";
import {saveBaseData, updateBaseData} from "../../apis/BaseService.tsx";
import {useEffect, useState} from "react";
import {IoCloseOutline} from "react-icons/io5";


interface BaseModalProps {
    apiType: keyof typeof baseConfigs; // 어떤 페이지인지 알아야 함
    title: string;
    isOpen: boolean;
    onClose: () => void;
    baseData: any; // input 데이터 (초기 insert 시 null)
    fetchData: () => void; // 새로고침 함수
    columns: any[]; // 입력 필드를 만들기 위한 설정값
}

const BaseModal = ({ title, isOpen, apiType,onClose, baseData, fetchData, columns }: BaseModalProps) => {

    const [formData, setFormData] = useState<any>({});
    useEffect(() => {
        if (isOpen) {
            setFormData(baseData || {});
        }
    }, [isOpen, baseData]);
    if (!isOpen) return;

    // 입력값이 바뀔 때마다 formData를 업데이트하는 함수
    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // 1. 현재 어떤 설정인지 가져오기 (adminRole 등)
        const config = baseConfigs[apiType as keyof typeof baseConfigs];
        const idKey = config.idKey; // "adminId"
        const idValue = formData[idKey]; // 현재id

        try {
            if (idValue) {
                // [수정 로직] ID가 있으면 updateBaseData 호출
                await updateBaseData(apiType, idValue, formData);
                alert("수정되었습니다.");
            } else {
                // [등록 로직] ID가 없으면 saveBaseData 호출
                console.log("지금 서버로 보내는 데이터:", formData);
                await saveBaseData(apiType, formData);
                alert("등록되었습니다.");
            }

            fetchData(); // 테이블 새로고침
            onClose();   // 모달 닫기
        } catch (error) {
            console.error("저장 중 오류 발생:", error);
            alert("저장에 실패했습니다.");
        }
    };

    return (
        <div className="modal-Overlay">
            <div className="modal-Container">
            {/* 상단: 헤더 */}
            <div className="modal-Header">
                <span>{title} {baseData ? "수정" : "등록"}</span>
                <button onClick={onClose}><IoCloseOutline color="#fff" size={18}/></button>
            </div>

            {/* 중단: 입력 폼 영역 */}
            <div className="modal-Body">
                <div className="modal-Children">
                {columns.map((col) => (
                    <div key={col.key} className="modal-Row">
                        <label>{col.label}</label>

                        {/* '사용여부'처럼 선택형인 경우와 일반 입력형 구분 */}
                        {col.key.toLowerCase().includes('id') ? (
                            <input
                                type="text"
                                defaultValue={baseData ? baseData[col.key] : ""}
                                onChange={(e) => handleChange(col.key, e.target.value)}
                                readOnly={!!baseData} // 데이터가 있으면(수정 모드) 수정 불가
                                placeholder="자동 생성"
                            />
                        ) : col.key.toLowerCase().includes('use') || col.key.toLowerCase().includes('status') ? (
                            <select
                                value={formData[col.key] === 1 ? 1 : 0}
                                onChange={(e) => handleChange(col.key, Number(e.target.value))}
                            >
                                <option value={1}>사용</option>
                                <option value={0}>미사용</option>
                            </select>
                        ) : (
                            /* 2. 일반 입력 필드 */
                            <input
                                type="text"
                                placeholder={col.label}
                                value={formData[col.key] || ""}
                                onChange={(e  ) => handleChange(col.key, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </div>
            </div>
                {/* 하단: 액션 버튼 (사진 하단 위치) */}
                <div className="modal-Footer">
                    <div className="btn-Wrap">
                        <button onClick={handleSave} className="btn-Primary">저장</button>
                        <button onClick={onClose} className="btn-Secondary">취소</button>
                    </div>
                </div>
        </div>
        </div>
    );
};

export default BaseModal;