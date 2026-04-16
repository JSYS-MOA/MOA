import { useState } from "react";
import Table from "../../components/Table";
import { useGetInventory , useGetInventoryInfo } from "../../apis/InventoryService";
import Modal from "../../components/Modal";
import { type ModalProps } from "../../types/ModalProps";


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
      
      if('inventoryId' in item) {
        
        mutate (item.inventoryId, {
        onSuccess: (data) => {
          setInfo(data);
          setModal(true)
          console.log("성공 데이터:", data.content);
        },onError: (error: any) => {
          alert("유저 정보를 가져오는데 실패했습니다.");
        }
      })
       
      }
      
    }

  return (
    <div>
      {data != null ?<>
      <Table
        items={data.content}
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
