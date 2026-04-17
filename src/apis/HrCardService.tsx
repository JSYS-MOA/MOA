import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const API_BASE = "http://localhost/api/hr/cards";

export interface HrCard {
    userId: number;
    userName: string;
    employeeId: string;
    password: string;
    roleId: number;
    phone: string | null;
    email: string | null;
    address: string | null;
    startDate: string;
    quitDate: string | null;
    departmentId: number;
    departmentName?: string | null;
    gradeId: number;
    gradeName?: string | null;
    birth: string | null;
    performance: string | null;
    profileUrl: string | null;
    bank: string | null;
    accountNum: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

type ApiErrorResponse = {
    message?: string;
};

const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
        const responseData = error.response?.data;

        if (typeof responseData === "string") {
            return responseData;
        }

        if (responseData && typeof responseData === "object" && "message" in responseData) {
            return (responseData as ApiErrorResponse).message ?? error.message;
        }

        return error.message;
    }

    return "알 수 없는 오류가 발생했습니다.";
};

export function useHrCardList() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["hrCardList"],
        queryFn: () =>
            axios.get<HrCard[]>(API_BASE, {
                withCredentials: true,
            }).then((r) => r.data),
    });

    return { data, isLoading, isError };
}

export function useHrCardInfo(userId: number) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["hrCardInfo", userId],
        queryFn: () =>
            axios.get<HrCard>(`${API_BASE}/${userId}`, {
                withCredentials: true,
            }).then((r) => r.data),
        enabled: !!userId,
    });

    return { data, isLoading, isError };
}

export function useHrCardAdd() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Partial<HrCard>) => {
            const response = await axios.post(API_BASE, request, {
                withCredentials: true,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            console.log("인사카드 추가 성공");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("인사카드 추가 실패:", getErrorMessage(error));
        },
    });
}

export function useHrCardUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            request,
        }: {
            userId: number;
            request: Partial<HrCard>;
        }) => {
            const response = await axios.put(`${API_BASE}/${userId}`, request, {
                withCredentials: true,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            queryClient.invalidateQueries({ queryKey: ["hrCardInfo", variables.userId] });
            console.log("인사카드 수정 성공");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("인사카드 수정 실패:", getErrorMessage(error));
        },
    });
}

export function useHrCardDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: number) => {
            const response = await axios.delete(`${API_BASE}/${userId}`, {
                withCredentials: true,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            console.log("인사카드 삭제 성공");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("인사카드 삭제 실패:", getErrorMessage(error));
        },
    });
}
