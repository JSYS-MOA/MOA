import { useState } from "react";
import Table from "../../components/Table";
import { useGetOrder , useGetOrderInfo } from "../../apis/InventoryService";
import Modal from "../../components/Modal";
import { type ModalProps , type MColumn } from "../../types/TModalProps";
import { type Column } from "../../types/TableProps";


const InventoryOrder = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data } =  useGetOrder( search, page, 10);
  const {  mutate } = useGetOrderInfo()

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

    const onInventoryClick = ( item : any , e : React.MouseEvent) => {

      if('orderformId' in item) {
        
        mutate (item.orderformId, {
        onSuccess: (data) => {
          setInfo(data);
          setModal(true)
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          alert("정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
    }

  const columns : Column[] = [
    { key: 'orderformId', label: '발주번호 ' },
    { key: 'orderformDate', label: '발주일자' },
    { key: 'vendorName', label: '거래처명 '  },
    { key: 'productName', label: '품목명' },
    { key: 'orderSno', label: '수량' },
    { key: 'stockInDate', label: '납기일' },
    { key: 'unitPrice', label: '단가' },
    { key: 'totalPrice', label: '금액' },
    { key: 'orderStatus', label: '상태' }
  ]

  const ModalColumns : MColumn[] = [
      { key: 'productCord', label: '품목코드' },
      { key: 'productName', label: '품목명'  },
       { key: 'orderSno', label: '수량' },
      { key: 'unitPrice', label: '단가' },
      { key: 'productPrice', label: '총금액' },
     
  ]

  return (
    <div>
      {data != null ?<>
      <Table
        items={data.content}
        columns={columns}
        onItemClick={onInventoryClick}
       />

      {modal && info != null ?
        <Modal items={info.content} maxPage={info.totalPages} columns={ModalColumns} /> : null}

      <button onClick={()=>{changePage(-1)}}>aa</button>
      <button onClick={()=>{changePage(1)}}>aa</button>
       </> : "로딩중입니다." }
        
      
    </div>
  )
}

export default InventoryOrder
