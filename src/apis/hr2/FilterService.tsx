import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/",
    withCredentials: true,
});

export const getFilterSearch = async (type: string, keyword: string) => {

    const { data } = await api.get("/api/filter/search", {
        params: { type, keyword }
    });
    return data; // FilterKeywordDTO 리스트
};