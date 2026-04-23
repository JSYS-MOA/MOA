import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API = "http://localhost/api/hr/cards";

const GRADE_NAME_BY_ID: Record<number, string> = {
    1: "사장",
    2: "부사장",
    3: "상무",
    4: "부장",
    5: "과장",
    6: "대리",
    7: "사원",
};

type RawHrCard = {
    user_id?: number;
    userId?: number;
    user_name?: string;
    userName?: string;
    employee_id?: number | string;
    employeeId?: number | string;
    password?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    start_date?: string | null;
    startDate?: string | null;
    quit_date?: string | null;
    quitDate?: string | null;
    role_id?: number;
    roleId?: number;
    department_id?: number;
    departmentId?: number;
    department_name?: string | null;
    departmentName?: string | null;
    grade_id?: number;
    gradeId?: number;
    grade_name?: string | null;
    gradeName?: string | null;
    birth?: string | null;
    performance?: string | null;
    bank?: string | null;
    account_num?: string | null;
    accountNum?: string | null;
    account_owner?: string | null;
    accountOwner?: string | null;
    profile_url?: string | null;
    profileUrl?: string | null;
};

export interface HrCard {
    userId: number;
    userName: string;
    employeeId: string;
    password?: string;
    phone: string | null;
    email: string | null;
    address?: string | null;
    startDate: string;
    quitDate?: string | null;
    roleId?: number;
    departmentId: number;
    departmentName?: string | null;
    gradeId: number;
    gradeName?: string | null;
    birth?: string | null;
    performance?: string | null;
    bank?: string | null;
    accountNum?: string | null;
    accountOwner?: string | null;
    profileUrl?: string | null;
}

export type HrCardRequest = Partial<HrCard>;
export type HrCardUpdateRequest = Partial<HrCard>;

const getRawValue = (card: RawHrCard, ...keys: Array<keyof RawHrCard>) => {
    for (const key of keys) {
        const value = card[key];

        if (value !== undefined) {
            return value;
        }
    }

    return undefined;
};

const getNumberValue = (card: RawHrCard, ...keys: Array<keyof RawHrCard>) => {
    const value = getRawValue(card, ...keys);

    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return undefined;
};

const getStringValue = (card: RawHrCard, ...keys: Array<keyof RawHrCard>) => {
    const value = getRawValue(card, ...keys);

    if (value === undefined || value === null) {
        return undefined;
    }

    return String(value).trim();
};

const getNullableStringValue = (card: RawHrCard, ...keys: Array<keyof RawHrCard>) => {
    const value = getRawValue(card, ...keys);

    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    return String(value).trim();
};

const toNumericIfPossible = (value: string | number) => {
    if (typeof value === "number") {
        return value;
    }

    const trimmed = value.trim();
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : trimmed;
};

const normalizeHrCard = (card: RawHrCard): HrCard => {
    const gradeId = getNumberValue(card, "gradeId", "grade_id") ?? 0;

    return {
        userId: getNumberValue(card, "userId", "user_id") ?? 0,
        userName: getStringValue(card, "userName", "user_name") ?? "",
        employeeId: getStringValue(card, "employeeId", "employee_id") ?? "",
        password: getStringValue(card, "password"),
        phone: getStringValue(card, "phone") ?? "",
        email: getStringValue(card, "email") ?? "",
        address: getNullableStringValue(card, "address"),
        startDate: getStringValue(card, "startDate", "start_date") ?? "",
        quitDate: getNullableStringValue(card, "quitDate", "quit_date"),
        roleId: getNumberValue(card, "roleId", "role_id"),
        departmentId: getNumberValue(card, "departmentId", "department_id") ?? 0,
        departmentName: getNullableStringValue(card, "departmentName", "department_name"),
        gradeId,
        gradeName:
            getNullableStringValue(card, "gradeName", "grade_name") ??
            GRADE_NAME_BY_ID[gradeId] ??
            null,
        birth: getNullableStringValue(card, "birth"),
        performance: getNullableStringValue(card, "performance"),
        bank: getNullableStringValue(card, "bank"),
        accountNum: getNullableStringValue(card, "accountNum", "account_num"),
        accountOwner: getNullableStringValue(card, "accountOwner", "account_owner"),
        profileUrl: getNullableStringValue(card, "profileUrl", "profile_url"),
    };
};

const serializeHrCard = (card: Partial<HrCard>) => {
    const payload: Record<string, unknown> = {};

    const assign = (key: string, value: unknown) => {
        if (value !== undefined) {
            payload[key] = value;
        }
    };

    assign("user_id", card.userId);
    assign("user_name", card.userName);
    assign(
        "employee_id",
        card.employeeId === undefined ? undefined : toNumericIfPossible(card.employeeId)
    );
    assign("password", card.password);
    assign("phone", card.phone);
    assign("email", card.email);
    assign("address", card.address);
    assign("start_date", card.startDate);
    assign("quit_date", card.quitDate);
    assign("role_id", card.roleId);
    assign("department_id", card.departmentId);
    assign("department_name", card.departmentName);
    assign("grade_id", card.gradeId);
    assign("grade_name", card.gradeName);
    assign("birth", card.birth);
    assign("performance", card.performance);
    assign("bank", card.bank);
    assign("account_num", card.accountNum);
    assign("account_owner", card.accountOwner);
    assign("profile_url", card.profileUrl);

    return payload;
};

export async function getHrCardListApi() {
    const { data } = await axios.get<RawHrCard[]>(API, {
        withCredentials: true,
    });

    return (data ?? []).map(normalizeHrCard);
}

export async function getHrCardInfoApi(userId: number) {
    const { data } = await axios.get<RawHrCard>(`${API}/${userId}`, {
        withCredentials: true,
    });

    return normalizeHrCard(data ?? {});
}

export async function addHrCardApi(request: Partial<HrCard>) {
    const { data } = await axios.post<RawHrCard>(API, serializeHrCard(request), {
        withCredentials: true,
    });

    return normalizeHrCard(data ?? {});
}

export async function updateHrCardApi(userId: number, request: HrCardUpdateRequest) {
    const { data } = await axios.put<RawHrCard>(`${API}/${userId}`, serializeHrCard(request), {
        withCredentials: true,
    });

    return normalizeHrCard(data ?? {});
}

export async function deleteHrCardApi(userId: number) {
    const { data } = await axios.delete(`${API}/${userId}`, {
        withCredentials: true,
    });

    return data;
}

export function useHrCardList() {
    return useQuery<HrCard[]>({
        queryKey: ["hrCardList"],
        queryFn: getHrCardListApi,
    });
}

export function useHrCardInfo(userId: number) {
    return useQuery<HrCard>({
        queryKey: ["hrCardInfo", userId],
        queryFn: () => getHrCardInfoApi(userId),
        enabled: !!userId,
    });
}

export function useHrCardAdd() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: Partial<HrCard>) => addHrCardApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
        },
    });
}

export function useHrCardUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            request,
        }: {
            userId: number;
            request: HrCardUpdateRequest;
        }) => updateHrCardApi(userId, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
            queryClient.invalidateQueries({
                queryKey: ["hrCardInfo", variables.userId],
            });
        },
    });
}

export function useHrCardDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => deleteHrCardApi(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hrCardList"] });
        },
    });
}
