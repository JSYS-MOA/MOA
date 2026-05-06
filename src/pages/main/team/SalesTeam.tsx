import "../../../assets/styles/main/team.css";
import TeamLayout from "./TeamLayout.tsx";
import {useQuery} from "@tanstack/react-query";
import type {VendorMonthly} from "../../../types/transaction.ts";
import {getMonthlyExpenseApi, getMonthlyRevenueApi} from "../../../apis/SalesService.tsx";
import {Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
const SalesTeam = () => {

    const currentMonth = new Date().getMonth() +1;

    const {data: revenue =[], refetch: refetchRevenue} = useQuery<VendorMonthly[]>({
        queryKey:["monthlyRevenue"],
        queryFn: getMonthlyRevenueApi,
    })

    const {data: expense =[], refetch: refetchExpense} = useQuery<VendorMonthly[]>({
        queryKey:["monthlyExpense"],
        queryFn: getMonthlyExpenseApi,
    })

    const chartData = Array.from({length:currentMonth}, (_,i) => ({
        month:`${i+1}월`,
        revenue: revenue.reduce((sum, v) => sum + (v.monthly[i] ?? 0),0),
        expense: expense.reduce((sum, v) => sum + (v.monthly[i] ?? 0),0),
    }));

    const handleRefresh = () => {
        void Promise.all([refetchRevenue(), refetchExpense()]);
    };

    return(
        <div className="sales-Wrapper">
            <TeamLayout
                title="월별 매입/매출 실적"
                linkTo="/sales/expense"
                onRefresh={handleRefresh}
            >
                <ResponsiveContainer width="100%" height={406} style={{marginTop:"82px", paddingBottom:"46px"}}>
                    <BarChart
                        data={chartData}
                        margin={{top: 5, right: 40, left: 0, bottom: 0}}
                        barSize={34}
                    >
                        <XAxis
                            dataKey="month"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{stroke: "rgba(169,169,169,0.3)"}}
                            padding={{left: 0, right: 0}}
                            scale="band"

                        />
                        <YAxis
                            fontSize={12}
                            tickFormatter={(v) => {
                                if (v >= 1000000000) return `${(v / 1000000000).toFixed(0)}B`;
                                if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                                if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                                return v.toString();
                            }}
                            axisLine={false}
                            tickLine={false}
                            color="#cdcdcd"
                        />
                        <Tooltip
                            formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v}
                            cursor={{fill: "#F9F9FF"}}
                            contentStyle={{width: "100px", fontSize: "12px", padding: "4px 8px",border:"none"}}
                        />
                        <Legend
                            content={(props) => {
                                const {payload} = props;
                                return (
                                    <div style={{display: "flex", gap: "22px", justifyContent: "center", fontSize: "12px"}}>
                                        {payload?.map((entry, i) => (
                                            <div key={i} style={{display: "flex", alignItems: "center", gap: "4px"}}>
                                                <div style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "2px",
                                                    background: entry.color,
                                                }}/>
                                                <span style={{color: "var(--text-secondary)"}}>{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="revenue" name="매출" fill="#5E5C77" radius={[4, 4, 0, 0]}/>
                        <Bar dataKey="expense" name="매입" fill="#D9625D" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </TeamLayout>
        </div>
    )
}
export default SalesTeam;