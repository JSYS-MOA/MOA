import axios from "axios";

const API = "http://localhost/api";

//전체조회
export const getTransactionsApi = async () => {
    const {data} = await axios.get(
        `${API}/sales/journals`,
        {withCredentials:true});
    return data;
};

//상세조회
export const getTransactionApi = async (transactionId: number) => {
    const {data} = await axios.get(`${API}/sales/journals/${transactionId}`, {
        withCredentials: true,
    });
    return data;
};

// 수정
export const updateTransactionApi = async (transactionId: number, request: {
    transactionPrice: number;
    transactionMemo: string;
}) => {
    const {data} = await axios.put(`${API}/sales/journals/${transactionId}`, request, {
        withCredentials: true,
    });
    return data;
};

// 삭제
export const deleteTransactionApi = async (transactionId: number) => {
    const {data} = await axios.delete(`${API}/sales/journals/${transactionId}`, {
        withCredentials: true,
    });
    return data;
};