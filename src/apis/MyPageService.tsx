import axios from "axios";

const API = "http://localhost/api";

export async function getMyInfoApi(){
    const { data } = await axios.get(
        `${API}/my/profile`,
        {withCredentials:true}
    );
    return data;
}