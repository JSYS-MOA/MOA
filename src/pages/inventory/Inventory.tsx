import { useState } from "react";
import {FaStar} from "react-icons/fa";
import { useGetInventory , useGetInventoryInfo } from "../../apis/InventoryService";
import { type ModalProps ,  type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";
import Table from "../../components/inventory/InventoryTable";
import Modal from "../../components/inventory/InventoryModal";
import Alert from "../../components/inventory/Alert";
import "../../assets/styles/component/table.css"
import Button from "../../components/Button";


const Inventory = () => {
  const [page, setPage] = useState(0);
    // const [search, setSearch] = useState('');
  const search = '';
  const [onAlert, setOnAlert] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data } =  useGetInventory( search, page, 10);
  const {  mutate } = useGetInventoryInfo()

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

      if('productId' in item) {
        
        mutate (item.productId, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('INFO')
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          setOnAlert(error + "정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
  }

  const columns : Column[] = [
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '창고명' },
    { key: 'productPrice', label: '입고단가' ,align:"right"},
    { key: 'inventorySno', label: '총재고수량',align:"center" }
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
      <div className="favorite-Header">
          <FaStar size={18} color="#C4C4C4"/>
          <span>물류현황</span>
      </div>

      <div className="inventory-table-box">
      {data != null ?<>
      <Table
        items={data.content}
        columns={columns}
        page={page}
        onItemClick={onInventoryClick}
       />

      {modalMode !== ''  ? <div className='modal-Overlay'>

      
      {modalMode === 'INFO' && info != null ?
        <Modal items={info.content} onClose={()=>{setModalMode('')}} maxPage={info.totalPages} title={'재고현황'} columns={ModalColumns} keySno='logisticSno' keyPrice='productPrice' keytype='logisticsType' /> : null}

      </div> : null }

       {maxPage > 1 ?
        <div className='Page-Btn-container'>
          <button onClick={()=>{changePage(-1)}} className='btn-Primary'>이전</button>
          <button onClick={()=>{changePage(1)}} className='btn-Primary'>다음</button>
        </div> : null }

       </>: "로딩중입니다." }
      </div>
      
      { onAlert !== '' ? <Alert onClose={() => setOnAlert('')} >{onAlert}</Alert> : null }

    </div>
  )
}

export default Inventory
