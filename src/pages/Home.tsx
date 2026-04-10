import Calender from '../components/Calender'
import { useAuthStore } from "../stores/useAuthStore";


const Home = () => {

  const { user } = useAuthStore();

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
    </div>
  )
}

export default Home
