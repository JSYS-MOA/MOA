import React, { useState } from 'react'
import {FaStar} from "react-icons/fa";
import { useGetRole , usePatchRole , useGetRoleSelect } from '../../apis/AdminService'
import Table from '../../components/admin/AdminTable'
import { type Column } from '../../types/TableProps'

const Admin = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data , refetch } =  useGetRole( search, page, 10);
  const { data : role   } =  useGetRoleSelect();
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

  const onRoleChange = (id: number, value: number) => {
    console.log(id, value)

    const roleId : number = Number(value);
    const userId : number = Number(id);

     mutate({ userId , roleId }, {
        onSuccess: (data) => {
          refetch()
          console.log("성공 데이터:", data);
        },
        onError: (error: any) => {
          alert(error + "수정이 실패했습니다.");
        }
      });
    
  }

  const columns : Column[] = [
    { key: 'employeeId', label: '사원번호' },
    { key: 'userName', label: '성명' },
    { key: 'gradeName', label: '직급/직위' },
    { key: 'phone', label: '연락처' },
    { key: 'email', label: 'Email' },]
  
  return (
    <div>
      <div className="favorite-Header">
          <FaStar size={18} color="#C4C4C4"/>
          <span>부서별 권한승인</span>
      </div>

      <div className='myInfo-Section'>
        {data != null && role != null ?
        <Table
          items={data.content} page={page}
          onItemChange={onRoleChange} columns={columns} select={role.content}/>
        : "로딩중입니다." }
        
        <div className='Page-Btn-container'>
          <button onClick={()=>{changePage(-1)}} className='btn-Primary'>이전</button>
          <button onClick={()=>{changePage(1)}} className='btn-Primary'>다음</button>
        </div>

      </div>

    </div>
  )
}

export default Admin
