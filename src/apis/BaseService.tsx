import axios from "axios";
import {baseConfigs} from "../types/baseConfigs.tsx";

    const api = axios.create({
        baseURL: "http://localhost/",
        withCredentials: true,
    });
// GET 요청용 (조회)
    export const getBaseData = async (path: keyof typeof baseConfigs) => {
        const realUrl = baseConfigs[path].apiUrl;

        const { data } = await api.get(realUrl); // path에는 "whse"나 "allow"만 들어옴
        return data;
    };

// POST 요청용 (등록)
    export const saveBaseData = async (path: keyof typeof baseConfigs, payload: any) => {
        const realUrl = baseConfigs[path].apiUrl;

        const { data } = await api.post(realUrl, payload);
        return data;
    };
// 수정 (PUT)
    export const updateBaseData = async (path: keyof typeof baseConfigs, id: number | string, payload: any) => {
        const realUrl = baseConfigs[path].apiUrl;

        const { data } = await api.put(`${realUrl}/${id}`, payload);
        return data;
    };

// 삭제 (DELETE)
    export const deleteBaseData = async (path: keyof typeof baseConfigs, id: number | string) => {
        const realUrl = baseConfigs[path].apiUrl;

        const { data } = await api.delete(`${realUrl}/${id}`);
        return data;
    };
