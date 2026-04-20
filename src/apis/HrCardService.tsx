import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = "http://localhost/api/hr/cards";

type HrCardApiResponse = {
    userId?: number;
    userName?: string;
    employeeId?: number;
    phone?: string;
    email?: string;
    address?: string;
    startDate?: string;
    quitDate?: string | null;
    departmentId?: number;
    departmentName?: string | null;
    gradeId?: number;
    gradeName?: string | null;
    birth?: string | null;
    performance?: string;
    bank?: string;
    accountNum?: string;
    user_id?: number;
    user_name?: string;
    employee_id?: number;
    start_date?: string;
    quit_date?: string | null;
    department_id?: number;
    department_name?: string | null;
    grade_id?: number;
    grade_name?: string | null;
    account_num?: string;
};

export type HrCard = {
    user_id: number;
    user_name: string;
    employee_id?: number;
    phone?: string;
    email?: string;
    address?: string;
    start_date: string;
    quit_date?: string | null;
    department_id?: number;
    department_name?: string | null;
    grade_id?: number;
    grade_name?: string | null;
    birth?: string | null;
    performance?: string;
    bank?: string;
    account_num?: string;
};

const normalizeHrCard = (card: HrCardApiResponse): HrCard => {
    return {
        user_id: card.user_id ?? card.userId ?? 0,
        user_name: card.user_name ?? card.userName ?? "",
        employee_id: card.employee_id ?? card.employeeId,
        phone: card.phone,
        email: card.email,
        address: card.address,
        start_date: card.start_date ?? card.startDate ?? "",
        quit_date: card.quit_date ?? card.quitDate ?? null,
        department_id: card.department_id ?? card.departmentId,
        department_name: card.department_name ?? card.departmentName ?? null,
        grade_id: card.grade_id ?? card.gradeId,
        grade_name: card.grade_name ?? card.gradeName ?? null,
        birth: card.birth ?? null,
        performance: card.performance,
        bank: card.bank,
        account_num: card.account_num ?? card.accountNum,
    };
};

const extractHrCards = (payload: unknown): HrCard[] => {
    if (Array.isArray(payload)) {
        return payload.map((card) => normalizeHrCard(card as HrCardApiResponse));
    }

    if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        Array.isArray((payload as { data?: unknown }).data)
    ) {
        return (payload as { data: HrCardApiResponse[] }).data.map(normalizeHrCard);
    }

    return [];
};

export function useHrCardList() {
    return useQuery({
        queryKey: ["hrCardList"],
        queryFn: async () => {
            const { data } = await axios.get(API, {
                withCredentials: true,
            });

            return extractHrCards(data);
        },
    });
}
