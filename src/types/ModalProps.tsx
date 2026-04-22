export interface ModalProps {
  '' : string; 
  userId? : number;
  employeeId?: string;
  userName? : string;
  gradeId? : number;
  phone? : string;
  email? : string;
  roleId? : number;
  inventorySno: string;
  defectSno : string;
  orderSno : number;

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

  // order
  orderformId : number;
  orderformDate : string;
  unitPrice : number;
  totalPrice : number;
  stockInDate : string;

  //logistics
  logisticDate : string;
  logisticSno : number;
  expirationDate : string;
  incoming: number;
  outgoing: number;
  logisticsType : string;
  logisticsPrice : number;
  totallogisticsPrice : number;
  totalordersPrice : number;
  orderStatus : string;

  ordererId : number;

  keySno : any
  keyPrice : any
}

export interface MColumn {
  key: keyof ModalProps;
  label: string;
}