import {FaStar} from "react-icons/fa";
import Table, {type TableColumn} from "../../components/Table.tsx";
import {useQuery} from "@tanstack/react-query";
import type {VendorMonthly} from "../../types/transaction.ts";

interface MonthlyTableProps {
    title: string;
    queryKey: string;
    queryFn: () => Promise<VendorMonthly[]>;
}


const MonthlyTable = ({title, queryKey, queryFn}: MonthlyTableProps) => {

    const {data: vendors = []} = useQuery<VendorMonthly[]>({queryKey: [queryKey], queryFn});

    const totalRow: VendorMonthly = {
        vendorCode:"",
        vendorName:"합계",
        monthly:Array(12).fill(0).map((_,i) =>
            vendors.reduce((sum ,v) => sum + (v.monthly[i] ?? 0),0)
        ),
        total:vendors.reduce((sum, v) => sum + v.total, 0),
    }

    const currentMonth = new Date().getMonth() + 1;

    const columns: TableColumn<VendorMonthly>[] = [
        {key: "vendorCode", label:"거래처코드"},
        {key: "vendorName", label:"거래처명"},
        ...Array.from({length:currentMonth},(_,i) => i +1).map(m => ({
            key:`monthly_${m}` as keyof VendorMonthly,
            label: `${m}월`,
            align: "right" as const,
            render: (_: any, item: VendorMonthly) =>
                item.monthly[m-1] ? item.monthly[m-1].toLocaleString() : "-"
        })),
        {key: "total", label: "집계", render: (val) => val?.toLocaleString(),align: "right"},
        {
            key: "total" as keyof VendorMonthly,
            label: "전달대비",align: "center",
            render: (_: any, item: VendorMonthly) => {
                if (item.vendorName === "합계") return "-";
                const thisMonth = item.monthly[currentMonth - 1] ?? 0;
                const lastMonth = item.monthly[currentMonth - 2] ?? 0;
                const diff = lastMonth === 0 ? 0 : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
                return (
                    <span style={{color: diff >= 0 ? "#091B72" : "#DA5C57"}}>
                        {diff >= 0 ? "+" : ""}{diff}%
                     </span>
                );
            }
        },
    ]

  return(
      <>
          <div className="favorite-Header">
              <FaStar size={18} color="#C4C4C4"/>
              <span>{title}</span>
          </div>
          <Table
              items={[...vendors, totalRow]}
              idKey="vendorCode"
              columns={columns}
          />
      </>
  )
}
export default MonthlyTable;