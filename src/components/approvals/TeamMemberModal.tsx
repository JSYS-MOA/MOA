import React, { useEffect, useState , useRef  } from 'react'
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import {IoCloseOutline} from "react-icons/io5";
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { patchTeamMembers } from '../../apis/ApprovalsService'
import ConfirmModal from './ApprovalsConfirmModal'

const TeamMemberModal = (  { items  , columns, onRefresh , setOnAlert , onClose}: {
  items: ModalProps[] ,
  columns : MColumn[] ,
  maxPage : number ,
  keySno? : string ,
  keyPrice? : string ,
  keytype? : string ,
  onClose: () => void ,
  onRefresh : any
  setOnAlert: (msg: string) => void 
  })  => {
    
  const [itemList, setItemList] = useState<ModalProps[]>(items);
  const [confirm , setConfirm] = useState('');

  const { mutate : PatchTeamMember } = patchTeamMembers();

   const editorRef = useRef<any>(null);

   const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.getInstance().getMarkdown(); // 마크다운 형식으로 추출
      handleInputChange('performance', content);
    }
  };

  useEffect(() => {
    setItemList(items);
  }, [items]);

  const rawMaster  = itemList[0] as any || {};

  const masterInfo = {
  ...rawMaster ,
  'writerInfo.userId': rawMaster.writerInfo?.userId,
  'writerInfo.userName': rawMaster.writerInfo?.userName,
  'writerInfo.employeeId': rawMaster.writerInfo?.employeeId,
  'writerInfo.phone': rawMaster.writerInfo?.phone,
  'writerInfo.email': rawMaster.writerInfo?.email,
  'writerInfo.departmentName': rawMaster.writerInfo?.departmentName,
  'writerInfo.departmentCord': rawMaster.writerInfo?.departmentCord,
  'writerInfo.gradeName': rawMaster.writerInfo?.gradeName,
  'writerInfo.gradeCord': rawMaster.writerInfo?.gradeCord,
  'writerInfo.roleName': rawMaster.writerInfo?.roleName,
  'writerInfo.roleCode': rawMaster.writerInfo?.roleCode,

  'approverInfo.userId': rawMaster.approverInfo?.userId,
  'approverInfo.userName': rawMaster.approverInfo?.userName,
  'approverInfo.employeeId': rawMaster.approverInfo?.employeeId,
  'approverInfo.phone': rawMaster.approverInfo?.phone,
  'approverInfo.email': rawMaster.approverInfo?.email,
  'approverInfo.departmentName': rawMaster.approverInfo?.departmentName,
  'approverInfo.departmentCord': rawMaster.approverInfo?.departmentCord,
  'approverInfo.gradeName': rawMaster.approverInfo?.gradeName,
  'approverInfo.gradeCord': rawMaster.approverInfo?.gradeCord,
  'approverInfo.roleName': rawMaster.approverInfo?.roleName,
  'approverInfo.roleCode': rawMaster.approverInfo?.roleCode,
  'approverInfo.approvalLineId': rawMaster.approverInfo?.approvalLineId,
  'approverInfo.approvalLineUser': rawMaster.approverInfo?.approvalLineUser,
  'approverInfo.approvalLineName': rawMaster.approverInfo?.approvalLineName,
  };

  const onConfirm = (e : React.SubmitEvent) =>{
     e.preventDefault();

     setConfirm('인사평가를 등록하시겠습니까?');
  }

  const onSubmitPatch = (e : any ) =>{
     e.preventDefault();

    PatchTeamMember({ 
      userId: masterInfo.userId!, 
      performance: masterInfo.performance 
    }, { 
      onSuccess: () => {
        setOnAlert("인사평가가 등록되었습니다");
        onRefresh();
        onClose()
      },
      onError: (error) => {
        console.error(error);
        setOnAlert("사용자 정보가 올바르지 않습니다.");
        onRefresh();
        onClose()
      }
    });

  }

  const handleInputChange = (key: string, value: string | number) => {
    const nextList = [...itemList];
     
       nextList[0] = {
          ...nextList[0],
          [key]: value
        };
  
      setItemList(nextList);

  };  

  return (
    <form className='modal-Container' onSubmit={(e)=> { onConfirm(e)}}>
      <div className="modal-Header">
          <p>팀원정보</p>
          <button onClick={onClose}>
              <IoCloseOutline color="#fff" size={18}/>
          </button>
        </div>

        <div className="modal-Title">
          <p>팀원정보</p>
      </div>

      <div className='modal-Body' >
        <div className='modal-Children'>
          {columns.map((col) => {

            if(col.key === 'performance' ) {
              return (
                <div className='modal-Row' key={col.key} style={{ display: 'block' }}>
                  <div className='modal-Row-Item-title' style={{ marginBottom: '10px' }}>
                    <strong>{col.label}</strong>
                  </div>
                  <div className="editor-container">
                    <Editor
                      ref={editorRef}
                      initialValue={masterInfo.performance || " "}
                      previewStyle="vertical"
                      height="350px"
                      initialEditType="wysiwyg"
                      useCommandShortcut={true}
                      language="ko-KR"
                      onChange={handleEditorChange} // 내용 변경 시마다 상태 업데이트
                    />
                  </div>
                </div>

            )}

            return (
              <div className='modal-Row' key={col.key} >
                <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                <div className='modal-Row-Item-title-Body'>
                  <input value={masterInfo[col.key] || ''} readOnly style={{ width: '100%' }} />
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

      {confirm !== '' && <ConfirmModal isOpen={confirm !== '' } message={confirm} onConfirm={(e : any )=>{onSubmitPatch(e)}}  onClose={()=>{setConfirm('')}}/> } 
  
    </form>
  )
}

export default TeamMemberModal
