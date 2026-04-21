import React, { useEffect, useMemo, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { usePutOrderSno , useGetProductSelect} from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';

const InventoryModalForm = (  { items , maxPage , columns, keySno , keyPrice , keytype , onRefresh }: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  maxPage : number ,
  keySno : string ,
  keyPrice : string ,
  keytype : string ,
  onRefresh : any
  })  => {
    
  const [itemList, setItemList] = useState<ModalProps[]>(items);
  const [selectModal, setSelectModal] = useState(false);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { mutate } = usePutOrderSno();
  const { data } = useGetProductSelect();


  // items 변경될떄 리스트도 변경
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

  const handleAddList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const emptyItem = columns.reduce((acc, col) => {
    // 특정 키에 대한 기본값이 필요한 경우 분기 처리 가능
    if (col.key === keySno || col.key === keyPrice ||  col.key === 'totalPrice') {
      acc[col.key] = 0;
    }  else {
      acc[col.key] = ''; // 나머지는 빈 문자열로 초기화
    }
    return acc;
  }, {} as any);

      setItemList(prev => [...prev, emptyItem]);
  }

  const onSubmitPut = (e : React.SubmitEvent) => {
    e.preventDefault();


    const filteredList = itemList.filter(item => item.ordererId || item.productCord || item.orderSno === 0 );
    const isNotChanged = JSON.stringify(items) === JSON.stringify(filteredList);

    if (isNotChanged) {
      alert("수정사항이 없습니다");
      return;
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
          alert("주문서 정보를 찾을 수 없습니다.");
          return;
        }

        mutate({ 
          orderFormId: Number(orderFormId), 
          items: payloadItems 
        }, {
          onSuccess: () => {
            alert("성공적으로 수정되었습니다.");
            onRefresh()
          },
          onError: (error) => {
            console.error(error);
            alert("수정 중 오류가 발생했습니다.");
          }
        });

  }

  const onselectProduct = (idx: number , item : any) => {
     if( item.orderStatus === '완료'  ){
      setSelectModal(false);
      alert("수정할 수 없습니다")
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
  

  return (
    <form onSubmit={(e)=>{onSubmitPut(e)}}>
        <button onClick={(e)=>{handleAddList(e)}}>추가</button>
      <table>

        <thead>
            <tr>
              { itemList ? <th>순번</th> : null}
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
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
                <td colSpan={firstDataColPos} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  합계
                </td>

                {columns.slice(qtyIndex).map((col) => {
                  if (col.key === keySno ) {
                    return <td key={col.key} style={{ fontWeight: 'bold' }}>{totalSno}</td>;
                  }
                  if (col.key === 'totalPrice') {
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

      <button type='submit'>등록</button>
       
          {selectModal ?
            <InventorySelectModal
              items={data.content}
              onSelect={handleProductSelect}
              onClose={() => setSelectModal(false)}
              /> : null}
          
    </form>
  )
}

export default InventoryModalForm
