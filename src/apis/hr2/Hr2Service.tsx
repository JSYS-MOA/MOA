import axios from "axios";
import {hr2Configs} from "../../types/hr2Configs.tsx";

const api = axios.create({
    // baseURL: "http://localhost/",
    baseURL: "https://moa-server.onrender.com",
    withCredentials: true,
});

export const getHr2Data = async (path: keyof typeof hr2Configs, page = 0, size = 15, filterDTO: any) => {
    const realUrl = hr2Configs[path].apiUrl;

    const { data } = await api.get(`${realUrl}`,{
        params: {
            page,
            size,
            ...filterDTO
    }});
    return data;
};
//
export const saveHr2Data = async (path: keyof typeof hr2Configs, payload: any) => {
    const realUrl = hr2Configs[path].apiUrl;

    const { data } = await api.post(realUrl, payload);
    return data;
};
// 수정 (PUT)
export const updateHr2Data = async (path: keyof typeof hr2Configs, id: number | string, payload: any) => {
    const realUrl = hr2Configs[path].apiUrl;

    const { data } = await api.put(`${realUrl}/${id}`, payload);
    return data;
};

// 삭제 (DELETE)
export const deleteHr2Data = async (path: keyof typeof hr2Configs, id: number | string) => {
    const realUrl = hr2Configs[path].apiUrl;

    const { data } = await api.delete(`${realUrl}/${id}`);
    return data;
};

export const getUserData = async (path: keyof typeof hr2Configs, keyword: string) =>{
    const realUrl = hr2Configs[path].apiUrl;

    try {
        const {data} = await api.get(`${realUrl}`,{params: {keyword}});
        console.log("realUrl: "+`${realUrl}`);
        return data;
    } catch (e) {
        console.error(`${path} 데이터 조회 실패:`, e);
        return [];
    }
}
export const getAllowanceData = async (path: keyof typeof hr2Configs, keyword: string) =>{
    const realUrl = hr2Configs[path].apiUrl;

    try {

        const {data} = await api.get(`${realUrl}`,{params: {keyword}});
        console.log("realUrl: "+`${realUrl}`);
        return data;
    } catch (e) {
        console.error(`${path} 데이터 조회 실패:`, e);
        return [];
    }
}