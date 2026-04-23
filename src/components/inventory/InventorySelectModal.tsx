import React from 'react'
import type { ModalProps } from '../../types/ModalProps'

const InventorySelectModal = ( { title , items , maxPage , onSelect , onClose  }: {
  title: string;
  items: any[] ,
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
            {title === 'PRODUCT' ? (
              items.map((product: any) => (
                <tr key={product.productId} onClick={() => onSelect(product)}>
                  <td>{product.productCord}</td>
                  <td>{product.productName}</td>
                  <td>{product.unitPrice}</td>
                </tr>
              ))
            ) : null }

            {title === 'VENDOR' ? (
              items.map((vendor: any) => (
                <tr key={vendor.vendorId} onClick={() => onSelect(vendor)} >
                  <td>{vendor.vendorCord}</td>
                  <td>{vendor.vendorName}</td>
                </tr>
              ))
            ) : null }

          </tbody>
        </table>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}

export default InventorySelectModal
