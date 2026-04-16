export interface HrTableProps {
    user_id: number;
    userName: string;
    employeeId?: number;
    phone: string;
    email: string;
    address?: string;
    startDate: Date;
    quitDate?: Date;
    departmentId: number;
    gradeId: number;
    birth?: Date;
    performance?: string;
    bank?: string;
    accountNum?: string;
}
