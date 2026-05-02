import React from 'react'
import  { type TableProps , type Column} from "../../types/TableProps"

const TeamMemberTable = (
    { items , columns , page , onItemClick }: {
  items: TableProps[],
  columns: Column[],
  page : number,
  handleitems? : (item: TableProps, e : React.MouseEvent) => void ,
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {
  
  return (
    <table className="inventory-table">
    
      <thead className="inventory-table-header">
        <tr>
          { items ? <th>순번</th> : null}
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>

      <tbody className="inventory-table-body">
        {items.map((item, idx) => (
        <tr className='Select-Pointer' key={idx} onClick={(e)=>onItemClick?.(item , e)}>
          <td>{ 10 * page + idx + 1}</td>

          {columns.map(col => (
            
            <td key={col.key}>
              
              {item[col.key as keyof TableProps]|| ""}
  
            </td>
          ))}    

        </tr>
      ))}
      </tbody>

    </table>
  )
}

export default TeamMemberTable
