import Calender from '../components/Calender'
import { useAuthStore } from "../stores/useAuthStore";
import Table from '../components/Table'


const Home = () => {

  const { user } = useAuthStore();

  const a = [ {employeeId: '1' , userName : 'a'} , { employeeId: '2' , userName : 'b' }]

  return (
    <div>
        홈입니다
        {user != null ?  
          <>
          <br/> {user.userName} 
          <br/> {user.employeeId}
          </> 
          : <> <br/> 로그인 데이터 없음 </>
        }
        <Calender/>

        <Table items={a}  />
    </div>
  )
}

export default Home
