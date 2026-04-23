export interface LeaverTableProps {
    userId: number;
    userName: string;
    employeeId?: number | string;
    phone: string;
    email: string;
    address?: string;
    startDate: Date;
    quitDate?: Date;
    departmentId?: number;
    departmentName?: string;
    gradeId?: number;
    gradeName?: string;
    birth?: Date;
    profileUrl?:string
    performance?: string;
    bank?: string;
    accountNum?: string;
}
