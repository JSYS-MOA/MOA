import React from 'react'
import { type  ModalProps } from '../types/ModalProps';

const Modal = (  { items , maxPage}: {
  items: ModalProps[] ,
  maxPage : number
  })  => {
  
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
      item[col.key as keyof ModalProps]));

  
  return (
    <div>
      {items.map((item, idx) => (
      <tr key={idx}>
        <td >{idx + 1}</td>
        {columns.map(col => (
          <td key={col.key}>
            {item[col.key as keyof ModalProps]|| "-"}
          </td>
        ))}    

      </tr>
    ))}

       
    </div>
  )
}

export default Modal
