import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "/api/hr/payroll";

export type PayRollRecord = {

    //거래
    transaction_id: number;
    transactionId: number;

    vendor_id:number;
    vendorId:number;

    orderform_id:number | null;
    orderformId:number | null;

    salary_ledger_id:number | null;
    salaryLedgerId:number | null;

    transaction_num:number;
    transactionNum:number;

    transaction_type:string;
    transactionType:string;

    transaction_price:string;
    transactionPrice:string;

    transaction_memo:string;
    transactionMemo:string;

    //거래처
    vendor_cord:string | null;
    vendorCord:string | null;

    vendor_name:string | null;
    vendorName:string | null;

    vendor_is_use:string | null;
    vendorIsUse:string | null;

    //임금 지불 현황
    user_id?: number;
    userId?: number;

    transfer_id:number;
    transferId:number;

    salary_status:string | null;
    salaryStatus:string | null;

    //기본급
    salary_id:number;
    salaryId:number;

    base_pay:number;
    basePay:number;

    //급여장부
    bank_transfer_id:number;
    bankTransferId:number;

    salary_date:number | null;
    salaryDate:number | null;

    salary_amount:number | null;
    salaryAmount:number | null;

    overtime_allowance?: number | null;
    overtimeAllowance?: number | null;

    weekend_allowance?: number | null;
    weekendAllowance?: number | null;

    annual_allowance?: number | null;
    annualAllowance?: number | null;

    //사용자
    user_name:string | null;
    userName:string | null;
    employee_id:string | null;
    employeeId:string | null;
    department_id:number;
    departmentId:number;
    grade_id:number;
    gradeId:number;
    bank:string | null;
    account_num:string | null;

    //부서
    gradeName:string;

    //직급
    departmentName:string;



    //명칭이 비슷한 컬럼
    transaction_created_at?: string | null;
    transaction_updated_at?: string | null;

    transfe_created_at?: string | null;
    transfe_updated_at?: string | null;

    salary_ledger_created_at?: string | null;
    salary_ledger_updated_at?: string | null;

    salary_created_at?: string | null;
    salary_updated_at?: string | null;
};


export type PayRollMutationPayload = {


    transactionId: number;
    vendorId:number;
    salary_ledgerId:number | null;
    transactionNum:number;
    transactionType:string;
    transactionPrice:string;
    transactionMemo:string;
    vendorCord:string | null;
    vendorName:string | null;
    vendorIsUse:string | null;
    userId?: number;
    transferId:number;
    salaryStatus:string | null;
    salaryId:number;
    basePay:number;
    bankTransferId:number;
    salaryDate:number | null;
    salaryAmount:number | null;

    userName:string | null;
    employeeId:string | null;
    departmentId:number;
    gradeId:number;
    bank:string | null;
    account_num:string | null;

    //급여 종류
    allowanceId:number;

    allowanceCord:string;

    allowanceName:string;

    
    //부서
    gradeName:string;

    //직급
    departmentName:string;

    transaction_created_at?: string | null;
    transaction_updated_at?: string | null;

    vendor_created_at?: string | null;
    vendor_updated_at?: string | null;

    transfe_created_at?: string | null;
    transfe_updated_at?: string | null;

    salary_ledger_created_at?: string | null;
    salary_ledger_updated_at?: string | null;

    salary_created_at?: string | null;
    salary_updated_at?: string | null;
};

export type PayRollDateMutationPayload = {
    transactionId?: number;
    vendorId?: number;
    salaryLedgerId?: number | null;
    transactionNum?: number;
    transactionType?: string;
    transactionPrice?: number;
    transactionMemo?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
};

const toUserEntityPayload = (payload: PayRollMutationPayload) => {
    const userEntityPayload: Record<string, unknown> = { ...payload };

    delete userEntityPayload.departmentName;
    delete userEntityPayload.gradeName;
    delete userEntityPayload.accountOwner;

    return userEntityPayload;
};

const getStringValue = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }

    return "";
};

const getNumberValue = (record: Record<string, unknown>, ...keys: string[]) => {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value.replaceAll(",", ""));

            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return 0;
};

