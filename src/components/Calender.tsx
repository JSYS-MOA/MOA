import { useState } from 'react';


const Calender = () => {

 const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: lastDateOfMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };


  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => changeMonth(-1)}>이전</button>
        {year}년 {month + 1}월
        <button onClick={() => changeMonth(1)}>다음</button>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', fontWeight: 'bold' }}>
        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
      
        {emptySlots.map(i => <div key={`empty-${i}`} />)}
        
      
        {days.map(day => (
          <div key={day} style={{ padding: '10px', border: '1px solid #f0f0f0' }}>
            {day}
          </div>
        ))}

      </div>
    </div>
  )
}

export default Calender
