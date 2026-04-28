import type React from "react";
import  { type TableProps , type Column} from "../../types/TableProps"




const InventoryTable = (
    { items , columns , page , onItemClick , onItemChange , handleInbound }: {
  items: TableProps[],
  columns: Column[],
  page : number
  handleInbound? : (item: TableProps, e : React.MouseEvent) => void ,
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {

  console.log(items)


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
          <tr key={idx} onClick={(e) => { onItemClick?.(item , e)}}>
            <td>{ 10 * page + idx + 1}</td>
            {columns.map(col => (
              <td key={col.key}>
                
                {item[col.key as keyof TableProps]|| "-"}

                 {col.key === 'orderStatus' && item[col.key] === '대기' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInbound?.(item , e);
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    입고처리
                  </button>
                )}

              </td>
            ))}
            
          </tr>
        ))}
        </tbody>

    </table>
  )
}

export default InventoryTable;


 