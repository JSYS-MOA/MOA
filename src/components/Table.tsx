



interface TableProps {
    items: any[];
    columns: any[];
    showCheckbox?: boolean;    // 추가: 체크박스 표시 여부
    selectedIds?: any[];      // 추가: 선택된 ID 목록
    onCheck?: (idOrIds: any, checked: boolean, isAll?: boolean) => void; // 추가: 체크 이벤트 핸들러
}



const Table = ({
                   items,
                   columns,
                   showCheckbox = false,
                   selectedIds = [],
                   onCheck
               }: TableProps) => {

    //전체 선택 핸들러
    const handleAllCheck = (checked: boolean) => {
        if (!onCheck) return; // onCheck가 없을 경우 대비 (공용 컴포넌트 필수 방어)
        if (checked) {
            const allIds = items.map((item: any) => item.id);
            onCheck(allIds, true, true);
        } else {
            onCheck([], false, true);
        }
    };

    return (
        <table>
            <thead>
            <tr>
                {showCheckbox && (
                    <th>
                        <input
                            type="checkbox"
                            onChange={(e) => handleAllCheck(e.target.checked)}
                            checked={items.length > 0 && selectedIds.length === items.length}
                        />
                    </th>
                )}
                {/* 컬럼 헤더 렌더링 로직 (col.label) 누락 해결 */}
                {columns.map((col) => (
                    <th key={col.key}>
                        {col.label || col.key}
                    </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {items.length > 0 ? (
                items.map((item, idx) => (
                    <tr key={idx}>
                        {showCheckbox === true && (
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds?.includes(item.id)}
                                    // 개별 체크 시 세 번째 인자(isAll)를 false로 전달
                                    onChange={(e) => onCheck?.(item.id, e.target.checked, false)}
                                />
                            </td>
                        )}
                        {columns.map((col) => (
                            <td key={col.key}>
                                {/* render 함수 호출 시 item 객체 전체를 두 번째 인자로 전달 (유연성 확보) */}
                                {col.render
                                    ? col.render(item[col.key], item)
                                    : (item[col.key] !== undefined && item[col.key] !== null
                                        ? String(item[col.key])
                                        : "-")
                                }
                            </td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    {/* 체크박스 유무에 따라 colSpan이 달라져야 함 (+1) */}
                    <td
                        colSpan={showCheckbox ? columns.length + 1 : columns.length}
                    >
                        조회된 데이터가 없습니다.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
};

export default Table;