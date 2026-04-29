import React from 'react'
import {IoCloseOutline} from "react-icons/io5";
import { type  ModalProps , type MColumn } from '../../types/ModalProps';

const InventoryModal = (  { items , maxPage , title, columns ,onClose, keySno , keyPrice , keytype }: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  onClose: () => void 
  maxPage : number ,
  title? : string ,
  keySno : string ,
  keyPrice : string ,
  keytype : string
  })  => {


  const totalSno = items.reduce((acc, item) => {
    const targetItem = item as any; 
    const snoValue = targetItem[keytype] === 'OUT' ? -targetItem[keySno] : targetItem[keySno];

    return acc + (Number(snoValue) || 0); 
  }, 0);
  
  const totalAmount = items.reduce((acc, item) => {
    const targetItem = item as any; 
    const priceValue = targetItem[keytype] === 'OUT' ? (targetItem[keySno] * -1 * targetItem[keyPrice]) : (targetItem[keySno]* targetItem[keyPrice]) ;
    return acc + (Number(priceValue) || 0);
    }, 0);
  
  return (
    <div className='modal-Container'>

      <div className="modal-Header">
          <p>
            {title}
          </p>
          <button onClick={onClose}>
              <IoCloseOutline color="#fff" size={18}/>
          </button>
        </div>

        <div className="modal-Title">
          { title === '재고현황' ?  <p>재고수불부</p>: null }
          { title === '불량/페기현황' ?  <p>불량/페기현황상세</p>: null }
          { title === '입고현황' ?  <p>발주상세</p>: null }
          { title === '출고현황' ?  <p>출고상세</p>: null }
      </div>

      <div className='modal-Body'>
        <table className='inventory-table'>
          <thead className="inventory-table-header">
              <tr>
                { items ? <th>순번</th> : null}
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
          </thead>

          <tbody className="inventory-table-body">
            {items.map((item, idx) => (
            <tr key={idx}>
              <td >{idx + 1}</td>
              {columns.map(col => (
                <td key={col.key}>    
                {(() => {
                      const targetItem = item as any;

                      if (col.key === 'incoming' && col.label === '출고수량' ) {
                        return targetItem[keytype] === 'OUT' ? -targetItem[keySno] : "-";
                      }

                      // 입고수량 컬럼일 때: 타입이 'IN'일 때만 숫자 표시
                      if (col.key === 'incoming' ) {
                        return targetItem[keytype] === 'IN' ? targetItem[keySno] : "-";
                      }
                      // 출고수량 컬럼일 때: 타입이 'OUT'일 때만 숫자 표시
                      if (col.key === 'outgoing') {
                        return targetItem[keytype] === 'OUT' ? targetItem[keySno] : "-";
                      }
                      if (col.key === 'logisticsPrice' && targetItem[keytype] === 'OUT') {
                        return (targetItem[keyPrice] * -1)
                      }
                      if (col.key === 'totallogisticsPrice') {
                        return targetItem[keytype] === 'OUT' ? (targetItem[keyPrice] * -1 * targetItem[keySno])  : (targetItem[keyPrice] * targetItem[keySno]) 
                      }
                      // 나머지 일반 컬럼
                      return item[col.key as keyof ModalProps] || "-";
                    })()}
                  </td>
                ))}

            </tr>
          ))}
          </tbody>

          <tfoot className="inventory-table-header">
            <tr>
              {(() => {
                const qtyIndex = columns.findIndex(col => col.key === 'incoming' || col.key === keySno);
                const firstDataColPos = qtyIndex !== -1 ? qtyIndex + 1 : 1;

                return (
                  <>
                    <td colSpan={firstDataColPos} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      합계
                    </td>

                    {columns.slice(qtyIndex).map((col) => {
                      if (col.key === 'incoming' || col.key === keySno ) {
                        return <td key={col.key} style={{ fontWeight: 'bold' }}>{totalSno}</td>;
                      }
                      if (col.key === 'totallogisticsPrice') {
                        return <td key={col.key} style={{ fontWeight: 'bold' }}>{totalAmount}</td>;
                      }

                      return <td key={col.key}></td>;
                    })}
                  </>
                );
              })()}
            </tr>
          </tfoot>
          
        </table>
      </div>

      <div className="modal-Footer">
          <div className="btn-Wrap">
              <button className="btn-Secondary" onClick={onClose}>닫기</button>
          </div>
      </div>

    </div>
  )
}

export default InventoryModal
