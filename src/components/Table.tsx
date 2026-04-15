import type React from "react";
import  { type TableProps } from "../types/TableProps"


const Table = ({ items , onItemClick , onItemChange}: {
  items: TableProps[],
  onItemClick?: (item: TableProps, e : React.MouseEvent) => void ,
  onItemChange?: (e : React.ChangeEvent) => void 
  }) => {

  // 테이블 필요한 명 여기서 +  /types/TableProps  추가
   const columns = [
    { key: 'employeeId', label: '사원번호' },
    { key: 'userName', label: '성명' },
    { key: 'gradeName', label: '직급/직위' },
    { key: 'phone', label: '연락처' },
    { key: 'email', label: 'Email' },
    //재고 관련
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '창고명' },
    { key: 'productPrice', label: '입고단가' },
    { key: 'inventorySno', label: '총재고수량' }
  ].filter(col => items.some(item =>
    item[col.key as keyof TableProps]));

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
          <tr key={idx}>
            <td onClick={(e) => { onItemClick?.(item , e)}}>{idx + 1}</td>
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
