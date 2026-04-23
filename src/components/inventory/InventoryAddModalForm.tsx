import React, { useMemo, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { usePostOrder , useGetProductSelect , useGetVendorSelect} from '../../apis/InventoryService';
import InventorySelectModal from './InventorySelectModal';

const InventoryAddModalForm = (  {  columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose }: {
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

  const [selectMode, setSelectMode] = useState<'PRODUCT' | 'VENDOR' | null>(null);

  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { data : ProductData  } = useGetProductSelect();
  const { data : VendorData } = useGetVendorSelect(); 
  const { mutate } = usePostOrder();

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

  // 리스트 추가
  const handleAddList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
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
    e.preventDefault(); // 폼 제출 방지
    
    // 행이 하나만 있을 때 삭제를 막고 싶다면 추가
    if (itemList.length <= 1) {
      setOnAlert("최소 한 개의 품목은 유지해야 합니다.");
      return;
    }
  
    const nextList = itemList.filter((_, i) => i !== idx);
    setItemList(nextList);
  } ;

   //  물품 전달을 위한 조회
  const onselectProduct = (idx: number , item : any) => {
      setSelectMode('PRODUCT');
      setTargetIdx(idx);
  }
  //  물품 선택
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
  setSelectMode(null);
  setTargetIdx(null);
  };

  // 거래처 선택
  const onSelectVendor = () => {
    setSelectMode('VENDOR'); 
  };

  const handleVendorSelect = (vendorInfo: any) => {
    setVendor({
      vendorId: vendorInfo.vendorId,
      vendorCord: vendorInfo.vendorCord,
      vendorName: vendorInfo.vendorName
    });

    // 모달 닫기
    setSelectMode(null);
  };

  // 등록용
  const onSubmitPost = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!vendor.vendorId) {
      setOnAlert("거래처를 선택해주세요.");
      return;
    }

    if (itemList.length === 0 || !itemList[0].productCord) {
      setOnAlert("등록할 품목을 최소 하나 이상 선택해주세요.");
      return;
    }

    const payload = {
      orderformDate, 
      vendorId: vendor.vendorId,
      stockInDate : null,
      orderStatus : '대기',
      items: itemList.map((item) => ({
        productId: Number(item.productId),
        orderSno: Number((item as any)[keySno]),
        unitPrice: Number((item as any)[keyPrice]),
      }))
    };

     mutate(payload, { 
      onSuccess: () => {
        setOnAlert("성공적으로 등록되었습니다.");
        onRefresh(); // 부모 리스트 새로고침
        onClose()
      },
      onError: (error) => {
        console.error(error);
        setOnAlert("등록 중 오류가 발생했습니다.");
      }
    });
  };
  

  return (
    <form onSubmit={(e)=>{onSubmitPost(e)}}>
        <div>
          <div >
            <label>발주요청일자</label>
            <input type="date" value={orderformDate} onChange={(e) => setOrderformDate(e.target.value)} />
          </div>

          <div onClick={onSelectVendor}>
            <label>거래처</label>
            <input type="text" value={vendor.vendorName} placeholder="거래처 선택" readOnly />
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
        <tr key={idx} >
          <td >{idx + 1}</td>
          {columns.map(col => (
            <td key={col.key}
                onClick={() => {
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
                  <button 
                    onClick={(e) => handleRemoveRow(idx, e)}
                    style={{ color: 'red', border: '1px solid red', background: 'none', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
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
       
          {selectMode === 'PRODUCT' ?
            <InventorySelectModal
              title='PRODUCT'
              items={ProductData.content}
              onSelect={handleProductSelect}
              onClose={() => setSelectMode(null)}
              /> : null}

          {selectMode === 'VENDOR' ?
            <InventorySelectModal
              title='VENDOR'
              items={VendorData.content}
              onSelect={handleVendorSelect}
              onClose={() => setSelectMode(null)}
              /> : null}
          
    </form>
  )
}

export default InventoryAddModalForm
