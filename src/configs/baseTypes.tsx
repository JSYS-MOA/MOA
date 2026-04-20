


export interface AdminRoleEntity {
    id:number;
    code:string;
    name:string;
    isUse:number;
}

export interface AllowanceEntity {
    allowanceId:number;
    allowanceCord:string;
    allowanceName:string;
    allowanceIsUse:number;
}

export interface ApprovalLineEntity {
    approvalLineId:number;
    approvalLineCord:string;
    approvalLineUser:number;
    approvalLineName:string;
    approvalLineIsUse:number;
}

export interface CompanyAccountEntity {
    companyAccountId:number;
    companyAccountCord:string;
    companyAccountName:string;
    companyAccountBank:string;
    companyAccountNum:number;
    companyAccountIsUse:number;
}

export interface DepartmentEntity {
    departmentId:number;
    departmentCord:string;
    departmentName:string;
    departmentIsUse:number;
}

export interface DocumentEntity {
    documentId: number;
    documentCord: string;
    documentName: string;
    documentIsUse: number;
}

export interface ProductEntity {
    productId:number;
    productCord:string;
    productName:string;
    productIsUse:number;
    productPrice:number;
    productCategory:string;
}

export interface StorageEntity {
    storageId:number;
    storageCord:string;
    storageName:string;
    storageIsUse:number;
    storageAddress:string;
}

export interface VendorEntity {
    vendorId:number;
    vendorCord:string;
    vendorName:string;
    vendorIsUse:number;
}