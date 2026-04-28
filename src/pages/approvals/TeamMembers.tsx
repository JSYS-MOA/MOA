import React, { useState } from 'react'
import {FaStar} from "react-icons/fa";
import { useAuthStore } from "../../stores/useAuthStore.tsx";
import Table from "../../components/approvals/TeamMemberTable.tsx"
import { type ModalProps ,  type MColumn } from "../../types/ModalProps.tsx";
import { type Column } from "../../types/TableProps.tsx";
import { useGetMembersList , useGetMembersInfo } from "../../apis/ApprovalsService.tsx";
import Alert from '../../components/inventory/Alert.tsx';
import Modal from '../../components/approvals/TeamMemberModal.tsx'

const TeamMembers = () => {

  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data , refetch : refetchList } =  useGetMembersList( user?.departmentId! ,search, page, 10);
  const { mutate } = useGetMembersInfo()

  const maxPage = data ? data.totalPages  : 0; 
    

  const changePage = (num: number) => {
          const newPage : number = page + num
        if( newPage <= 0 ) {
          setPage(0);
        } else if(  newPage >= maxPage -1) {
           setPage(maxPage -1);
        } else {
          setPage( page => page + num);
        }
  };
  
  const onTeamMemberClick = ( item : any , e : React.MouseEvent) => {
    if('userId' in item) {
      mutate (item.userId, {
      onSuccess: (data) => {
        setInfo({
          content: [data],
          totalPages: 1
        });
        setModalMode('LIST')
        console.log("TeamMember 성공 데이터:", data);
      },onError: (error: any) => {
        setOnAlert("정보를 가져오는데 실패했습니다.");
      }
    })
      
    }
  }
  
  const columns : Column[] = [
    { key: 'employeeId', label: '사원번호' },
    { key: 'userName', label: '이름'  },
    { key: 'departmentName', label: '부서' },
    { key: 'roleName', label: '직책' },
    { key: 'startDate', label: '근무시작일' }, 
  ]
  
  const ModalColumns : MColumn[] = [
    { key: 'employeeId', label: '사원번호' },
    { key: 'userName', label: '이름'  },
    { key: 'departmentName', label: '부서' },
    { key: 'roleName', label: '직책' },
    { key: 'startDate', label: '근무시작일' }, 
    { key: 'performance', label: '평가' },
  ]

  return (
    <div>
      <div className="favorite-Header">
            <FaStar size={18} color="#C4C4C4"/>
            <span>소속팀원관리</span>
      </div>

      {data != null ?<>
        <Table
          items={data.content}
          columns={columns}
          page={page}
          onItemClick={onTeamMemberClick}
          />

        {modalMode !== ''  ? <div className='modal-Overlay'>
          {modalMode === 'LIST' && info != null ?
          <Modal items={info.content} maxPage={info.totalPages} columns={ModalColumns} 
                  onClose={() => setModalMode('')} onRefresh={refetchList}setOnAlert={setOnAlert} /> : null}
          
          {maxPage > 1 ?
          <div className='Page-Btn-container'>
            <button onClick={()=>{changePage(-1)}} className='btn-Primary'>이전</button>
            <button onClick={()=>{changePage(1)}} className='btn-Primary'>다음</button>
          </div> : null }
        </div> : null }
        
        </> : "로딩중입니다." }
    
      { onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }
    </div>
  )
}

export default TeamMembers
