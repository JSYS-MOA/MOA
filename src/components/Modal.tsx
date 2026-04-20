import React from 'react'
import { type  ModalProps , type MColumn } from '../types/TModalProps';

const Modal = (  { items , maxPage , columns}: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  maxPage : number
  })  => {
 
  
  return (
    <table>

      <thead>
          <tr>
            { items ? <th>순번</th> : null}
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>

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

       
    </table>
  )
}

export default Modal
