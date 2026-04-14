import React, { useState } from 'react'
import { useGetRole } from '../apis/AdminService'
import Table from '../components/Table'

const Admin = () => {
  const [page, setPage] = useState(0);

  const { data } =  useGetRole(  '', page, 10);
  const maxPage = data ? data.totalPages : 0; 

  console.log(maxPage)
  console.log(data)


  return (
    <div>
      {data != null ?
      <Table items={data} />
      : "로딩중입니다." }

      <button onClick={()=>{setPage(0)}}>aa</button>
      <button onClick={()=>{setPage(1)}}>aa</button>
    </div>
  )
}

export default Admin
