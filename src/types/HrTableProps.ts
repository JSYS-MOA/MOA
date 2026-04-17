export interface HrTableProps {
    userId: number;
    userName: string;
    employeeId?: string;
    phone: string;
    email: string;
    address?: string;
    startDate: Date;
    quitDate?: Date;
    departmentName: string;
    gradeName: string;
    birth?: Date;
    performance?: string;
    bank?: string;
    accountNum?: string;
}
