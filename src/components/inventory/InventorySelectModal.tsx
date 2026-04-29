import React, { useState } from 'react'
import {IoCloseOutline} from "react-icons/io5";

const InventorySelectModal = ( { title , items , maxPage , onSelect , onClose  }: {
  title: string;
  items: any[] ,
  maxPage ?: number ,
  onSelect : any ,
  onClose : any
 
  })  => {

    const maxPagevalue =  maxPage || 1
    const [page, setPage] = useState(0);

    const changePage = (e : React.MouseEvent ,num: number) => {
      e.preventDefault();
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
    <div className="modal-Select-Overlay">
      <div className='modal-Select-Container'>

        <div className="modal-Header">
            <p>항목 선택</p>
            <button onClick={onClose}>
                <IoCloseOutline color="#fff" size={18}/>
            </button>
          </div>
  
          <div className="modal-Title">
            <p>항목 선택</p>
        </div>

        <table className='modal-Table , inventory-table'>

          <thead className="inventory-table-header">
              <tr>
                {(title as string)  !== 'PRODUCT'  && (title as string)  !== 'INVENTORY'  && (title as string)  !== 'LINE' ? <>
                <th>코드</th>
                <th>이름</th>
                </> : null }
                {title === 'PRODUCT' ? (<>
                <th>코드</th>
                <th>이름</th>
                <th>금액</th>
                </>):  null }
                {title === 'INVENTORY' ? (<>
                  <th>상품명</th>
                  <th>상품코드</th>
                  <th>창고</th>
                  <th>유통기한</th>
                  </>) :  null }
                {title === 'LINE' ? (<>
                  <th>결재코드</th>
                  <th>결재자코드</th>
                  <th>결재자</th>
                  </>) :  null }
              </tr>
          </thead>
          
          
          <tbody className="inventory-table-body">
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

        <div className="modal-Footer">
          {maxPagevalue > 1 ?  
          <div className='Page-Btn-container'>
            <button onClick={(e)=>{changePage(e ,-1)}}  className='btn-Primary'>이전</button>
            <button onClick={(e)=>{changePage(e , 1)}} className='btn-Primary'>다음</button>
          </div>
          : null}
          <button onClick={onClose} className='btn-Secondary'>닫기</button>
        </div>

      </div>
    </div>
  )
}

export default InventorySelectModal
