import  { type TableProps } from "../types/TableProps"


const Table = ({ items }: { items: TableProps[] }) => {

  // 테이블 필요한 명 여기서 +  /types/TableProps  추가
   const columns = [
    { key: 'employeeId', label: '사원번호' },
    { key: 'userName', label: '성명' },
  ].filter(col => items.some(item =>
    item[col.key as keyof TableProps]));


  return (
    <table>

        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => (
          <tr key={idx}>
            {columns.map(col => (
              <td key={col.key}>
                {item[col.key as keyof TableProps] || "-"}
              </td>
            ))}
          </tr>
        ))}
        </tbody>

    </table>
  )
}

export default Table
