import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const CERTIFICATES_CARD_API_BASE = "http://localhost/api/hr/certificates";

export type CertificatesCardRecord = {
    userId?: number;
    userName?: string | null;
    employeeId?: string | number | null;
    departmentId?: number | null;
    departmentName?: string | null;
    gradeId?: number | null;
    gradeName?: string | null;
};

export type CertificatesCardMutationPayload = Pick<
    CertificatesCardRecord,
    "userName" | "employeeId" | "departmentId" | "departmentName" | "gradeId" | "gradeName"
>;

const toCertificatesCardPayload = (
    payload: CertificatesCardMutationPayload
): CertificatesCardMutationPayload => ({
    userName: payload.userName,
    employeeId: payload.employeeId,
    departmentId: payload.departmentId,
    departmentName: payload.departmentName,
    gradeId: payload.gradeId,
    gradeName: payload.gradeName,
});

export function useGetCertificatesCardList(search?: string, page?: number, size?: number) {
    return useQuery({
        queryKey: ["certificatesCardList", search || "", page, size],
        queryFn: async () => {
            const { data } = await axios.get<CertificatesCardRecord[]>(
                CERTIFICATES_CARD_API_BASE,
                {
                    params: {
                        page,
                        size,
                        search: search || "",
                    },
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function useGetCertificatesCardInfo() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.get<CertificatesCardRecord>(
                `${CERTIFICATES_CARD_API_BASE}/${userId}`,
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function usePostCertificatesCard() {
    return useMutation({
        mutationFn: async (payload: CertificatesCardMutationPayload) => {
            const { data } = await axios.post(
                `${CERTIFICATES_CARD_API_BASE}/add`,
                toCertificatesCardPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function usePutCertificatesCard() {
    return useMutation({
        mutationFn: async ({
            userId,
            payload,
        }: {
            userId: number;
            payload: CertificatesCardMutationPayload;
        }) => {
            const { data } = await axios.put(
                `${CERTIFICATES_CARD_API_BASE}/${userId}`,
                toCertificatesCardPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function useDeleteCertificatesCard() {
    return useMutation({
        mutationFn: async (userId: number) => {
            const { data } = await axios.delete(
                `${CERTIFICATES_CARD_API_BASE}/${userId}`,
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export const useGetHrCardList = useGetCertificatesCardList;
export const useGetHrCardInfo = useGetCertificatesCardInfo;
export const usePostHrCard = usePostCertificatesCard;
export const usePutHrCard = usePutCertificatesCard;
export const useDeleteHrCard = useDeleteCertificatesCard;
