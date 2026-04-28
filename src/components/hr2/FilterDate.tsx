

const FilterDate = ({ label, value, onChange }: any) => {
    // 연, 월, 일 배열 생성 로직 (생략)

    return (
        <div className="filter-date-group">
            <span>{label}</span>
            <select value={value.y} onChange={(e) => onChange({...value, y: e.target.value})}>
                {/* 연도 옵션 */}
            </select>
            /
            <select value={value.m} onChange={(e) => onChange({...value, m: e.target.value})}>
                {/* 월 옵션 */}
            </select>
            /
            <select value={value.d} onChange={(e) => onChange({...value, d: e.target.value})}>
                {/* 일 옵션 */}
            </select>
        </div>
    );
};

export default FilterDate;