import axios from "axios";
import {hr2Configs} from "../../types/hr2Configs.tsx";

const api = axios.create({
     baseURL: "http://localhost/",
    // baseURL: "https://moa-server.onrender.com/",
    withCredentials: true,
});

export const getHr2Data = async (path: keyof typeof hr2Configs, page = 0, size = 15, filterDTO: any) => {
    const realUrl = hr2Configs[path].apiUrl;

    // 서버로 보내기 전, 값이 없는 필드(null, undefined, "")를 제거하여
    // 서버의 @RequestParam이나 DTO 바인딩 에러를 방지합니다.
    const cleanFilter = Object.entries(filterDTO).reduce((acc: any, [key, value]) => {
        if (value !== null && value !== undefined && value !== "" && value !== "null") {
            acc[key] = value;
        }
        return acc;
    }, {});

    const { data } = await api.get(`${realUrl}`, {
        params: {
            page,
            size,
            ...cleanFilter // 정제된 필터만 전송
        }
    });
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

//출근
export const checkInApi = async () => {
    await api.post("/api/hr/attendances/checkin");
};

//퇴근
export const checkOutApi = async () => {
    await api.post("/api/hr/attendances/checkout");
};

//오늘 출퇴근 조회
export const getTodayWorkApi = async () => {
    const {data} = await api.get("/api/hr/attendances/today");
    return data;
};
