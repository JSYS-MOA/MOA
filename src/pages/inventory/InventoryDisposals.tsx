import { useState } from "react";
import {FaStar} from "react-icons/fa";
import Table from "../../components/inventory/InventoryTable";
import { useGetDefect , useGetDefectInfo } from "../../apis/InventoryService";
import Modal from "../../components/inventory/InventoryModal";
import OutboundModal from "../../components/inventory/InventoryOutboundModalForm"
import { type ModalProps , type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";
import Alert from "../../components/inventory/Alert";


const InventoryDisposals = () => {
  const [page, setPage] = useState(0);
    // const [search, setSearch] = useState('');
  const search = '';
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

    const onInventoryClick = ( item : any ) => {

      if('inventoryId' in item) {
        
        mutate (item.inventoryId, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('LIST')
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          setOnAlert( error + "정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
    }

  const columns : Column[] = [
    { key: 'reqDate', label: '일자 ',align:"center" },
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'defectSno', label: '수량',align:"center" },
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
      <div className="favorite-Header">
          <FaStar size={18} color="#C4C4C4"/>
          <span>불량/폐기 현황</span>
      </div>
      
      {data != null ?<>
      <Table
        items={data.content}
        columns={columns}
        page={page}
        onItemClick={onInventoryClick}
       />

      {modalMode !== ''  ? <div className='modal-Overlay'>

        {modalMode == 'LIST' && info != null ?
        <Modal
          items={info.content}
          maxPage={info.totalPages}
          title={'불량/폐기현황'}
          columns={ModalColumns}
          onClose={() => setModalMode('')}
          keySno='defectSno'
          keyPrice='productPrice'
          keytype=''
          /> : null}

        {modalMode === 'OUTBOUND' ?
        <OutboundModal
        columns={outboundModalColumns} keySno='logisticSno' keyPrice='unitPrice'
        onClose={() => setModalMode('')} onRefresh={refetch} setOnAlert={setOnAlert} />: null}
      
      </div> : null }
   
        <div className='Btn-container'>
          <button onClick={()=>{setModalMode('OUTBOUND')}} className='btn-Primary' >출고/폐기 등록</button> 
        </div>
      
      {maxPage > 1 ?
        <div className='Page-Btn-container'>
          <button onClick={()=>{changePage(-1)}} className='btn-Primary'>이전</button>
          <button onClick={()=>{changePage(1)}} className='btn-Primary'>다음</button>
        </div> : null }
        
        
       </> : "로딩중입니다." }
        
      
        { onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }
    </div>
  )
}

export default InventoryDisposals
