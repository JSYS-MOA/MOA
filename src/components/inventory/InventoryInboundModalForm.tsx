import React, { useEffect, useMemo, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { usePostOrder , useGetProductSelect , useGetVendorSelect} from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';

const InventoryInboundModalForm = (  { items , maxPage , columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose}: {
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
  // const { mutate } = usePutOrderSno();
  // const { mutate : DelOrderForm } = useDeleteOrderForm();
  // const { data } = useGetProductSelect();
  const [inbundDate, setInbundDate] = useState(new Date().toISOString().split('T')[0]); 

  useEffect(() => {
    setItemList(items);
  }, [items]);


  const handleInputChange = (idx: number, key: string, value: string | number) => {
    
    if (typeof value === 'string' && value !== '' && /[^0-9]/.test(value)) {
    alert("숫자만 입력할 수 있습니다.");
    return;
  }
    
    const nextList = [...itemList];

    if(nextList[idx].orderSno >= Number(value) ) {
      nextList[idx] = {
        ...nextList[idx],
        [key]: value
      };
      
    } else {
      const maxValue = nextList[idx].orderSno
      nextList[idx] = {
        ...nextList[idx],
        [key]: maxValue
      };
    }

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

  const masterInfo = items[0] || {};
  const isCompleted = masterInfo.orderStatus === '완료';

  return (
    <form onSubmit={(e)=>{onSubmitPut(e)}}>
      <div>
        <div>
          <label >발주요청일자</label>
          <input type="text" value={masterInfo.orderformDate || ''} readOnly />
        </div>

        <div>
          <label >거래처</label>
          <input type="text" value={masterInfo.vendorName || ''} readOnly />
        </div>

        <div >
            <label>납기일자</label>
            <input type="date" value={inbundDate} onChange={(e) => setInbundDate(e.target.value)} />
        </div>
      </div>
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
            <td key={col.key}>
            {(() => {
              const fieldKey = col.key as keyof ModalProps;
                    
                    if (col.key === 'totalPrice') {
                       const targetItem = item as any;
                      return <input value={(Number(targetItem[keyPrice]) || 0) * (Number(targetItem[keySno]) || 0)} readOnly />;
                    }
                     
                    if(col.key === keySno ) {
                      return <input
                        name={col.key}
                        value={item[fieldKey] ?? 0}          
                        onChange={(e) => {
                         handleInputChange(idx, col.key, e.target.value);
                        }}
                        />

                    } else {
                      return <input name={col.key} value={item[fieldKey] ?? ''} readOnly />
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

      {!isCompleted && <button type='submit'>입고</button>}
      
          
    </form>
  )
}

export default InventoryInboundModalForm
