import {getMonthlyRevenueApi} from "../../apis/SalesService.tsx";
import MonthlyTable from "./MonthlyTable.tsx";

const MonthlyRevenuePage = () => (
    <MonthlyTable title="월별매출집계표" queryKey="monthlyRevenue" queryFn={getMonthlyRevenueApi}/>
);

export default MonthlyRevenuePage;