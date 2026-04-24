import React, { useMemo, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { postOutbounds , useGetInventorySelect} from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';
import { useAuthStore } from "../../stores/useAuthStore";

const InventoryOutboundModalForm = (  {  columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose }: {
  columns : MColumn[] ,
  keySno : string ,
  keyPrice : string ,
  keytype : string ,
  onRefresh : any,
  onClose: () => void 
  setOnAlert: (msg: string) => void 
  })  => {
  
  const [orderformDate, setOrderformDate] = useState(new Date().toISOString().split('T')[0]); 
  const [vendor, setVendor] = useState({ vendorName: '', vendorId: '' , vendorCord: '' });  

  const [selectMode, setSelectMode] = useState<'INVENTORY' | null>(null);

  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { data : InventoryData } = useGetInventorySelect(); 
  const { mutate } = postOutbounds();
  const { user } = useAuthStore();

  const [itemList, setItemList] = useState<ModalProps[]>(() => {
    // 초기값으로 빈 행 하나를 생성합니다.
    const initialItem = columns.reduce((acc, col) => {
      acc[col.key] = (col.key === keySno || col.key === keyPrice || col.key === 'totalPrice') ? 0 : '';
      return acc;
    }, {} as any);

    return [{ ...initialItem, orderStatus: '대기' }];
  });

  const handleInputChange = (idx: number, key: string, value: string | number) => {
    
    const nextList = [...itemList];

    if( key === keySno  ) {

      let  inputSno  = Number(value);
      const maxAvailable = Number(nextList[idx].inventorySno || 0);

      if (isNaN(inputSno) ) {
            return;
        }

      if(inputSno > maxAvailable ) {

        nextList[idx] = {
          ...nextList[idx],
          [key]: maxAvailable
        };

      } else {
        nextList[idx] = {
          ...nextList[idx],
          [key]: inputSno
        };
      }
      
    } else {
      nextList[idx] = {
          ...nextList[idx],
          [key]: value
        };
    }
 
    setItemList(nextList);
  };

  // 리스트 추가
  const handleAddList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); 
    
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
  // 추가된 리스트 삭제
  const handleRemoveRow = (idx: number, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (itemList.length <= 1) {
      setOnAlert("최소 한 개의 품목은 유지해야 합니다.");
      return;
    }
  
    const nextList = itemList.filter((_, i) => i !== idx);
    setItemList(nextList);
  } ;

   //  물품 인벤토리
  const onselectInventory = (idx: number , item : any) => {
      setSelectMode('INVENTORY');
      setTargetIdx(idx);
  }
  //  물품 선택
  const handleInventorySelect = (inventory: any) => {

    console.log(inventory);

    if (targetIdx === null || !itemList[targetIdx]) {
    console.error("수정할 행을 찾을 수 없습니다.");
    return;
  }

  if (targetIdx === null) return;

  const nextList = [...itemList];

  const currentSno = nextList[targetIdx][keySno as keyof ModalProps] || 0;
  
  nextList[targetIdx] = {
    ...({} as ModalProps), 
    inventoryId: inventory.inventoryId, 
    productId: inventory.productId,
    storageId : inventory.storageId,
    inventorySno : inventory.inventorySno,
    [keySno]: currentSno,
    expirationDate : inventory.expirationDate,
    productPrice : inventory.productPrice,
    logisticsId : inventory.logisticsId,
    productName: inventory.productName || '',
    productCord: inventory.productCord || '',
    storageCord : inventory.storageCord,
    storageName: inventory.storageName
  } as ModalProps;

  setItemList(nextList);
  setSelectMode(null);
  setTargetIdx(null);
  };
 
  // 등록용
  const onSubmitPost = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (itemList.length === 0 || !itemList[0].productCord) {
      setOnAlert("출고한 물품을 선택 및 수량을 적어주세요");
      return;
    }

     e.preventDefault();

    const now = new Date().toISOString(); 
    const finalPayload : any[] = [];

    if( user?.userId === null ) {
      return setOnAlert("섹션이 만료되었습니다");
    }

    const inItems = itemList.filter(item => item.defectStatus !== '불량').map(item => ({
      inventoryId : item.inventoryId,
      productId: item.productId,
      storageId: item.storageId,
      inventorySno : item.inventorySno,
      logisticSno: Number(item.logisticSno),
      logisticsId : item.logisticsId,
      logisticsType : 'OUT',
      logisticDate : now,
      productPrice: item.productPrice
    }));

    const defectItems = itemList.filter(item => item.defectStatus === '불량').map(item => ({
      inventoryId : item.inventoryId,
      productId: item.productId,
      storageId: item.storageId,
      inventorySno : item.inventorySno,
      defectSno: Number(item.logisticSno),
      logisticsId : item.logisticsId,
      logisticsType : 'OUT',
      logisticDate : now,
      reqDate : item.expirationDate,
      disposalDate : now,
      productPrice: item.productPrice,
      defectStatus : '불량',
      defectMemo : item.defectMemo,
    }));

    if (inItems.length > 0) {
    finalPayload.push({
      items: inItems,
    });
    }

    if (defectItems.length > 0) {
       finalPayload.push({
          items: defectItems,
       });
     }

    if (finalPayload.length === 0) {
    setOnAlert("출고 또는 불량 수량을 입력해주세요.");
    return;
   }

console.log(finalPayload);

   mutate({ 
      payload: finalPayload 
    }, { 
      onSuccess: () => {
        setOnAlert("출고처리 되었습니다.");
        onRefresh();
        onClose()
      },
      onError: (error) => {
        console.error(error);
        setOnAlert("출고처리 중 오류가 발생했습니다.");
        onRefresh();
        onClose()
      }
    });

  };

  return (
    <form onSubmit={(e)=>{onSubmitPost(e)}}>
        <div>
          <div >
            <label>출고요청일자</label>
            <input type="date" value={orderformDate} readOnly />
          </div>

        </div>

      <button onClick={(e) => handleAddList(e)}>품목 추가</button>
      <table>

        <thead>
            <tr>
              { itemList ? <th>순번</th> : null}
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>

        <tbody>
        {itemList.map((item, idx) => (
        <tr key={idx} onClick={()=>{onselectInventory(idx , item)}}>
          <td >{idx + 1}</td>
          {columns.map(col => (
            <td key={col.key}
               >

            {(() => {
              const fieldKey = col.key as keyof ModalProps;
                    
                     if(col.key === 'defectStatus') {
                      return <input
                        type='checkbox'
                        name={col.key}       
                        onChange={(e) => {e.stopPropagation(); handleInputChange(idx, col.key, e.target.checked ? '불량' : '정상');}}
                      />
                      
                     } else if(col.key === 'defectMemo') {
                      return <input
                        name={col.key}
                        value={item[fieldKey] ?? ''}          
                        onChange={(e) => {e.stopPropagation();  handleInputChange(idx, col.key, e.target.value); }}
                      />
                      
                     } else if( col.key === keySno ) {
                      return <input
                        name={col.key}
                        value={item[fieldKey] ?? 0 }          
                        onChange={(e) => {e.stopPropagation();  handleInputChange(idx, col.key, e.target.value); }}
                      />
                     }
                     else {
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
                  <button 
                    onClick={(e) => handleRemoveRow(idx, e)}
                    style={{ color: 'red', border: '1px solid red', background: 'none', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
              </td>
        </tr>
      ))}
      </tbody>
    
      </table>
      <button type='submit'>등록</button>
          
          {selectMode === 'INVENTORY' ?
            <InventorySelectModal
              title='INVENTORY'
              items={InventoryData.content}
              onSelect={handleInventorySelect}
              onClose={() => setSelectMode(null)}
              /> : null}          
    </form>
  )
}

export default InventoryOutboundModalForm
