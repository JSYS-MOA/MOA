export interface Transaction{
    transactionId: number;
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    orderformId: number;
    salaryLedgerId: number;
    transactionNum: number;
    transactionType: string;
    transactionPrice: number;
    transactionMemo: string | null;
    createdAt: string;
}

export interface TransactionForm {
    transactionNum: number;
    transactionType: string;
    vendorCode: string;
    vendorName: string;
    transactionPrice: number;
    transactionMemo: string;
}