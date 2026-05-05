import axios from "axios";

//  const API = "http://localhost/api";
const API = "https://moa-server.onrender.com/api";

export async function getMyInfoApi(){
    const { data } = await axios.get(
        `${API}/my/profile`,
        {withCredentials:true}
    );
    return data;
}