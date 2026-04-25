import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/hr/cards";

type HrCardMutationPayload = {
    userName?: string;
    employeeId?: string | number;
    password?: string;
    phone?: string;
    email?: string;
    address?: string;
    startDate?: string;
    quitDate?: string | null;
    roleId?: number;
    departmentId?: number;
    departmentName?: string;
    gradeId?: number;
    gradeName?: string;
    birth?: string;
    performance?: string;
    bank?: string;
    accountNum?: string;
    accountOwner?: string;
};

const toUserEntityPayload = (payload: HrCardMutationPayload) => {
    const {
        departmentName,
        gradeName,
        accountOwner,
        ...userEntityPayload
    } = payload;

    return userEntityPayload;
};

// 인사카드 목록 조회
export function useGetHrCardList(search?: string, page?: number, size?: number) {
    return useQuery({
        queryKey: ["hrCardList", search || "", page, size],
        queryFn: async () => {
            const { data } = await axios.get(`${Api_BASE}`, {
                params: {
                    page: page,
                    size: size,
                    search: search || "",
                },
                withCredentials: true,
            });

            return data;
        },
    });
}

// 인사카드 상세 조회
export function useGetHrCardInfo() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.get(`${Api_BASE}/${userId}`, {
                withCredentials: true,
            });

            return data;
        },
    });
}

// 인사카드 추가
export function usePostHrCard() {
    return useMutation({
        mutationFn: async (payload: HrCardMutationPayload) => {
            const { data } = await axios.post(
                `${Api_BASE}/add`,
                toUserEntityPayload(payload),
                {
                withCredentials: true,
                }
            );

            return data;
        },
    });
}

// 인사카드 수정
export function usePutHrCard() {
    return useMutation({
        mutationFn: async ({
                               userId,
                               payload,
                           }: {
            userId: number;
            payload: HrCardMutationPayload;
        }) => {
            const { data } = await axios.put(`${Api_BASE}/${userId}`, toUserEntityPayload(payload), {
                withCredentials: true,
            });

            return data;
        },
    });
}

// 인사카드 삭제
export function useDeleteHrCard() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.delete(`${Api_BASE}/${userId}`, {
                withCredentials: true,
            });

            return data;
        },
    });
}
