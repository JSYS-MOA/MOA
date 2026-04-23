import React, { useEffect, useMemo, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { insertbounds , useGetStorageSelect } from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';
import { useAuthStore } from "../../stores/useAuthStore";

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


  const [selectMode, setSelectMode] = useState<'STORAGE' | null>(null);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { mutate } = insertbounds();
  const [inbundDate, setInbundDate] = useState(new Date().toISOString().split('T')[0]); 
  const { data : StorageData  } = useGetStorageSelect();
  const { user } = useAuthStore();

  useEffect(() => {
    setItemList(items);
  }, [items]);


  //  차고 전달을 위한 조회
  const onselectStorage = (idx: number , item : any) => {
      setSelectMode('STORAGE');
      setTargetIdx(idx);
  }
  
  //  창고 선택
  const handleStorageSelect = (storage: any) => {

    console.log(itemList); 
    

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
    ...nextList[targetIdx], // 기본 구조 보장
    storageId: storage.storageId, // ID 보존
    storageCord: storage.storageCord || '',
    storageName: storage.storageName || '',
    storageAddress: storage.storageAddress || 0,
  } as ModalProps;

  setItemList(nextList);
  setSelectMode(null);
  setTargetIdx(null);

  console.log(storage);
  console.log(nextList);
  };

  const handleInputChange = (idx: number, key: string, value: string | number) => {
     console.log(key)
    const nextList = [...itemList];
    const item = nextList[idx];

    if( key === 'logisticSno' ) {
     const inputSno = Math.max(0, Number(value));
     nextList[idx] = {
      ...item,
      logisticSno: Math.min(item.orderSno, inputSno)
    };

    } else{
       nextList[idx] = {
          ...nextList[idx],
          [key]: value
        };
    }

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


  const onSubmitPost = (e : React.SubmitEvent) => {
    e.preventDefault();

    const today = new Date().toISOString().split('T')[0];
    const finalPayload : any[] = [];

    console.log(user?.userId)

    if( user?.userId === null ) {
      return setOnAlert("다시 로그인 해주세요");
    }

    const inItems = itemList.filter(item => (item.logisticSno || 0) > 0).map(item => ({
      productId: item.productId,
      storageId: item.storageId,
      logisticSno: Number(item.logisticSno),
      price: item.unitPrice,
      expirationDate: item.expirationDate ? `${item.expirationDate}T00:00:00` : null, // 입고 시 필수
      memo: item.defectMemo || ""
    }));

     const outItems = itemList.filter(item => (item.defectSno || 0) > 0).map(item => ({
      productId: item.productId,
      storageId: item.storageId,
      defectSno: Number(item.defectSno),
      inventoryId: item.inventoryId, // 재고 ID
      defectStatus: item.defectStatus || "불량",
      disposalDate: today,
      memo: item.defectMemo || ""
    }));

    if (inItems.length > 0) {
    finalPayload.push({
      logisticsType: "IN",
      stockInDate: today,
      userId: user?.userId,
      items: inItems,
    });
    }

    if (outItems.length > 0) {
       finalPayload.push({
         logisticsType: "OUT",
         stockInDate: today,
         userId: user?.userId,
         items: outItems,
       });
     }

    if (finalPayload.length === 0) {
    setOnAlert("입고 또는 불량 수량을 입력해주세요.");
    return;
   }

    mutate({ 
      orderformId: itemList[0].orderformId, 
      payload: finalPayload 
    });

  }

  const masterInfo = items[0] || {};
  const isCompleted = masterInfo.orderStatus === '완료';

  return (
    <form onSubmit={(e)=>{onSubmitPost(e)}}>
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

                    if (col.key === 'expirationDate') {
                      return <input
                        type="date"
                        name={col.key}      
                        onChange={(e) => {
                         handleInputChange(idx, col.key, e.target.value);
                        }}
                        />;
                    }

                    if(col.key === 'defectSno' ) {
                      const targetItem = item as any;
                      return <input
                        name={col.key}
                        value={ (Number(targetItem['orderSno'] || 0) - Number(targetItem[keySno] || 0)) }          
                        readOnly
                        />
                    } 

                    if(col.key === 'defectStatus' || col.key === 'defectMemo' ) {
                      return <input
                        name={col.key}
                        value={item[fieldKey] ?? ''}          
                        onChange={(e) => {
                         handleInputChange(idx, col.key, e.target.value);
                        }}
                        />
                    } 
                   
                    if(col.key === keySno) {
                      return <input
                        name={col.key}
                        value={item[fieldKey] ?? 0}          
                        onChange={(e) => {
                         handleInputChange(idx, col.key, e.target.value);
                        }}
                        />

                    } else {
                      return <input onClick={() => {
                        if(col.key === 'storageName' ) {
                        onselectStorage(idx , item); }}}
                        name={col.key}
                        value={item[fieldKey] ?? ''}
                        readOnly />
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
      
      {selectMode === 'STORAGE' ?
            <InventorySelectModal
              title='STORAGE'
              items={StorageData.content}
              onSelect={handleStorageSelect}
              onClose={() => setSelectMode(null)}
              /> : null}
          
    </form>
  )
}

export default InventoryInboundModalForm
