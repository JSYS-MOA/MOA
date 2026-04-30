import type React from "react";
import  { type TableProps , type Column} from "../../types/TableProps"
import MapDropdownSelect from "./MapDropdownSelect"


const AdminTable = (
    { items , columns, page , onItemClick , onItemChange  , select}: {
  items: TableProps[],
  columns: Column[],
  page : number
  select? : any [] ,
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: ( id: number, value : number) => void 
  }) => {

  console.log(items)


  return (
    <table className="inventory-table">

        <thead className="inventory-table-header">
          <tr>
            { items ? <th>순번</th> : null}
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
            { 'roleId' in  items[0] ? <th>권한승인</th> : null}
          </tr>
        </thead>

        <tbody className="inventory-table-body">
          {items.map((item, idx) => (
          <tr key={idx} onClick={(e) => { onItemClick?.(item , e)}}>
            <td>{ 10 * page + idx + 1}</td>
            {columns.map(col => (
              <td key={col.key}>
                
                {item[col.key as keyof TableProps]|| "-"}

  

              </td>
            ))}

              {'roleId' in  item ?
              <td>
                    <MapDropdownSelect  id={item.userId || 0 } value={item.roleId || 0 } options={select || [] } onChange={(id, value)=>{onItemChange?.(id, value)}} />
                

                {/* <select className="select-dropdown" onChange={(e)=>{onItemChange?.(e)}} name="roleId" id={item.userId} defaultValue={item.roleId} >
                  {select?.map((option) =>(
                    <option value={option.id} > {option.name}</option>
                  ))}
                </select> */}
              </td>
              : null }

  

          </tr>
        ))}
        </tbody>

    </table>
  )
}

export default AdminTable;


 