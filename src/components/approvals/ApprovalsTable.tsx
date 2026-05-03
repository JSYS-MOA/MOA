import React from 'react'
import  { type TableProps , type Column} from "../../types/TableProps"
import "../../assets/styles/inventory/inventoryTable.css";

const ApprovalsTable = (
    { items , columns , page , onItemClick }: {
  items: TableProps[],
  columns: Column[],
  page : number
  handleitems? : (item: TableProps, e : React.MouseEvent) => void ,
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {
      
  return (
      <div className="inventory-Table-Wrapper">
          <table className="inventory-table">

              <thead className="inventory-table-header">
              <tr>
                  { items ? <th>순번</th> : null}
                  {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
              </thead>

              <tbody className="inventory-table-body">
              {items.map((item, idx) => (
                  <tr key={idx} >
                      <td>{ 10 * page + idx + 1}</td>

                      {columns.map(col => (
                          <td key={col.key}>
                              {col.key === 'approvaInfo' && (
                                  <button
                                      className='btn-Secondary'
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onItemClick?.(item , e);
                                      }}>
                                      보기
                                  </button>
                              )}

                              {(() => {
                                  const columnKey = col.key as string;
                                  const value = columnKey.includes('.')
                                      ? columnKey.split('.').reduce((obj: any, key) => obj?.[key], item)
                                      : (item as any)[col.key];

                                  if (col.key === 'approvaDate' && value) {
                                      return String(value).substring(0, 10).replace(/-/g, '-');
                                  }

                                  if (col.key === 'approvaInfo') return null;

                                  return value || "";
                              })()}
                          </td>
                      ))}

                  </tr>
              ))}
              </tbody>

          </table>
      </div>

  )
}

export default ApprovalsTable
