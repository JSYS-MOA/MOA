export interface HrCard {
    userId?: number;
    user_id?: number;

    userName?: string;
    user_name?: string;

    employeeId?: string | number;
    employee_id?: string | number;

    password?: string | null;

    roleId?: number;
    role_id?: number;

    phone?: string | null;
    email?: string | null;
    address?: string | null;

    startDate?: string;
    start_date?: string;

    quitDate?: string | null;
    quit_date?: string | null;

    departmentId?: number;
    department_id?: number;
    departmentName?: string | null;
    department_name?: string | null;

    gradeId?: number;
    grade_id?: number;
    gradeName?: string | null;
    grade_name?: string | null;

    birth?: string | null;
    performance?: string | null;
    bank?: string | null;

    accountOwner?: string | null;
    account_owner?: string | null;

    accountNum?: string | null;
    account_num?: string | null;
}