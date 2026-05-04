import axios from "axios";
import {useAuthStore} from "../stores/useAuthStore.tsx";

// const API = "http://localhost/api";
const API = "https://moa-server.onrender.com/api";

export async function layoutApi(){
 
    const { user } = useAuthStore.getState(); 
    const employeeId = user?.employeeId;

    if (!employeeId) {
        console.error("아이디가 없습니다!");
        return;
    }

    const { data } = await axios.get(
        `${ API }/auth/layout`,
        
        {  params: { employeeId: employeeId } , withCredentials: true } //서버와 주소가 달라서 브라우저가 JSESSIONID 쿠키를 같이 보내야 유저 인식(필수)
    );
    return data;
}