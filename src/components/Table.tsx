

export interface TableColumn<T> {
    key: keyof T | string; // 데이터의 키값
    label: string;         // 헤더 이름
    render?: (val: any, item: T) => React.ReactNode;
}

interface TableProps<T> {
    items: T[];
    idKey?: string;
    columns: TableColumn<T>[];
    showCheckbox?: boolean;    // 체크박스 표시 여부
    selectedIds?: any[];       // 선택된 ID 목록
    onCheck?: (idOrIds: any, checked: boolean, isAll?: boolean) => void; // 체크 이벤트 핸들러
    render?: (value: any) => React.ReactNode;
    className?: string;
    wrapperStyle?: React.CSSProperties;
    rowClassName?: (item: T) => string;
}



const Table = <T,>({
                   items,
                   columns,
                   idKey='id',
                   showCheckbox = false,
                   selectedIds = [],
                   onCheck, className, wrapperStyle,rowClassName
}: TableProps<T>) => {

    //전체 선택 핸들러
    const handleAllCheck = (checked: boolean) => {
        if (!onCheck) return;

        // items의 각 객체에서 실제 ID값을 추출
        const allIds = items.map((item: any) => item[idKey]);

        // 부모의 handleCheck(idOrIds, isChecked, isAll) 호출
        onCheck(allIds, checked, true);
    };

    return (
        <div style={wrapperStyle}>
            <table className={`common-Table ${className ?? ""}`}>
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
                        <th key={String(col.key)}>
                            {col.label || String(col.key)}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {items.length > 0 ? (
                    items.map((item: any, idx) => (
                        <tr key={item[idKey] || idx}>
                            {showCheckbox === true && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds?.includes(item[idKey])}
                                        // 개별 체크 시 세 번째 인자(isAll)를 false로 전달
                                        onChange={(e) => onCheck?.(item[idKey], e.target.checked, false)}
                                    />
                                </td>
                            )}
                            {columns.map((col) => (
                                <td
                                    key={String(col.key)}
                                    className={rowClassName?.(item) ?? ""}
                                >
                                    {/* render 함수 호출 시 item 객체 전체를 두 번째 인자로 전달 (유연성 확보) */}
                                    {col.render
                                        ? col.render((item as any)[col.key], item)
                                        : ((item as any)[col.key] !== undefined && (item as any)[col.key] !== null
                                            ? String((item as any)[col.key])
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
        </div>
    );
};

export default Table;