import axios from "axios";

const API = "http://localhost/api";

export async function baseApi(){

    const baseApi = axios.create({
        baseURL: "http://localhost/api/base",
        withCredentials: true,
    });

// GET 요청용 (조회)
    export const getBaseData = async (path: string) => {
        const { data } = await baseApi.get(path); // path에는 "whse"나 "allow"만 들어옴
        return data;
    };

// POST 요청용 (등록)
    export const saveBaseData = async (path: string, payload: any) => {
        const { data } = await baseApi.post(path, payload);
        return data;
    };
// 수정 (PUT)
    export const updateBaseData = async (path: string, id: number | string, payload: any) => {
        const { data } = await baseApi.put(`${path}/${id}`, payload);
        return data;
    };

// 삭제 (DELETE)
    export const deleteBaseData = async (path: string, id: number | string) => {
        const { data } = await baseApi.delete(`${path}/${id}`);
        return data;
    };
}