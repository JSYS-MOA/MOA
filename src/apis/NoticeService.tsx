import axios from "axios";

const API = "http://localhost/api";

export async function getNoticesApi(){
    const {data} = await axios.get(
        `${API}/main/notices`,
        { withCredentials: true}
    );
    return data;
}

export async function getNoticeInfoApi(noticeId:number){
    const {data} = await axios.get(
        `${API}/main/notices/${noticeId}`,
        {withCredentials: true}
    );
    return data;
}