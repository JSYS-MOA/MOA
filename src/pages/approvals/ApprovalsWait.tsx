import React, { useState } from 'react'
import {FaStar} from "react-icons/fa";
import { useAuthStore } from "../../stores/useAuthStore";
import Table from "../../components/approvals/ApprovalsTable.tsx"
import { type ModalProps ,  type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";
import { useGetApprovaWaitList , useGetApprovaInfo } from "../../apis/ApprovalsService.tsx";
import Alert from '../../components/inventory/Alert.tsx';
import Modal from '../../components/approvals/ApprovalsWaitModal.tsx' 

const ApprovalsWait = () => {

  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data , refetch: refetchList  } =  useGetApprovaWaitList( user?.userId! ,search, page, 10);
  const { mutate  } = useGetApprovaInfo()

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

        if('approvaId' in item) {          
          mutate (item.approvaId, {
          onSuccess: (data) => {
            setInfo(data);
            setModalMode('LIST')
            console.log("ApprovaUser 성공 데이터:", data.content);
          },onError: (error: any) => {
            setOnAlert("정보를 가져오는데 실패했습니다.");
          }
        })
         
        }
        
  }
  
  const columns : Column[] = [
      { key: 'approvaDate', label: '일자' },
      { key: 'approvaKind', label: '문서번호'  },
      { key: 'approvaTitle', label: '결재명' },
      { key: 'approver', label: '결재자' },
      { key: 'approvaStatus', label: '결제상태' },
      { key: 'approvaMemu', label: '비고' },
      { key: 'approvaInfo', label: '결재' }
       
  ]
  
  const ModalColumns : MColumn[] = [
      { key: 'approvaDate', label: '일자' },
      { key: 'approvaTitle', label: '제목' },
      { key: 'writerInfo.userName', label: '기안자' },
      { key: 'approverInfo.userName', label: '결재자' },
      { key: 'approvaStatus', label: '결제상태' },
      { key: 'approvaContent', label: '내용' },
      { key: 'approvaMemu', label: '비고' },
  ]

  return (
    <div>
      <div className="favorite-Header">
            <FaStar size={18} color="#C4C4C4"/>
            <span>부서별 권한승인</span>
      </div>

      {data != null ?<>
        <Table
          items={data.content}
          columns={columns}
          onItemClick={onApprovaUserClick}
          />

        {modalMode === 'LIST' && info != null ?
        <Modal items={info.content} maxPage={info.totalPages} columns={ModalColumns} keytype='approvaStatus'
                onClose={() => setModalMode('')} onRefresh={refetchList}setOnAlert={setOnAlert} /> : null}

        <button onClick={()=>{changePage(-1)}}>aa</button>
        <button onClick={()=>{changePage(1)}}>aa</button>
        </> : "로딩중입니다." }
    
      { onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }
    </div>
  )
}

export default ApprovalsWait
