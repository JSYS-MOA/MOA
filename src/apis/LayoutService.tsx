import axios from "axios";

const API = "http://localhost/api";

export async function layoutApi(){
    const { data } = await axios.get(
        `${ API }/auth/layout`,
        { withCredentials: true } //서버와 주소가 달라서 브라우저가 JSESSIONID 쿠키를 같이 보내야 유저 인식(필수)
    );
    return data;
}