

const FilterDate = ({ label, value, onChange }: any) => {
    // 연도 생성 (현재 기준 -5년 ~ +5년)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // 월 생성 (1~12)
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const getLastDay = (year: string, month: string) => {
        if (!year || !month) return 31; // 선택 전에는 기본 31일
        // month는 1~12이므로, 다음달의 0번째 날을 찾으면 이번달 마지막 날이 나옴
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    };

    // 일 생성
    const lastDay = getLastDay(value.y, value.m);
    const days = Array.from({ length: lastDay }, (_, i) => i + 1);

    const safeValue = value || { y: "", m: "", d: "" };

    return (
        <div className="filter-date-group">
            <span>{label}</span>
            <select
                value={safeValue.y}
                onChange={(e) => onChange({...safeValue, y: e.target.value})}
                style={{
                        width: '75px',
                        paddingRight: '20px'
                }}
            >
                <option value="">연</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span>/</span>
            <select
                value={safeValue.m}
                onChange={(e) => onChange({...safeValue, m: e.target.value})}
                style={{
                    width: '75px',
                    paddingRight: '20px'
                }}
            >
                <option value="">월</option>
                {months.map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
            </select>
            <span>/</span>
            <select
                value={safeValue.d}
                onChange={(e) => onChange({...safeValue, d: e.target.value})}
                style={{
                    width: '75px',
                    paddingRight: '20px'
                }}
            >
                <option value="">일</option>
                {days.map(d => (
                    <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                ))}
            </select>
        </div>
    );
};

export default FilterDate;