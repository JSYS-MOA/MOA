

const FilterDate = ({ label, value, onChange }: any) => {
        // console.log("📍 FilterDate로 넘어온 value:", value);

        const getSafeValue = (val: any) => {
            if (!val) return { y: "", m: "", d: "" };

            // [수정] 문자열 "YYYY-MM-DD" 형식인 경우 객체로 파싱
            if (typeof val === 'string' && val.includes('-')) {
                const [y, m, d] = val.split('-');
                return {
                    y: y || "",
                    m: String(Number(m)) || "",
                    d: String(Number(d)) || ""
                };
            }

            // [수정] 이미 객체인 경우 (필터에서 넘어오는 형태)
            return {
                y: String(val.y || ""),
                m: String(val.m || ""),
                d: String(val.d || "")
            };
        };

        const safeValue = getSafeValue(value);

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        const getLastDay = (year: string, month: string) => {
            if (!year || !month) return 31;
            return new Date(parseInt(year), parseInt(month), 0).getDate();
        };

        const lastDay = getLastDay(safeValue.y, safeValue.m);
        const days = Array.from({ length: lastDay }, (_, i) => i + 1);

        const handleDateChange = (key: string, newVal: string) => {
            const nextValue = { ...safeValue, [key]: newVal };

            // 부모가 문자열을 사용 중인지 확인 (모달 vs 필터 구분용)
            const isParentUsingString = typeof value === 'string';

            // 세 값이 다 있을 때 처리
            if (nextValue.y && nextValue.m && nextValue.d) {
                if (isParentUsingString) {
                    // 1. 모달 등 문자열을 기대하는 경우: "YYYY-MM-DD" 리턴
                    const formatted = `${nextValue.y}-${nextValue.m.padStart(2, '0')}-${nextValue.d.padStart(2, '0')}`;
                    onChange(formatted);
                } else {
                    // 2. 필터 등 객체를 기대하는 경우: {y, m, d} 리턴
                    onChange({
                        y: nextValue.y,
                        m: nextValue.m.padStart(2, '0'),
                        d: nextValue.d.padStart(2, '0')
                    });
                }
            } else {
                onChange(null);
            }
        };
    return (
        <div className="filter-date-group">
            <span>{label}</span>
            <select
                value={safeValue.y}
                onChange={(e) => handleDateChange('y', e.target.value)}
                style={{
                        width: '75px',
                        paddingRight: '20px'
                }}
            >
                <option value="">연</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span> / </span>
            <select
                value={safeValue.m}
                onChange={(e) => handleDateChange('m', e.target.value)}
                style={{
                    width: '75px',
                    paddingRight: '20px'
                }}
            >
                <option value="">월</option>
                {months.map(m => (
                    <option key={m} value={String(m)}>
                        {m.toString().padStart(2, '0')}
                    </option>
                ))}
            </select>
            <span> / </span>
            <select
                value={safeValue.d}
                onChange={(e) => handleDateChange( 'd', e.target.value)}
                style={{
                    width: '75px',
                    paddingRight: '20px'
                }}
            >
                <option value="">일</option>
                {days.map(d => (
                    <option key={d} value={d}>
                        {d.toString().padStart(2, '0')}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterDate;