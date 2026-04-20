import type React from "react";
import  { type TableProps , type Column} from "../types/TableProps"


const Table = ({ items , columns , onItemClick , onItemChange}: {
  items: TableProps[],
  columns: Column[],
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {

    console.log(items)
  return (
    <table>

        <thead>
          <tr>
            { items ? <th>순번</th> : null}
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
            { 'roleId' in  items ? <th>권한승인</th> : null}
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => (
          <tr key={idx} onClick={(e) => { onItemClick?.(item , e)}}>
            <td>{idx + 1}</td>
            {columns.map(col => (
              <td key={col.key}>
                {item[col.key as keyof TableProps]|| "-"}
              </td>
            ))}

              {'roleId' in  item ?
              <td>
                <select onChange={(e)=>{onItemChange?.(e)}} name="roleId" id={item.userId} defaultValue={item.roleId} >
                  <option value={1} >관리자</option>
                  <option value={2} >모든인사</option>
                  <option value={3} >모든물류</option>
                  <option value={4} >모든영업</option>
                  <option value={5} >일부인사</option>
                  <option value={6} >일부물류</option>
                  <option value={7} >일부영업</option>
                </select>
              </td>
              : null }
              

          </tr>
        ))}
        </tbody>

    </table>
  )
}

export default Table
