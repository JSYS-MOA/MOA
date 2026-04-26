import React, { useState } from 'react'
import { useAuthStore } from "../../stores/useAuthStore.tsx";
import Table from "../../components/approvals/ApprovalsTable.tsx"
import { type ModalProps ,  type MColumn } from "../../types/ModalProps.tsx";
import { type Column } from "../../types/TableProps.tsx";
import { useGetApprovaWaitList , useGetApprovaInfo } from "../../apis/ApprovalsService.tsx";
import Alert from '../../components/inventory/Alert.tsx';

const ApprovalsWait = () => {

  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data } =  useGetApprovaWaitList( user?.userId! ,search, page, 10);
  const { mutate } = useGetApprovaInfo()

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

        if('approver' in item) {          
          mutate (item.approver, {
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
      { key: 'approvaDate', label: '일자' },
      { key: 'approvaKind', label: '문서번호'  },
      { key: 'approvaTitle', label: '창고명' },
      { key: 'approver', label: '결재자' },
      { key: 'approvaStatus', label: '결제상태' },
      { key: 'approvaMemu', label: '비고' },
      { key: 'approvaInfo', label: '결재' }
       
  ]
  
  const ModalColumns : MColumn[] = [
      { key: 'logisticDate', label: '일자' },
      { key: 'productName', label: '품목명'  },
      { key: 'incoming', label: '입고수량'  },
      { key: 'outgoing', label: '출고수량' },
      { key: 'productPrice', label: '개별가격' },
      { key: 'totallogisticsPrice', label: '합계' }
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

export default ApprovalsWait
