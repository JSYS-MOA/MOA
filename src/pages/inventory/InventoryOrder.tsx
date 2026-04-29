import { useState } from "react";
import {FaStar} from "react-icons/fa";
import Table from "../../components/inventory/InventoryTable";
import { useGetOrder , useGetOrderInfo } from "../../apis/InventoryService";
import ListModal from "../../components/inventory/InventoryListModalForm";
import AddModal from "../../components/inventory/InventoryAddModalForm"
import InboundModal from "../../components/inventory/InventoryInboundModalForm"
import { type ModalProps , type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";
import Alert from "../../components/inventory/Alert";


const InventoryOrder = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  const [modalMode, setModalMode] = useState('');
  

  const { data , refetch: refetchList } =  useGetOrder( search, page, 10);
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
         setCurrentOrderId(item.orderformId);
        mutate (item.orderformId, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('LIST')
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          setOnAlert("정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
  }

  const handleInbound = ( item : any , e : React.MouseEvent) => {
   
    if('orderformId' in item) {
         setCurrentOrderId(item.orderformId);
        mutate (item.orderformId, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('INBOUND');
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          setOnAlert("정보를 가져오는데 실패했습니다.");
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
      { key: 'totalPrice', label: '총금액' },
  ]

  const inboundModalColumns : MColumn[] = [
      { key: 'productCord', label: '품목코드' },
      { key: 'productName', label: '품목명'  },
      { key: 'orderSno', label: '발주수량' },
      { key: 'logisticSno', label: '입고수량' },
      { key: 'storageName', label: '입고창고' },
      { key: 'expirationDate', label: '유통기한' },
      { key: 'defectSno', label: '불량' },
      { key: 'defectStatus', label: '상태' },
      { key: 'defectMemo', label: '메모' }
  ]

  const refetch = () => {
    refetchList();
    
    if (currentOrderId) {
      mutate(currentOrderId, {
        onSuccess: (newData) => {
          setInfo(newData); // 수정된 데이터를 인포에 다시 덮어씌움
        }
      });
    }
  };

  return (
    <div>
      <div className="favorite-Header">
          <FaStar size={18} color="#C4C4C4"/>
          <span>발주현황</span>
      </div>
      
      {data != null ?<>
        <Table
          items={data.content}
          columns={columns}
          page={page}
          onItemClick={onInventoryClick}
          handleInbound={handleInbound}
        />

        {modalMode !== ''  ? <div className='modal-Overlay'>

          {modalMode === 'LIST' && info != null ?
            <ListModal
            items={info.content} maxPage={info.totalPages} columns={ModalColumns} onClose={() => setModalMode('')}
            keySno='orderSno' keyPrice='unitPrice'  keytype='orderStatus' onRefresh={refetch} setOnAlert={setOnAlert}/> : null}

          {modalMode === 'ADD' ?
            <AddModal
            columns={ModalColumns} keySno='orderSno' keyPrice='unitPrice' keytype='orderStatus'
            onClose={() => setModalMode('')} onRefresh={refetch} setOnAlert={setOnAlert} />: null}

          {modalMode === 'INBOUND' && info != null ?
            <InboundModal
            items={info.content} maxPage={info.totalPages} columns={inboundModalColumns} keySno='logisticSno' keyPrice='unitPrice' keytype='orderStatus'
            onClose={() => setModalMode('')} onRefresh={refetch} setOnAlert={setOnAlert} />: null}

        </div> : null }
        
        {maxPage > 1 ?
        <div className='Page-Btn-container'>
          <button onClick={()=>{changePage(-1)}} className='btn-Primary'>이전</button>
          <button onClick={()=>{changePage(1)}} className='btn-Primary'>다음</button>
        </div> : null }

       </> : "로딩중입니다." }

       <div className='Btn-container'>
          <button onClick={()=>{setModalMode('ADD')}} className='btn-Primary'>발주하기</button> 
        </div>

       

      {onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }
    </div>
  )
}

export default InventoryOrder
