import axios from "axios";
import type {Transaction} from "../types/transaction.ts";

const API = "http://localhost/api";

//전체조회
export const getTransactionsApi = async () => {
    const {data} = await axios.get(
        `${API}/sales/journals`,
        {
            withCredentials:true
        });
    return data;
};

//상세조회
export const getTransactionApi = async (transactionId: number) => {
    const {data} = await axios.get(
        `${API}/sales/journals/${transactionId}`,
        {
        withCredentials: true,
    });
    return data;
};

// 수정
export const updateTransactionApi = async (transactionId: number, request: {
    transactionPrice: number;
    transactionMemo: string;
}) => {
    const {data} = await axios.put(`
    ${API}/sales/journals/${transactionId}`, request,
        {
        withCredentials: true,
    });
    return data;
};

// 삭제
export const deleteTransactionApi = async (transactionId: number) => {
    const {data} = await axios.delete(`${API}/sales/journals/${transactionId}`,
        {
        withCredentials: true,
    });
    return data;
};

//전자세금계산서
export const getTaxInvoiceApi = async (transactionId: number) => {
    const {data} = await axios.get(`${API}/sales/journals/${transactionId}/tax-invoice`,
        {
        withCredentials: true,
    });
    return data;
};

//전자세금계산서 조회
export const getTaxInvoiceListApi = async (): Promise<Transaction[]> => {
    const {data} = await axios.get(`${API}/sales/taxInv`,
        {
        withCredentials: true,
    });
    return data;
};