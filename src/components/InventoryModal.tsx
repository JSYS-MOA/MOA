import React from 'react'
import { type  ModalProps , type MColumn } from '../types/TModalProps';

const InventoryModal = (  { items , maxPage , columns}: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  maxPage : number
  })  => {
 
  const totalLogisticSno = items.reduce((acc, item) => {
    const value = item.logisticsType === 'OUT' ? -item.logisticSno : item.logisticSno;
    return acc + (Number(value) || 0);
    }, 0);
  const logisticsPrice = items.reduce((acc, item) => {
    const value = item.logisticsType === 'OUT' ? (item.logisticsPrice * -1 * item.logisticSno) : (item.logisticsPrice * item.logisticSno) ;
    return acc + (Number(value) || 0);
    }, 0);
  
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
          {(() => {
                // 입고수량 컬럼일 때: 타입이 'IN'일 때만 숫자 표시
                if (col.key === 'incoming' ) {
                  return item.logisticsType === 'IN' ? item.logisticSno : "-";
                }
                // 출고수량 컬럼일 때: 타입이 'OUT'일 때만 숫자 표시
                if (col.key === 'outgoing') {
                  return item.logisticsType === 'OUT' ? item.logisticSno : "-";
                }
                if (col.key === 'logisticsPrice' && item.logisticsType === 'OUT') {
                  return (item.logisticsPrice * -1)
                }
                 if (col.key === 'totallogisticsPrice') {
                  return item.logisticsType === 'OUT' ? (item.logisticsPrice * -1 * item.logisticSno)  : (item.logisticsPrice * item.logisticSno) 
                }
                // 나머지 일반 컬럼
                return item[col.key as keyof ModalProps] || "-";
              })()}
            </td>
          ))}

      </tr>
    ))}

      <tfoot>
      <tr>
        <td colSpan={2}>합계</td>
        {/* 각 컬럼 위치에 맞게 합계 표시 */}
        <td>{totalLogisticSno.toLocaleString()}</td>
        <td colSpan={2}></td> 
        <td>{logisticsPrice.toLocaleString()}</td>
        
      </tr>
    </tfoot>
       
    </table>
  )
}

export default InventoryModal
