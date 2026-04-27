import React, { useEffect, useState  } from 'react'
import { type  ModalProps , type MColumn } from '../../types/ModalProps';
import { patchTeamMembers } from '../../apis/ApprovalsService'
import ConfirmModal from './ApprovalsConfirmModal'

const TeamMemberModal = (  { items , maxPage , columns, keySno , keyPrice , keytype , onRefresh , setOnAlert , onClose}: {
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
    <form onSubmit={(e)=> { onConfirm(e)}}>

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

          if(col.key === 'performance' ) {
            return (
            <div key={col.key} style={{ display: 'flex', marginBottom: '8px' }}>
              <div style={{ width: '100px' }}><strong>{col.label}</strong></div>
              <div style={{ flex: 1 }}>
                <input value={masterInfo.performance ||  ''} style={{ width: '100%' }}  onChange={(e)=>{handleInputChange(col.key, e.target.value)}}/>
              </div>
            </div>
          )}

          return (
            <div key={col.key} style={{ display: 'flex', marginBottom: '8px' }}>
              <div style={{ width: '100px' }}><strong>{col.label}</strong></div>
              <div style={{ flex: 1 }}>
                <input value={masterInfo[col.key] || ''} readOnly style={{ width: '100%' }} />
              </div>
            </div>
          );
        })}

      <button type='submit'> 등록 </button>

      {confirm !== '' && <ConfirmModal isOpen={confirm !== '' } message={confirm} onConfirm={(e : any )=>{onSubmitPatch(e)}}  onClose={()=>{setConfirm('')}}/> } 
  
    </form>
  )
}

export default TeamMemberModal
