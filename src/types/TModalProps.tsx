export interface ModalProps {
  userId? : string;
  employeeId?: string;
  userName? : string;
  gradeId? : string;
  phone? : string;
  email? : string;
  roleId? : string;
  storageName : string;
  productPrice: string;
  productName: string;
  productCord: string;
  inventorySno: string;
  defectSno : string;
  orderSno : Number;
  unitPrice : Number;
}

export interface MColumn {
  key: keyof ModalProps;
  label: string;
}