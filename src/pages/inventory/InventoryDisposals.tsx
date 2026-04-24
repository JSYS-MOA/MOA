import { useState } from "react";
import Table from "../../components/inventory/InventoryTable";
import { useGetDefect , useGetDefectInfo } from "../../apis/InventoryService";
import Modal from "../../components/inventory/InventoryModal";
import OutboundModal from "../../components/inventory/InventoryOutboundModalForm"
import { type ModalProps , type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";


const InventoryDisposals = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [onAlert, setOnAlert] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data , refetch: refetchList } =  useGetDefect( search, page, 10);
  const {  mutate } = useGetDefectInfo()

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

      if('inventoryId' in item) {
        
        mutate (item.inventoryId, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('LIST')
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          alert("정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
    }

  const columns : Column[] = [
    { key: 'reqDate', label: '일자 ' },
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'defectSno', label: '수량' },
    { key: 'defectMemo', label: '처리유형' }
  ]

  const ModalColumns : MColumn[] = [
      { key: 'productCord', label: '품목코드' },
      { key: 'productName', label: '품목명'  },
      { key: 'storageName', label: '창고명' },
      { key: 'productPrice', label: '입고단가' },
      { key: 'defectSno', label: '수량' }
  ]

  const outboundModalColumns : MColumn[] = [
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '입고창고' },
    { key: 'expirationDate', label: '유통기한' },
    { key: 'inventorySno' , label: '재고' },
    { key: 'logisticSno', label: '출고수량' },
    { key: 'defectStatus', label: '불량여부' },
    { key: 'defectMemo', label: '메모' }
  ]

    const refetch = () => {
      refetchList();
    };

  return (
    <div>
      {data != null ?<>
      <Table
        items={data.content}
        columns={columns}
        onItemClick={onInventoryClick}
       />

      {modalMode == 'LIST' && info != null ?
        <Modal
          items={info.content}
          maxPage={info.totalPages}
          columns={ModalColumns}
          keySno='defectSno'
          keyPrice='productPrice'
          keytype=''
          /> : null}

      <button onClick={()=>{changePage(-1)}}>aa</button>
      <button onClick={()=>{changePage(1)}}>aa</button>
      
      <button onClick={()=>{setModalMode('OUTBOUND')}}>출고/폐기 등록</button> 

      {modalMode === 'OUTBOUND' ?
      <OutboundModal
      columns={outboundModalColumns} keySno='logisticSno' keyPrice='unitPrice' keytype='orderStatus'
      onClose={() => setModalMode('')} onRefresh={refetch} setOnAlert={setOnAlert} />: null}
   
      
       </> : "로딩중입니다." }
        
      

    </div>
  )
}

export default InventoryDisposals
