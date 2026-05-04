export interface HrTableProps {
    userId: number;
    user_id?: number;
    userName: string;
    employeeId?: string | number;
    phone: string;
    email: string;
    address?: string;
    startDate: Date;
    quitDate?: Date;
    departmentId: number;
    departmentName: string;
    gradeId: number;
    gradeName: string;
    birth?: Date;
    performance?: string;
    bank?: string;
    accountNum?: string;
}

export type CertificatesTableProps = HrTableProps;
