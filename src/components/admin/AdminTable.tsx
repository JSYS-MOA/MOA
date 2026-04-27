import type React from "react";
import  { type TableProps , type Column} from "../../types/TableProps"




const AdminTable = (
    { items , columns , onItemClick , onItemChange , handleInbound , select}: {
  items: TableProps[],
  columns: Column[],
  select? : any [] ,
  handleInbound? : (item: TableProps, e : React.MouseEvent) => void ,
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

              {'roleId' in  item ?
              <td>
                <select onChange={(e)=>{onItemChange?.(e)}} name="roleId" id={item.userId} defaultValue={item.roleId} >
                  {select.map((option) =>(
                    <option value={option.id} > {option.name}</option>
                  ))}
                </select>
              </td>
              : null }

  

          </tr>
        ))}
        </tbody>

    </table>
  )
}

export default AdminTable;


 