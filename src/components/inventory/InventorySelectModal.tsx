import React from 'react'
import type { ModalProps } from '../../types/ModalProps'

const InventorySelectModal = ( { items , maxPage , onSelect , onClose  }: {
  items: ModalProps[] ,
  maxPage ?: number ,
  onSelect : any ,
  onClose : any
 
  })  => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>상품 선택</h3>
        <table>
          <tbody>
            {items.map((product: any) => (
              <tr key={product.productId} onClick={() => onSelect(product)} style={{cursor:'pointer'}}>
                <td>{product.productCord}</td>
                <td>{product.productName}</td>
                <td>{product.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}

export default InventorySelectModal
