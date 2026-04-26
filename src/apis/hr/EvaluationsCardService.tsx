import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const PA_CARD_API_BASE = "http://localhost/api/hr/certificates";

export type EvaluationsCardRecord = {
    userId?: number;
    userName?: string | null;
    employeeId?: string | number | null;
    departmentId?: number | null;
    departmentName?: string | null;
    gradeId?: number | null;
    gradeName?: string | null;
};

export type EvaluationsCardMutationPayload = Pick<
    EvaluationsCardRecord,
    "userName" | "employeeId" | "departmentId" | "departmentName" | "gradeId" | "gradeName"
>;

const toEvaluationsCardPayload = (payload: EvaluationsCardMutationPayload): EvaluationsCardMutationPayload => ({
    userName: payload.userName,
    employeeId: payload.employeeId,
    departmentId: payload.departmentId,
    departmentName: payload.departmentName,
    gradeId: payload.gradeId,
    gradeName: payload.gradeName,
});

export function useGetEvaluationsCardList(search?: string, page?: number, size?: number) {
    return useQuery({
        queryKey: ["paCardList", search || "", page, size],
        queryFn: async () => {
            const { data } = await axios.get<EvaluationsCardRecord[]>(PA_CARD_API_BASE, {
                params: {
                    page,
                    size,
                    search: search || "",
                },
                withCredentials: true,
            });

            return data;
        },
    });
}

export function useGetEvaluationsCardInfo() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.get<EvaluationsCardRecord>(`${PA_CARD_API_BASE}/${userId}`, {
                withCredentials: true,
            });

            return data;
        },
    });
}

export function usePostEvaluationsCard() {
    return useMutation({
        mutationFn: async (payload: EvaluationsCardMutationPayload) => {
            const { data } = await axios.post(
                `${PA_CARD_API_BASE}/add`,
                toEvaluationsCardPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function usePutEvaluationsCard() {
    return useMutation({
        mutationFn: async ({
            userId,
            payload,
        }: {
            userId: number;
            payload: EvaluationsCardMutationPayload;
        }) => {
            const { data } = await axios.put(
                `${PA_CARD_API_BASE}/${userId}`,
                toEvaluationsCardPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function useDeleteEvaluationsCard() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.delete(`${PA_CARD_API_BASE}/${userId}`, {
                withCredentials: true,
            });

            return data;
        },
    });
}

export const useGetHrCardList = useGetEvaluationsCardList;
export const useGetHrCardInfo = useGetEvaluationsCardInfo;
export const usePostHrCard = usePostEvaluationsCard;
export const usePutHrCard = usePutEvaluationsCard;
export const useDeleteHrCard = useDeleteEvaluationsCard;
