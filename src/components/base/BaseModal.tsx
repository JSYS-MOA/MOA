



interface BaseModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    data: any; // 수정 시 데이터, 등록 시 null
    columns: any[]; // 입력 필드를 만들기 위한 설정값
}

const BaseModal = ({ title, isOpen, onClose, data, columns }: BaseModalProps) => {
    if (!isOpen) return null;

    return (
        <div>
            {/* 상단: 헤더 */}
            <div>
                <span>{title} {data ? "수정" : "등록"}</span>
                <button onClick={onClose}>X</button>
            </div>

            {/* 중단: 입력 폼 영역 */}
            <div>
                {columns.map((col) => (
                    <div key={col.key}>
                        <label>{col.label}</label>

                        {/* '사용여부'처럼 선택형인 경우와 일반 입력형 구분 */}
                        {col.key.toLowerCase() === 'id' ? (
                            <input
                                type="text"
                                defaultValue={data ? data[col.key] : ""}
                                readOnly={!!data} // 데이터가 있으면(수정 모드) 수정 불가
                                placeholder="자동 생성"
                            />
                        ) : col.key.toLowerCase().includes('use') || col.key.toLowerCase().includes('status') ? (
                            <select defaultValue={data ? data[col.key] : "Y"}>
                                <option value="Y">사용</option>
                                <option value="N">미사용</option>
                            </select>
                        ) : (
                            /* 2. 일반 입력 필드 */
                            <input
                                type="text"
                                placeholder={col.label}
                                defaultValue={data ? data[col.key] : ""}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* 하단: 액션 버튼 (사진 하단 위치) */}
            <div>
                <button onClick={() => console.log("저장 로직")}>저장</button>
                <button onClick={onClose}>취소</button>
            </div>
        </div>
    );
};

export default BaseModal;