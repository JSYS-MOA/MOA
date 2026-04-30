import React, { useState , useRef  } from 'react'
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import {IoCloseOutline} from "react-icons/io5";
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
  
  // const [approvalsDate, setApprovalsDate] = useState(new Date().toISOString().split('T')[0]); 
  const approvalsDate = new Date().toISOString().split('T')[0];
  const [selectMode, setSelectMode] = useState<'LINE'| 'DOCUMENT' | null>(null);

  const editorRef = useRef<any>(null);
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

   const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.getInstance().getMarkdown(); // 마크다운 형식으로 추출
      handleInputChange('approvaContent', content);
    }
  };

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
      setOnAlert("결재 정보를 모두 입력해주세요.");
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
        approver : item.approvaInfo.approvalLineId
      
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
    <form className='modal-Container' onSubmit={(e)=>{onSubmitPost(e)}}>
       
       <div className="modal-Header">
          <p>결재문서</p>
          <button onClick={onClose}>
              <IoCloseOutline color="#fff" size={18}/>
          </button>
        </div>

        <div className="modal-Title">
          <p>결재문서</p>
      </div>
       
       <div className='modal-Body' >
          <div className='modal-Children'>
            {columns.map((col) => {

              if (col.key === 'approvaDate') {
              
                const datePart = approvalsDate.split('T'); 

                return (
                  <div className='modal-Row' key={col.key}>
                    <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                    <div className='modal-Row-Item-title-box'>

                      <input 
                        className='Date-Header-Input' 
                        value={datePart || ''} 
                        readOnly 
                      />

                    </div>
                  </div>
                );
              }

              if (col.key === 'documentName') {
                return (
                <div key={col.key} className='modal-Row' onClick={()=>{onselectDocument()}}>
                    <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                    <div className='modal-Row-Item-title-Body'>
                      <input readOnly value={itemList[0].documentName} style={{ width: '100%' }} />
                    </div>
                </div>
                );
              }

              if (col.key === 'writerInfo.userName') {
                return (
                  <div className='modal-Row' key="row-writer-approver">
                    <div className='modal-Row-Group' >
                    
                      <div className='modal-Row-Item'>
                        <div className='modal-Row-Item-title'><strong>기안자</strong></div>
                          <input className="modal-Row-Item-Group-Input" readOnly value={user?.userName} />
                          <input className="modal-Row-Item-Group-Input" readOnly value={user?.employeeId}/>
                      </div>
                        
                      <div className='modal-Row-Item' onClick={()=>{onselectApprovaLine()}}>
                        <div className='modal-Row-Item-title'><strong>결재자</strong></div>
                          <input className="modal-Row-Item-Group-Input" readOnly value={(itemList[0] as any)['approverInfo.userName'] || ''} />
                          <input className="modal-Row-Item-Group-Input" readOnly value={(itemList[0] as any)['approverInfo.employeeId'] || ''} />
                        </div>
                  </div>

                </div>
            );
          }

          if (col.key === 'approvaContent') {
            return (
              <div className='modal-Row' key={col.key} style={{ display: 'block' }}>
                <div className='modal-Row-Item-title' style={{ marginBottom: '10px' }}>
                  <strong>{col.label}</strong>
                </div>
                <div className="editor-container">
                  <Editor
                    ref={editorRef}
                    initialValue={itemList[0].approvaContent || " "}
                    previewStyle="vertical"
                    height="350px"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    language="ko-KR"
                    onChange={handleEditorChange} // 내용 변경 시마다 상태 업데이트
                  />
                </div>
              </div>
            );
          }

          if (['writerInfo.employeeId', 'approverInfo.userName', 'approverInfo.employeeId'].includes(col.key as string)) {
            return null;
          }

          return (
            <div className='modal-Row' key={col.key}>
              <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
              <div className='modal-Row-Item-title-Body'>
                <input onChange={(e)=>{handleInputChange(col.key , e.target.value)}} />
              </div>
            </div>
          );
             })}
          </div>
      </div>
      
      <div className="modal-Footer">
        <div className="btn-Wrap">
            <button className="btn-Primary" type='submit'> 등록</button>
            <button className="btn-Secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
      
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