const toCancelConfirmPayload = (record: PayRollRecord) => {
    const item = record as PayRollRecord & Record<string, unknown>;
    const salaryLedgerId = getNumberValue(item, "salaryLedgerId", "salary_ledger_id");

    return {
        transactionId: getNumberValue(item, "transactionId", "transaction_id"),
        vendorId: getNumberValue(item, "vendorId", "vendor_id"),
        salaryLedgerId,
        salary_ledgerId: salaryLedgerId,
        orderformId: getNumberValue(item, "orderformId", "orderform_id") || null,
        transactionNum: getNumberValue(item, "transactionNum", "transaction_num"),
        transactionType: getStringValue(item, "transactionType", "transaction_type"),
        transactionPrice: getStringValue(item, "transactionPrice", "transaction_price"),
        transactionMemo: getStringValue(item, "transactionMemo", "transaction_memo"),
        vendorCord: getStringValue(item, "vendorCord", "vendor_cord") || null,
        vendorName: getStringValue(item, "vendorName", "vendor_name") || null,
        vendorIsUse: getStringValue(item, "vendorIsUse", "vendor_is_use") || null,
        userId: getNumberValue(item, "userId", "user_id"),
        transferId: getNumberValue(item, "transferId", "transfer_id"),
        salaryStatus: getStringValue(item, "salaryStatus", "salary_status") || null,
        salaryId: getNumberValue(item, "salaryId", "salary_id"),
        basePay: getNumberValue(item, "basePay", "base_pay"),
        bankTransferId: getNumberValue(item, "bankTransferId", "bank_transfer_id"),
        updatedAt: null,
        updated_at: null,
        transaction_updated_at: null,
        salary_ledger_updated_at: null,
        salary_updated_at: null,
        salaryDate: getNumberValue(item, "salaryDate", "salary_date") || null,
        salaryAmount: getNumberValue(item, "salaryAmount", "salary_amount"),
        overtimeAllowance: getNumberValue(item, "overtimeAllowance", "overtime_allowance"),
        weekendAllowance: getNumberValue(item, "weekendAllowance", "weekend_allowance"),
        annualAllowance: getNumberValue(item, "annualAllowance", "annual_allowance"),
        userName: getStringValue(item, "userName", "user_name") || null,
        employeeId: getStringValue(item, "employeeId", "employee_id") || null,
        departmentId: getNumberValue(item, "departmentId", "department_id"),
        gradeId: getNumberValue(item, "gradeId", "grade_id"),
        bank: getStringValue(item, "bank") || null,
        account_num: getStringValue(item, "account_num", "accountNum") || null,
        allowanceId: getNumberValue(item, "allowanceId", "allowance_id"),
        allowanceCord: getStringValue(item, "allowanceCord", "allowance_cord"),
        allowanceName: getStringValue(item, "allowanceName", "allowance_name"),
        gradeName: getStringValue(item, "gradeName", "grade_name"),
        departmentName: getStringValue(item, "departmentName", "department_name"),
    };
};

// 급여시즌 목록 조회
export function useGetPayRollList(search?: string, page = 0, size = 1000) {
    return useQuery<PayRollRecord[]>({
        queryKey: ["PayRollList", search || "", page, size],
        queryFn: async () => {
            let data: PayRollRecord[] | { content?: PayRollRecord[] };

            try {
                const response = await axios.get<PayRollRecord[] | { content?: PayRollRecord[] }>(
                    `${API_BASE}/page`,
                    {
                        params: {
                            page,
                            size,
                            search: search || "",
                        },
                        withCredentials: true,
                    }
                );

                data = response.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 500) {
                    return [];
                }

                throw error;
            }

            if (Array.isArray(data)) {
                return data;
            }

            return Array.isArray(data?.content) ? data.content : [];
        },
        retry: false,
    });
}

// 급여시즌 상세 조회
export function useGetPayRollInfo() {
    return useMutation({
        mutationFn: async (salaryLedgerId: number) => {
            const { data } = await axios.get<PayRollRecord>(
                `${API_BASE}/${salaryLedgerId}`,
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

// 급여시즌 추가
export function usePostPayRollRecord() {
    return useMutation({
        mutationFn: async (payload: PayRollMutationPayload) => {
            const { data } = await axios.post(
                `${API_BASE}/add`,
                toUserEntityPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

// 급여시즌 수정
export function usePutPayRoll() {
    return useMutation({
        mutationFn: async ({
                               salaryLedgerId,
                               payload,
                           }: {
            salaryLedgerId: number;
            payload: PayRollMutationPayload;
        }) => {
            const { data } = await axios.put(
                `${API_BASE}/${salaryLedgerId}`,
                toUserEntityPayload(payload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

// 급여시즌 삭제
export function useCancelPayRollConfirm() {
    return useMutation({
        mutationFn: async ({
                               salaryLedgerId,
                               payload,
                           }: {
            salaryLedgerId: number;
            payload: PayRollRecord;
        }) => {
            const { data } = await axios.put(
                `${API_BASE}/${salaryLedgerId}`,
                toUserEntityPayload(toCancelConfirmPayload(payload) as PayRollMutationPayload),
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function useConfirmPayRollCreatedAt() {
    return useMutation({
        mutationFn: async ({
                               transactionId,
                               payload,
                           }: {
            transactionId: number;
            payload: PayRollDateMutationPayload;
        }) => {
            const { data } = await axios.put(
                `${API_BASE}/${transactionId}`,
                payload,
                {
                    withCredentials: true,
                }
            );

            return data;
        },
    });
}

export function useDeletePayRoll() {
    return useMutation({
        mutationFn: async (salaryLedgerId: number) => {
            const { data } = await axios.delete(`${API_BASE}/${salaryLedgerId}`, {
                withCredentials: true,
            });

            return data;
        },
    });
}
