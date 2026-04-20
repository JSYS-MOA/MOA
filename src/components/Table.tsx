import  { type TableProps } from "../types/TableProps"


const Table = ({ items, columns }: { items: TableProps[]; columns: any[] }) => {


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
