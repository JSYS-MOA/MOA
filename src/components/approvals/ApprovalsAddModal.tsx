import React, { useEffect, useState  } from 'react'
import { useAuthStore } from "../../stores/useAuthStore";
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { usePostApprovals , useGetApprovaLineSelect  , useGetDocumentSelect } from '../../apis/ApprovalsService'
import InventorySelectModal from '../inventory/InventorySelectModal';


const ApprovalsAddModal = (  {  columns, onRefresh , setOnAlert , onClose }: {
  columns : MColumn[] ,
  onRefresh : any,
  onClose: () => void 
  setOnAlert: (msg: string) => void 
  })  => {
  
  const [approvalsDate, setApprovalsDate] = useState(new Date().toISOString().split('T')[0]); 
  const [selectMode, setSelectMode] = useState<'LINE'| 'DOCUMENT' | null>(null);
  
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const { data : ApprovaLine  } = useGetApprovaLineSelect();
  const { data : Document  } = useGetDocumentSelect();

  const { mutate } = usePostApprovals();
  const { user } = useAuthStore();

  const [itemList, setItemList] = useState<ModalProps[]>(() => {
    // 초기값으로 빈 행 하나를 생성합니다.
    const initialItem = columns.reduce((acc, col) => {
      acc[col.key] = '';
      return  acc;
    }, {} as any);

    return [{ ...initialItem, approvaStatus: '대기' }];
  });

  const handleInputChange = (key: string, value: string | number) => {
    const nextList = [...itemList];
    nextList[0] = {
      ...nextList[0],
      [key]: value
    };
    console.log(nextList)
    setItemList(nextList);
  };

   // 물품 전달을 위한 조회
  const onselectApprovaLine = () => {
      setSelectMode('LINE');
  }
  //  물품 선택
  const handleApprovaLineSelect = (line: any) => {

  console.log(line);
  const targetIdx = 0
  const nextList = [...itemList];

  const updatedItem = {
    ...nextList[targetIdx],
    approver: line.approvalLineUser,
    approvaInfo: {
      ...nextList[targetIdx].approvaInfo,
      approvalLineName: line.approvalLineName,
      approvalLineId: line.approvalLineId,
    }
  };

  (updatedItem as any)['approverInfo.userName'] = line.userName;
  (updatedItem as any)['approverInfo.userId'] = line.approvalLineUser;
  (updatedItem as any)['approverInfo.employeeId'] = line.employeeId;

  nextList[targetIdx] = updatedItem;
  console.log(itemList)
  setItemList(nextList);
  setSelectMode(null);
  };


 // 물품 전달을 위한 조회
  const onselectDocument = () => {
      setSelectMode('DOCUMENT');
  }
  //  물품 선택
  const handleDocumentSelect = (document: any) => {

  console.log(document);
  const targetIdx = 0
  const nextList = [...itemList];

  const updatedItem = {
    ...nextList[targetIdx],
     approvaKind: document.documentId,
    documentCord: document.documentCord,
    documentName: document.documentName
  }; 

  (updatedItem as any)['approvaKind'] = document.documentId;
  (updatedItem as any)['documentName'] = document.documentName;

  nextList[targetIdx] = updatedItem;
  console.log(itemList)

  setItemList(nextList);
  setSelectMode(null);
  };

  // 등록용
  const onSubmitPost = (e: React.SubmitEvent) => {
    e.preventDefault();

    const item = itemList[0];

    if (!ApprovaLine.approvalLineId === null) {
      setOnAlert("결재라인을 선택해주세요.");
      return;
    }

    if (itemList[0].approvaContent === null || itemList[0].approvaTitle === null  || itemList[0].documentId === null ) {
      setOnAlert("결재 제목과 내용을 작성해주세요");
      return;
    }

    const payload = {
        approvaTitle: item.approvaTitle,
        approvaContent: item.approvaContent,
        approvaKind: item.approvaKind,
        writer : user?.userId,
        approvaStatus : item.approvaStatus,
        approvaMemu : item.approvaMemu,
        file : null ,
        approvaDate : new Date().toISOString(),
        approver : item.approver
      
    };

     mutate(payload, { 
      onSuccess: () => {
        setOnAlert("성공적으로 등록되었습니다.");
        onRefresh();
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
       {columns.map((col) => {
           if (col.key === 'approvaDate') {
            return (
            <div key={col.key} style={{ display: 'flex', marginBottom: '8px' }}>
                <div style={{ width: '100px' }}><strong>{col.label}</strong></div>
                <div style={{ flex: 1 }}>
                  <input readOnly type='date' value={approvalsDate} style={{ width: '100%' }} />
                </div>
            </div>
            );
          }

           if (col.key === 'documentName') {
            return (
            <div key={col.key} style={{ display: 'flex', marginBottom: '8px' }} onClick={()=>{onselectDocument()}}>
                <div style={{ width: '100px' }}><strong>{col.label}</strong></div>
                <div style={{ flex: 1 }}>
                  <input readOnly value={itemList[0].documentName} style={{ width: '100%' }} />
                </div>
            </div>
            );
          }


          if (col.key === 'writerInfo.userName') {
            return (
              <div key="row-writer-approver" style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flex: 1 }}>
                  <div style={{ width: '100px' }}><strong>기안자</strong></div>
                  <input readOnly value={user?.userId} style={{ width: '80px' }} />
                  <input readOnly value={user?.employeeId} style={{ width: '50px', marginLeft: '4px' }} />
                </div>
                <div style={{ display: 'flex', flex: 1 }} onClick={()=>{onselectApprovaLine()}}>
                  <div style={{ width: '100px' }}><strong>결재자</strong></div>
                  <input  readOnly value={(itemList[0] as any)['approverInfo.userName'] || ''} style={{ width: '80px' }} />
                  <input  readOnly value={(itemList[0] as any)['approverInfo.employeeId'] || ''}  style={{ width: '50px', marginLeft: '4px' }} />
                </div>
              </div>
            );
          }

          if (['writerInfo.employeeId', 'approverInfo.userName', 'approverInfo.employeeId'].includes(col.key as string)) {
            return null;
          }

          return (
            <div key={col.key} style={{ display: 'flex', marginBottom: '8px' }}>
              <div style={{ width: '100px' }}><strong>{col.label}</strong></div>
              <div style={{ flex: 1 }}>
                <input style={{ width: '100%' }} onChange={(e)=>{handleInputChange(col.key , e.target.value)}} />
              </div>
            </div>
          );
        })}

      <button type='submit'> 등록</button>

      {selectMode === 'LINE' ?
            <InventorySelectModal
              title='LINE'
              items={ApprovaLine.content}
              onSelect={handleApprovaLineSelect}
              onClose={() => setSelectMode(null)}
              /> : null}

      {selectMode === 'DOCUMENT' ?
            <InventorySelectModal
              title='DOCUMENT'
              items={Document.content}
              onSelect={handleDocumentSelect}
              onClose={() => setSelectMode(null)}
              /> : null}        
      
    </form>
  )
}

export default ApprovalsAddModal
