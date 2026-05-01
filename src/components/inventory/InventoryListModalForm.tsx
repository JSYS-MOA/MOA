import React, { useEffect, useMemo, useState  } from 'react'
import {IoCloseOutline} from "react-icons/io5";
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { usePutOrderSno , useGetProductSelect , useDeleteOrderForm} from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';
import "../../assets/styles/inventory/inventoryTable.css";

const InventoryListModalForm = (  { items , maxPage , columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose}: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  maxPage : number ,
  keySno : string ,
  keyPrice : string ,
  keytype : string ,
  onClose: () => void ,
  onRefresh : any
  setOnAlert: (msg: string) => void 
  })  => {
    
  const [itemList, setItemList] = useState<ModalProps[]>(items);
  const [selectModal, setSelectModal] = useState(false);

  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { mutate } = usePutOrderSno();
  const { mutate : DelOrderForm } = useDeleteOrderForm();
  const { data } = useGetProductSelect();

  const [delOrder, setDelOrder] = useState(false);

  useEffect(() => {
    setItemList(items);
  }, [items]);


  const handleInputChange = (idx: number, key: string, value: string | number) => {
    const nextList = [...itemList];
    nextList[idx] = {
      ...nextList[idx],
      [key]: value
    };
    console.log(nextList)
    setItemList(nextList);
  };

  const totalSno = useMemo(() => { 
    return itemList.reduce((acc, item) =>
      { const targetItem = item as any;
        return  acc + (Number(targetItem[keySno]) || 0)}, 0);
  }, [itemList]);

  const totalAmount = useMemo(() => {
    return itemList.reduce((acc, item) => {
      const targetItem = item as any;
      let multiplier = 1;
      if( keytype !== '') {
        multiplier = targetItem[keytype] === 'OUT' ? -1 : 1;
      }
      return acc + (Number(targetItem[keyPrice] || 0) * multiplier * Number(targetItem[keySno] || 0));
    }, 0);
  }, [itemList]);

  // 새로운 리스트 추가
  const handleAddList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (items.length > 0 && items[0].orderStatus === '완료') {
      setOnAlert("수정할 수 없습니다");
    } else {
      const emptyItem = columns.reduce((acc, col) => {
      // 특정 키에 대한 기본값이 필요한 경우 분기 처리 가능
      if (col.key === keySno || col.key === keyPrice ||  col.key === 'totalPrice') {
        acc[col.key] = 0;
      } else {
        acc[col.key] = ''; // 나머지는 빈 문자열로 초기화
      }
      return acc;
      }, {} as any);

      const newItem = { ...emptyItem, orderStatus: '대기' };
      setItemList(prev => [...prev, newItem]);
     }
  }
  // 추가된 리스트 삭제
  const handleRemoveRow = (idx: number, e: React.MouseEvent) => {
  e.preventDefault(); // 폼 제출 방지
  
  // 행이 하나만 있을 때 삭제를 막고 싶다면 추가
  if (itemList.length <= 1) {
    setOnAlert("최소 한 개의 품목은 유지해야 합니다.");
    return;
  }

  const nextList = itemList.filter((_, i) => i !== idx);
  setItemList(nextList);
  } ;

  const onSubmitPut = (e : React.SubmitEvent) => {
    e.preventDefault();

     if (items.length > 0 && items[0].orderStatus === '완료') {
      setOnAlert("수정할 수 없습니다");
    } else {
      const filteredList = itemList.filter(item => item.ordererId || item.productCord || item.orderSno === 0 );
      const isNotChanged = JSON.stringify(items) === JSON.stringify(filteredList);
  
      if (isNotChanged) {
        setOnAlert("수정사항이 없습니다");
        return ;
      } 
        // 기존 아이템 배열
      const existingIds = new Set(items.map(i => i.ordererId).filter(Boolean));
  
        // 빈배열 없는 리스트 맵핑
      const payloadItems = filteredList.map((item) => {
        const isExisting = item.ordererId && existingIds.has(item.ordererId);
        return {
          ordererId: isExisting ? item.ordererId : null,
          productCord : item.productCord,
          productId: Number(item.productId),
          orderSno: Number(item[keySno as keyof ModalProps]),
          unitPrice: Number(item.unitPrice),
          // 서버가 요구한다면 상태값 추가
          status: isExisting ? "UPDATE" : "INSERT" 
        };
      });
      
      const orderFormId = items[0]?.orderformId || itemList[0]?.orderformId;

      if (!orderFormId) {
        setOnAlert("주문서 정보를 찾을 수 없습니다.");
        return;
      }

      mutate({ 
        orderFormId: Number(orderFormId), 
        items: payloadItems 
      }, {
        onSuccess: () => {
          setOnAlert("성공적으로 수정되었습니다.");
          onRefresh()
          onClose()
        },
        onError: (error) => {
          console.error(error);
          setOnAlert("수정 중 오류가 발생했습니다.");
        }
      });
    }

  }

  const onselectProduct = (idx: number , item : any) => {
     if( item.orderStatus === '완료'  ){
      setSelectModal(false);
      setOnAlert("수정할 수 없습니다")
      return;
     } else {
      setSelectModal(true);
      setTargetIdx(idx);
      console.log(idx);
      console.log(itemList);
     }
  }

  // 전달용
  const handleProductSelect = (product: any) => {

    console.log(targetIdx);
    if (targetIdx === null || !itemList[targetIdx]) {
    console.error("수정할 행을 찾을 수 없습니다.");
    return;
  }

  if (targetIdx === null) return;

  const nextList = [...itemList];

  const currentSno = nextList[targetIdx][keySno as keyof ModalProps] || 0;
  const existingOrdererId = nextList[targetIdx].ordererId; 
  
  nextList[targetIdx] = {
    ...({} as ModalProps), // 기본 구조 보장
    ordererId: existingOrdererId, // ID 보존
    productCord: product.productCord || '',
    productName: product.productName || '',
    [keySno]: currentSno,
    unitPrice: product.productPrice || 0,
    totalPrice: (product.productPrice || 0) * Number(currentSno),
    productId: product.productId
  } as ModalProps;

  setItemList(nextList);
  setSelectModal(false);
  setTargetIdx(null);
  };
  
  const onOderFormDel = (e : React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const itemKey = items[0]

     if (items.length > 0 && itemKey.orderStatus === '완료') {
      setOnAlert("삭제할 수 없습니다");
    } else {
      DelOrderForm(itemKey.orderformId , {
        onSuccess() {
          setOnAlert("성공적으로 삭제되었습니다.");
          onRefresh()
          onClose()
        },
        onError: (error) => {
          console.error(error);
          setOnAlert("삭제 중 오류가 발생했습니다.");
        }
      })
  
    }

  }


  const masterInfo = items[0] || {};
  const isCompleted = masterInfo.orderStatus === '완료';

  return (
    <form className='modal-Container-TableFrom' onSubmit={(e)=>{onSubmitPut(e)}}>
      
      <div className="modal-Header">
          <p>발주상세</p>
          <button onClick={onClose}>
              <IoCloseOutline color="#fff" size={18}/>
          </button>
      </div>

      <div className="modal-Title">
          <p>발주상세</p>
      </div>
      
      <div className='modal-Body'>
        <div className='modal-Row'>
          <div className='modal-Row-Group'>
            <div className='modal-Row-Item'>
              <div className='modal-Row-Item-title'>
                <label >발주요청일자</label>
              </div>
              <input className='modal-Row-Item-Group-Input' type="text" value={masterInfo.orderformDate || ''} readOnly />  
            </div>

            <div className='modal-Row-Item'>
              <div className='modal-Row-Item-title'>
                <label >납기일자</label>
              </div>
                <input className='modal-Row-Item-Group-Input' type="text" value={masterInfo.stockInDate || ''} readOnly  />
            </div>
          </div>

        </div>

          <div className='modal-Row'>
            <label >거래처</label>
            <input type="text" value={masterInfo.vendorName || ''} readOnly />
          </div>

        <table className='modal-Table-Form'>

          <thead >
            <tr>
              { itemList ? <th>순번</th> : null}
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              <th>비고</th>
            </tr>
          </thead>

          <tbody>
          {itemList.map((item, idx) => (
          <tr key={idx} >
            <td >{idx + 1}</td>
            {columns.map(col => (
              <td key={col.key}
                  onClick={(e) => {
                      if (col.key !== keySno ) {
                        onselectProduct(idx , item);
                      }}}>

              {(() => {
                const fieldKey = col.key as keyof ModalProps;
                      
                      if (col.key === 'totalPrice') {
                        const targetItem = item as any;
                        return <input value={(Number(targetItem[keyPrice]) || 0) * (Number(targetItem[keySno]) || 0)} readOnly />;
                      }
                      
                      if(item.orderStatus !== '완료' ) {
                        return <input
                          name={col.key}
                          value={item[fieldKey] ?? ''}          
                          onChange={(e) => {
                          if (col.key === keySno ) handleInputChange(idx, col.key, e.target.value);
                          }}
                          />

                      } else {
                        return <input
                          name={col.key}
                          value={item[fieldKey] ?? ''} 
                          readOnly                 
                        />
                      } 

                    })()}
                </td>
              ))}

                <td>
                  {item.orderStatus === '대기' && (
                    <>
                      <button 
                        onClick={(e) => handleRemoveRow(idx, e)}
                        className='Del-button' 
                        >
                        삭제
                      </button>
                    </>
                  )}
                </td>
          </tr>
        ))}
          </tbody>

          <tfoot>
            <tr>
              {(() => {
                const qtyIndex = columns.findIndex(col => col.key === keySno);
                const firstDataColPos = qtyIndex !== -1 ? qtyIndex + 1 : 1;

                return (
                  <>
                    <td colSpan={firstDataColPos} style={{ textAlign: 'center'}}>
                      합계
                    </td>

                    {columns.slice(qtyIndex).map((col) => {
                      if (col.key === keySno ) {
                        return <td key={col.key} >{totalSno}</td>;
                      }
                      if (col.key === 'totalPrice') {
                        return <td key={col.key}>{totalAmount}</td>;
                      }

                      return <td key={col.key}></td>;
                    })}
                  </>
                );
              })()}
              <td></td>
            </tr>
        </tfoot>
          
        </table>

          {!isCompleted && <button className="btn-Primary" onClick={(e) => { handleAddList(e) }}>품목 추가</button>}
        
      </div>

      <div className="modal-Footer">
        <div className="btn-Wrap">
            {!isCompleted && <button className="btn-Primary" type='submit'>등록</button>}
                  {!isCompleted && <button className="btn-Primary" onClick={(e) => { onOderFormDel(e) }}> 발주삭제</button>} 
            <button className="btn-Primary" onClick={onClose}>닫기</button>
        </div>
      </div>
   
          {selectModal ?
            <InventorySelectModal
              title='PRODUCT'
              items={data.content}
              onSelect={handleProductSelect}
              onClose={() => setSelectModal(false)}
              /> : null}
          
    </form>
  )
}

export default InventoryListModalForm
