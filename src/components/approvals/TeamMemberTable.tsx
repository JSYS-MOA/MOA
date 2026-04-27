import React from 'react'
import  { type TableProps , type Column} from "../../types/TableProps"

const TeamMemberTable = (
    { items , columns , onItemClick , onItemChange , handleitems}: {
  items: TableProps[],
  columns: Column[],
  handleitems? : (item: TableProps, e : React.MouseEvent) => void ,
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {
  
  return (
    <table>
    
      <thead>
        <tr>
          { items ? <th>순번</th> : null}
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>

      <tbody>
        {items.map((item, idx) => (
        <tr key={idx} onClick={(e)=>onItemClick?.(item , e)}>
          <td>{idx + 1}</td>

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
