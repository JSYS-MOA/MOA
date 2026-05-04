import React, { useEffect, useState  } from 'react'
import {IoCloseOutline} from "react-icons/io5";
import { Viewer } from '@toast-ui/react-editor';
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { useDeleteApprovals } from '../../apis/ApprovalsService'

const ApprovalsModal = (  { items ,  columns,  onRefresh , setOnAlert , onClose}: {
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
  const { mutate : DelApprovals } = useDeleteApprovals();
  
  
  
  useEffect(() => {
    setItemList(items);
  }, [items]);
 
  const onDelApprovalsDel = (e : React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const itemKey = itemList[0]

     if (items.length > 0 && itemKey.approvaStatus === '완료') {
      setOnAlert("삭제할 수 없습니다");
    } else {
      DelApprovals(itemKey.approvaId , {
        onSuccess() {
          setOnAlert("성공적으로 삭제되었습니다.");
          onRefresh()
          onClose()
        },
        onError: (error : any ) => {
          console.error(error);
          setOnAlert("삭제 중 오류가 발생했습니다.");
        }
      })
  
    }

  }

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

  return (
    <div className='modal-Container'>
      
      <div className="modal-Header">
          <p>결재 보기</p>
          <button onClick={onClose}>
              <IoCloseOutline color="#fff" size={18}/>
          </button>
      </div>

      <div className="modal-Title">
          <p>결재 보기</p>
      </div>

      <div className='modal-Body'>
        <div className="modal-Children">
          {columns.map((col) => {
            if (col.key === 'writerInfo.userName') {
              return (
                  <div className='modal-Row' key="row-writer-approver" >
                    <div className='modal-Row-Group'>
                      <div className='modal-Row-Item'>
                        <div className='modal-Row-Item-title'><strong>기안자</strong></div>
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['writerInfo.userName'] || ''} readOnly  />
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['writerInfo.employeeId'] || ''} readOnly  />
                      </div>

                      <div className='modal-Row-Item'>
                        <div className='modal-Row-Item-title'><strong>결재자</strong></div>
                        <input className="modal-Row-Item-Group-Input" value={masterInfo['approverInfo.userName'] || ''} readOnly />
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
              const fullDate = masterInfo[col.key] || ""; // 예: "2026-04-28T09:30:00"

              // T를 기준으로 날짜와 시간을 나눔
              const [datePart, timePart] = fullDate.split('T');
              // 시(HH)와 분(mm) 추출
              const hh = timePart?.slice(0, 2) || "00";
              const mm = timePart?.slice(3, 5) || "00";

              return (
                  <div className='modal-Row' key={col.key}>
                    <div className='modal-Row-Item-title'><strong>{col.label}</strong></div>
                    <div className='modal-Row-Item-title-box'>
                      <input
                          className='Date-Header-Input'
                          value={datePart || ''}
                          readOnly
                      />

                      <div className='Time-Header-Box'>
                        <input className='Time-Header-Input' value={hh} readOnly />
                        <span>:</span>
                        <input className='Time-Header-Input' value={mm} readOnly  />
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
                    <input
                        value={
                          col.key === 'approvaDate' && masterInfo[col.key]
                              ? masterInfo[col.key].substring(0, 10).replace(/-/g, '-')
                              : masterInfo[col.key] || ''
                        }
                        readOnly  />
                  </div>
                </div>
            );
          })}
        </div>
      </div>

      <div className="modal-Footer">
        <div className="btn-Wrap">
            {isCompleted && <button className="btn-Primary" onClick={(e) => { onDelApprovalsDel(e) }}> 삭제</button>}  
            <button className="btn-Secondary" onClick={onClose}>닫기</button>
        </div>
      </div>
    
          
    </div>
  )
}

export default ApprovalsModal
