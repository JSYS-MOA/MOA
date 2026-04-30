import React, { useEffect, useMemo, useState  } from 'react'
import {IoCloseOutline} from "react-icons/io5";
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
  // const [selectModal, setSelectModal] = useState(false);
  console.log(maxPage)


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
  const onselectStorage = (idx: number ) => {
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

    const now = new Date().toISOString(); 
    const today = now.split('T')[0];
    const finalPayload : any[] = [];

    if( user?.userId === null ) {
      return setOnAlert("섹션이 만료되었습니다");
    }

    const inItems = itemList.filter(item => (item.logisticSno || 0) > 0).map(item => ({
      productId: item.productId,
      storageId: item.storageId,
      logisticSno: Number(item.logisticSno),
      price: item.unitPrice,
      expirationDate: item.expirationDate ? `${item.expirationDate}T00:00:00` : null, // 입고 시 필수
      memo: item.defectMemo || ""
    }));

    const outItems = itemList.map(item => {
      const calculatedDefect = Number(item.orderSno || 0) - Number(item.logisticSno || 0);
      return { ...item, calculatedDefect };})
      .filter(item => item.calculatedDefect > 0).map(item => ({
      productId: item.productId,
      storageId: item.storageId,
      defectSno: item.calculatedDefect, // 계산된 값을 전송
      price: item.unitPrice,
      inventoryId: item.inventoryId || null,
      defectStatus: item.defectStatus || "불량",
      disposalDate: now,
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
    }, { 
      onSuccess: () => {
        setOnAlert("입고처리 되었습니다.");
        onRefresh();
        onClose()
      },
      onError: (error) => {
        console.error(error);
        setOnAlert("입고처리 중 오류가 발생했습니다.");
        onRefresh();
        onClose()
      }
    });

  }

  const masterInfo = items[0] || {};
  const isCompleted = masterInfo.orderStatus === '완료';

  return (
    <form className='modal-Container-TableFrom' onSubmit={(e)=>{onSubmitPost(e)}}>
      
      <div className="modal-Header">
        <p>입고처리</p>
        <button onClick={onClose}>
            <IoCloseOutline color="#fff" size={18}/>
        </button>
      </div>
        
      <div className="modal-Title">
        <p>입고처리</p>
      </div>
      
      <div className='modal-Body'>
        <div className='modal-Children'>
          <div className='modal-Row'>
            <div className='modal-Row-Item-title'>
              <label >발주요청일자</label>
            </div>
             <input className='Date-Header-Input' type="text" value={masterInfo.orderformDate || ''} readOnly />
          </div>

          <div className='modal-Row'>
            <div className='modal-Row-Group'>
              <div className='modal-Row-Item'>
                <label className='modal-Row-Item-title' >거래처</label>
                <input className='modal-Row-Item-Group-Input' type="text" value={masterInfo.vendorName || ''} readOnly />
              </div>

              <div className='modal-Row-Item'>
                  <label className='modal-Row-Item-title'>납기일자</label>
                  <input className='modal-Row-Item-Group-Input' type="date" value={inbundDate} onChange={(e) => setInbundDate(e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        <table className='modal-Table-Form'>

          <thead className="modal-Table-Form-header">
              <tr>
                { itemList ? <th>순번</th> : null}
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>

          <tbody className="modal-Table-Form-body">
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
                          onselectStorage(idx); }}}
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

          <tfoot className="modal-Table-Form-header">
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
      </div>

      <div className="modal-Footer">
        <div className="btn-Wrap">
            {!isCompleted && <button  className="btn-Primary"  type='submit'>입고</button>}
            <button className="btn-Secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
      
      
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
