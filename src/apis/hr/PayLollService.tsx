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
    transaction_created_at?: string;
    transaction_updated_at?: string;

    transfe_created_at?: string;
    transfe_updated_at?: string;

    salary_ledger_created_at?: string;
    salary_ledger_updated_at?: string;

    salary_created_at?: string;
    salary_updated_at?: string;
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

    transaction_created_at?: string;
    transaction_updated_at?: string;

    vendor_created_at?: string;
    vendor_updated_at?: string;

    transfe_created_at?: string;
    transfe_updated_at?: string;

    salary_ledger_created_at?: string;
    salary_ledger_updated_at?: string;

    salary_created_at?: string;
    salary_updated_at?: string;
};

const toUserEntityPayload = (payload: PayRollMutationPayload) => {
    const userEntityPayload: Record<string, unknown> = { ...payload };

    delete userEntityPayload.departmentName;
    delete userEntityPayload.gradeName;
    delete userEntityPayload.accountOwner;

    return userEntityPayload;
};

// 급여시즌 목록 조회
export function useGetPayRollList(search?: string, page?: number, size?: number) {
    return useQuery<PayRollRecord[]>({
        queryKey: ["PayRollList", search || "", page, size],
        queryFn: async () => {
            if (page !== undefined || size !== undefined) {
                const { data } = await axios.get<{ content?: PayRollRecord[] }>(
                    `${API_BASE}/page`,
                    {
                        params: {
                            ...(page !== undefined ? { page } : {}),
                            ...(size !== undefined ? { size } : {}),
                        },
                        withCredentials: true,
                    }
                );

                return Array.isArray(data?.content) ? data.content : [];
            }

            const { data } = await axios.get<PayRollRecord[] | { message?: string }>(
                API_BASE,
                {
                    withCredentials: true,
                }
            );

            if (Array.isArray(data)) {
                return data;
            }

            return [];
        },
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
