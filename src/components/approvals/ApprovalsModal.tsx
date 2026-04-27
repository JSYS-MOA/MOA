import React, { useEffect, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { useDeleteApprovals } from '../../apis/ApprovalsService'

const ApprovalsModal = (  { items , maxPage , columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose}: {
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
        onError: (error) => {
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

  const isCompleted = masterInfo.approvaStatus === '결재';

  return (
    <div>

       {columns.map((col) => {
          if (col.key === 'writerInfo.userName') {
            return (
              <div key="row-writer-approver" style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flex: 1 }}>
                  <div style={{ width: '100px' }}><strong>기안자</strong></div>
                  <input value={masterInfo['writerInfo.userName'] || ''} readOnly style={{ width: '80px' }} />
                  <input value={masterInfo['writerInfo.employeeId'] || ''} readOnly style={{ width: '50px', marginLeft: '4px' }} />
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                  <div style={{ width: '100px' }}><strong>결재자</strong></div>
                  <input value={masterInfo['approverInfo.userName'] || ''} readOnly style={{ width: '80px' }} />
                  <input value={masterInfo['approverInfo.employeeId'] || ''} readOnly style={{ width: '50px', marginLeft: '4px' }} />
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
                <input value={masterInfo[col.key] || ''} readOnly style={{ width: '100%' }} />
              </div>
            </div>
          );
        })}

      {!isCompleted && <button onClick={(e) => { onDelApprovalsDel(e) }}> 결재 삭제</button>}  
          
    </div>
  )
}

export default ApprovalsModal
