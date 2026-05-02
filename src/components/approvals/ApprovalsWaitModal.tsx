import React, { useEffect, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import {IoCloseOutline} from "react-icons/io5";
import { Viewer } from '@toast-ui/react-editor';
import { patchApprovalAct } from '../../apis/ApprovalsService'
import ConfirmModal from './ApprovalsConfirmModal'

const ApprovalsWaitModal = (  { items  , columns,onRefresh , setOnAlert , onClose}: {
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

  const { mutate : PatchApprovals } = patchApprovalAct();

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

  const isCompleted = masterInfo.approvaStatus === '대기';

  const onConfirm = (e : React.SubmitEvent) =>{
     e.preventDefault();

     setConfirm('결재처리하시겠습니까');
  }

  const onSubmitPatch = (e : any ) =>{
     e.preventDefault();

    const value = e.target.value
    console.log(value)

    PatchApprovals({ 
      approvaId: itemList[0].approvaId, 
      approvaStatus: value
    }, { 
      onSuccess: () => {
        setOnAlert(value + "처리 되었습니다.");
        onRefresh();
        onClose()
      },
      onError: (error) => {
        console.error(error);
        setOnAlert(value + "중 오류가 발생했습니다.");
        onRefresh();
        onClose()
      }
    });

  }

  return (
    <form className='modal-Container' onSubmit={(e)=> { onConfirm(e)}}>
      
      <div className="modal-Header">
                <p>결재문서</p>
                <button onClick={onClose}>
                    <IoCloseOutline color="#fff" size={18}/>
                </button>
      </div>

      <div className="modal-Title">
        <p>결재문서</p>
      </div>

      <div  className='modal-Body'>
        <div className="modal-Children">
          {columns.map((col) => {
            if (col.key === 'writerInfo.userName') {
              return (
                  <div className='modal-Row' key="row-writer-approver">
                    <div className='modal-Row-Group'>

                      <div className='modal-Row-Item'>
                        <div className='modal-Row-Item-title'><strong>기안자</strong></div>
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['writerInfo.userName'] || ''} readOnly />
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['writerInfo.employeeId'] || ''} readOnly />
                      </div>

                      <div className='modal-Row-Item'>
                        <div className='modal-Row-Item-title'><strong>결재자</strong></div>
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['approverInfo.userName'] || ''} readOnly  />
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['approverInfo.employeeId'] || ''} readOnly  />
                      </div>

                    </div>
                  </div>
              );
            }

            if (['writerInfo.employeeId', 'approverInfo.userName', 'approverInfo.employeeId'].includes(col.key as string)) {
              return null;
            }

            if (col.key === 'approvaDate') {
              const fullDate = masterInfo[col.key] || "";
              const [datePart, timePart] = fullDate.split('T');
              const hh = timePart?.slice(0, 2) || "00";
              const mm = timePart?.slice(3, 5) || "00";

              return (
                  <div className='modal-Row' key={col.key}>
                    <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                    <div className='modal-Row-Item-title-box' >

                      <input
                          className='Date-Header-Input'
                          value={datePart || ''}
                          readOnly
                      />

                      <div className='Time-Header-Box'>
                        <input className='Time-Header-Input' value={hh} readOnly />
                        <span>:</span>
                        <input className='Time-Header-Input' value={mm} readOnly />
                      </div>
                    </div>
                  </div>
              );
            }

            if (col.key === 'approvaContent') {
              return (
                  <div className='modal-Row' key={col.key}>
                    <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                    <div className="viewer-wrapper">
                      <Viewer initialValue={masterInfo[col.key] || "내용이 없습니다."} />
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
            {isCompleted &&  <button className="btn-Primary" type='submit'> 결재</button> } 
            <button className="btn-Secondary" onClick={onClose}>닫기</button>
        </div>
      </div>

      {confirm !== '' && <ConfirmModal isOpen={confirm !== '' } message={confirm} onConfirm={(e : any )=>{onSubmitPatch(e)}}  onClose={()=>{setConfirm('')}}/> } 
  
    </form>
  )
}

export default ApprovalsWaitModal
