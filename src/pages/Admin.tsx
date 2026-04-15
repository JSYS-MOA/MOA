import React, { useState } from 'react'
import { useGetRole , usePatchRole } from '../apis/AdminService'
import Table from '../components/Table'

const Admin = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data } =  useGetRole( search, page, 10);
  const {  mutate, isPending } = usePatchRole()
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

  const onRoleChange = (e : React.ChangeEvent) => {
    const { id , value } = e.target as HTMLSelectElement;
    const roleId : number = Number(value);
    const userId : number = Number(id);

     mutate({ userId , roleId }, {
        onSuccess: (data) => {
          console.log("성공 데이터:", data);
        },
        onError: (error: any) => {
          alert(error + "수정이 실패했습니다.");
        }
      });
    
  }

  
  console.log(maxPage)
  console.log(data)


  return (
    <div>
      {data != null ?
      <Table
        items={data.content}
        onItemChange={onRoleChange} />
      : "로딩중입니다." }

      <button onClick={()=>{changePage(-1)}}>aa</button>
      <button onClick={()=>{changePage(1)}}>aa</button>
    </div>
  )
}

export default Admin
