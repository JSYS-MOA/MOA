import type React from "react";
import  { type TableProps , type Column} from "../../types/TableProps"
import "../../assets/styles/inventory/inventoryTable.css";



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
      <div className="common-Table-Wrapper">
          <table className="common-Table">

              <thead>
              <tr>
                  { items ? <th>순번</th> : null}
                  {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
              </thead>

              <tbody>
              {items.map((item, idx) => (
                  <tr key={idx} onClick={(e) => { onItemClick?.(item, e) }}>
                      <td>{10 * page + idx + 1}</td>

                      {columns.map(col => {
                          const rawValue = item[col.key as keyof TableProps];

                          return (
                              <td key={col.key}>
                                  {(() => {
                                      if (typeof rawValue === 'string' && rawValue.includes('T') && col.key === 'reqDate') {
                                          return rawValue.split('T')[0];
                                      }

                                      return rawValue || "-";
                                  })()}

                                  {col.key === 'orderStatus' && item[col.key] === '대기' && (
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleInbound?.(item, e);
                                          }}
                                      >
                                          입고처리
                                      </button>
                                  )}

                              </td>
                          );
                      })}
                  </tr>
              ))}
              </tbody>

          </table>
      </div>
  )
}

export default InventoryTable;


 