import { useState } from "react";
import Table from "../../components/Table";
import { useGetInventory , useGetInventoryInfo } from "../../apis/InventoryService";
import Modal from "../../components/Modal";
import { type ModalProps } from "../../types/ModalProps";
import { type Column } from "../../types/TableProps";


const Inventory = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
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

    const onInventoryClick = ( item : any , e : React.MouseEvent) => {
      
      console.log("클릭");

      if('productId' in item) {
        
        mutate (item.productId, {
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
    { key: 'productCord', label: '품목코드' },
    { key: 'productName', label: '품목명'  },
    { key: 'storageName', label: '창고명' },
    { key: 'productPrice', label: '입고단가' },
    { key: 'inventorySno', label: '총재고수량' }
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
        <Modal items={info.content} maxPage={info.totalPages} /> : null}

      <button onClick={()=>{changePage(-1)}}>aa</button>
      <button onClick={()=>{changePage(1)}}>aa</button>
       </> : "로딩중입니다." }
        
      
    </div>
  )
}

export default Inventory
