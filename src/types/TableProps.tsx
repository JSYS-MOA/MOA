export interface TableProps {
  userId? : string;
  employeeId?: string;
  userName? : string;
  gradeId? : string;
  gradeName? : string;
  phone? : string;
  email? : string;
  roleId? : string;
  storageName : string;
  productPrice: string;
  productName: string;
  productCord: string;
  inventorySno: string;
}

export interface Column {
  key: keyof TableProps;
  label: string;
}