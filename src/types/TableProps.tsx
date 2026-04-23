export interface TableProps {

  [key: string]: any;

  employeeId?: string;
  userName : string;

  //adminEntity
  id:number;
  code:string;
  name:string;
  isUse:number;

  //AllowanceEntity
  allowanceId:number;
  allowanceCord:string;
  allowanceName:string;
  allowanceIsUse:number;

  //ApprovalLineEntity
  approvalLineId:number;
  approvalLineCord:string;
  approvalLineUser:number;
  approvalLineName:string;
  approvalLineIsUse:number;

  //CompanyAccountEntity
  companyAccountId:number;
  companyAccountCord:string;
  companyAccountName:string;
  companyAccountBank:string;
  companyAccountNum:number;
  companyAccountIsUse:number;

  //DepartmentEntity
  departmentId:number;
  departmentCord:string;
  departmentName:string;
  departmentIsUse:number;

  //DocumentEntity
  documentId: number;
  documentCord: string;
  documentName: string;
  documentIsUse: number;

  //ProductEntity
  productId:number;
  productCord:string;
  productName:string;
  productIsUse:number;
  productPrice:number;
  productCategory:string;

  //StorageEntity
  storageId:number;
  storageCord:string;
  storageName:string;
  storageIsUse:number;
  storageAddress:string;

  //VendorEntity
  vendorId:number;
  vendorCord:string;
  vendorName:string;
  vendorIsUse:number;

}
