import {MdSearch} from "react-icons/md";

// 1. 타입을 좀 더 유연하게 바꿉니다 (사원뿐만 아니라 부서, 문서도 가능하게)
interface SelectedItem {
    id: number | string;
    name: string;
}

interface TagInputProps {
    selectedItems: SelectedItem[]; // 이제 전체 리스트를 안 받고 선택된 리스트만 받음
    onRemove: (id: number | string) => void;
    onClear: () => void;
    onClick: () => void; // 이 onClick이 실행되면 부모에서 모달을 띄움
    disabled?: boolean;
    placeholder?: string;
    maxVisible?: number;
}

const TestTagInput = ({
                      selectedItems,
                      onRemove,
                      onClear,
                      onClick,
                      disabled = false,
                      placeholder = "검색",
                      maxVisible = 3
                  }: TagInputProps) => {

    return (
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            height:"27px",
            background: "var(--color-inverse)",
            opacity: disabled ? 0.6 : 1, // disabled 상태 추가
            cursor: disabled ? "default" : "pointer"
        }}>
            {/* 돋보기 버튼 영역 */}
            <div
                onClick={() => { if (!disabled) onClick(); }}
                style={{
                    width: "30px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: "0.5px solid var(--border)",
                    flexShrink: 0,
                }}>
                <MdSearch color="#cdcdcd" size={16}/>
            </div>

            {/* 태그 표시 영역 */}
            <div
                onClick={() => { if (!disabled) onClick(); }}
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "0 8px",
                    overflow: "hidden",
                    height: "100%",
                }}
            >
                {selectedItems.slice(0, maxVisible).map(item => (
                    <span
                        key={item.id}
                        style={{
                            fontSize: "12px",
                            background: "#5E5C77",
                            color: "#ffffff",
                            fontWeight:"100",
                            borderRadius: "20px",
                            padding: "2px 8px",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            flexShrink: 0,
                        }}
                    >
                        {item.name}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disabled) onRemove(item.id);
                            }}
                            style={{cursor: "pointer", lineHeight: 1, fontSize:"15px"}}
                        >×</span>
                    </span>
                ))}

                {selectedItems.length > maxVisible && (
                    <span style={{
                        fontSize: "12px",
                        background: "var(--color-gray-100)",
                        border:"1px solid var(--border)",
                        color: "var(--text-secondary)",
                        borderRadius: "20px",
                        padding: "2px 10px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}>
                        +{selectedItems.length - maxVisible}
                    </span>
                )}
                {selectedItems.length === 0 && (
                    <span style={{fontSize: "13px", color: "var(--text-tertiary)"}}>
                        {placeholder}
                    </span>
                )}
            </div>

            {/* 전체 삭제 버튼 */}
            {selectedItems.length > 0 && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) onClear();
                    }}
                    style={{
                        width: "30px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderLeft: "0.5px solid var(--border)",
                        flexShrink: 0,
                        cursor: "pointer",
                        color: "#cdcdcd",
                        fontSize: "20px",
                    }}
                >×</div>
            )}
        </div>
    );
};

export default TestTagInput;