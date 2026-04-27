import React, { useState } from 'react'
import type { ModalProps } from '../../types/ModalProps'

const InventorySelectModal = ( { title , items , maxPage , onSelect , onClose  }: {
  title: string;
  items: any[] ,
  maxPage ?: number ,
  onSelect : any ,
  onClose : any
 
  })  => {

    const [page, setPage] = useState(0);

    const changePage = (num: number) => {
      const totalPage = maxPage ?? 1; 
      const newPage : number = page + num
    if( newPage <= 0 ) {
      setPage(0);
    } else if(  newPage >= totalPage -1) {
        setPage(totalPage -1);
    } else {
      setPage( page => page + num);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>항목 선택</h3>
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

            {title === 'STORAGE' ? (
              items.map((storage: any) => (
                <tr key={storage.storageId} onClick={() => onSelect(storage)} >
                  <td>{storage.storageCord}</td>
                  <td>{storage.storageName}</td>
                </tr>
              ))
            ) : null }

            {title === 'INVENTORY' ? (
              items.map((inventory: any) => (
                <tr key={inventory.inventoryId} onClick={() => onSelect(inventory)} >
                  <td>{inventory.productName}</td>
                  <td>{inventory.productCord}</td>
                  <td>{inventory.storageName}</td>
                  <td>{inventory.expirationDate}</td>
                </tr>
              ))
            ) : null }

            {title === 'LINE' ? (
              items.map((line: any) => (
                <tr key={line.inventoryId} onClick={() => onSelect(line)} >
                  <td>{line.approvalLineCord}</td>
                  <td>{line.approvalLineUser}</td>
                  <td>{line.approvalLineName}</td>
                </tr>
              ))
            ) : null }

            {title === 'DOCUMENT' ? (
              items.map((document: any) => (
                <tr key={document.documentId} onClick={() => onSelect(document)} >
                  <td>{document.documentCord}</td>
                  <td>{document.documentName}</td>
                </tr>
              ))
            ) : null }


          </tbody>
        </table>
        <button onClick={()=>{changePage(-1)}}>aa</button>
        <button onClick={()=>{changePage(1)}}>aa</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}

export default InventorySelectModal
