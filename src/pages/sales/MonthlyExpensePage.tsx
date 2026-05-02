import {getMonthlyExpenseApi} from "../../apis/SalesService.tsx";
import MonthlyTable from "./MonthlyTable.tsx";

const MonthlyExpensePage = () => (
    <MonthlyTable title="월별매입집계표" queryKey="monthlyExpense" queryFn={getMonthlyExpenseApi}/>
);
export default MonthlyExpensePage;