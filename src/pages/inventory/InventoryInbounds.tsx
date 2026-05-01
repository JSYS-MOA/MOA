import { useState } from "react";
import {FaStar} from "react-icons/fa";
import Table from "../../components/inventory/InventoryTable";
import { useGetInbounds , useGetInboundsInfo } from "../../apis/InventoryService";
import Modal from "../../components/inventory/InventoryModal";
import { type ModalProps ,  type MColumn } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";
import Alert from "../../components/inventory/Alert";


const InventoryInbounds = () => {
  const [page, setPage] = useState(0);
    // const [search, setSearch] = useState('');
  const search = '';
  const [onAlert, setOnAlert] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [info, setInfo] = useState<{ content: ModalProps[] , totalPages : number } | null>(null);;

  const { data } =  useGetInbounds( search, page, 10);
  const { mutate } = useGetInboundsInfo()

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

      if('logisticsOrderNum' in item) {
        
        mutate (item.logisticsOrderNum, {
        onSuccess: (data) => {
          setInfo(data);
          setModalMode('INFO')
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          setOnAlert( error + "정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
    }

    const columns : Column[] = [
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '창고명' },
    { key: 'logisticSno', label: '수량' }
  ]

  const ModalColumns : MColumn[] = [
    { key: 'logisticDate', label: '일자' },
    { key: 'productName', label: '품목명'  },
    { key: 'incoming', label: '입고수량'  },
    { key: 'productPrice', label: '개별가격' },
    { key: 'totallogisticsPrice', label: '합계' }
  ]

  return (
    <div>
      <div className="favorite-Header">
          <FaStar size={18} color="#C4C4C4"/>
          <span>입고현황</span>
      </div>
      
      {data != null ?<>
      <Table
        items={data.content}
        columns={columns}
        page={page}
        onItemClick={onInventoryClick}
       />
      
      {modalMode !== ''  ? <div className='modal-Overlay'>
      {modalMode === 'INFO' && info != null ?
        <Modal items={info.content} onClose={()=>{setModalMode('')}} title="입고현황" maxPage={info.totalPages} columns={ModalColumns} keySno='logisticSno' keyPrice='productPrice' keytype='logisticsType' /> : null}
      
      </div> : null}
      
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

export default InventoryInbounds
