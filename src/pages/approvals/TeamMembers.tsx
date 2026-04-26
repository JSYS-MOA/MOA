import React, { useState } from 'react'
import { useAuthStore } from "../../stores/useAuthStore.tsx";
import Table from "../../components/approvals/ApprovalsTable.tsx"
import { type ModalProps ,  type MColumn } from "../../types/ModalProps.tsx";
import { type Column } from "../../types/TableProps.tsx";
import { useGetMembersList , useGetMembersInfo } from "../../apis/ApprovalsService.tsx";
import Alert from '../../components/inventory/Alert.tsx';

const TeamMembers = () => {

  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data } =  useGetMembersList( user?.departmentId! ,search, page, 10);
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
  
  

  const onApprovaUserClick = ( item : any , e : React.MouseEvent) => {
    console.log(item)

        if('approvaId' in item) {
          
          mutate (item.approvaId, {
          onSuccess: (data) => {
            setInfo(data);
            setModal(true)
            console.log("ApprovaUser 성공 데이터:", data.content);
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
      {data != null ?<>
        <Table
          items={data.content}
          columns={columns}
          onItemClick={onApprovaUserClick}
          />

        {/* {modal && info != null ?
        <Modal items={info.content} maxPage={info.totalPages} columns={ModalColumns} keySno='logisticSno' keyPrice='productPrice' keytype='logisticsType' /> : null} */}

        <button onClick={()=>{changePage(-1)}}>aa</button>
        <button onClick={()=>{changePage(1)}}>aa</button>
        </> : "로딩중입니다." }
    
      { onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }
    </div>
  )
}

export default TeamMembers
