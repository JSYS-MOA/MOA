import "../../../assets/styles/main/team.css";
import TeamLayout from "./TeamLayout.tsx";
// import {useQuery} from "@tanstack/react-query";
// import {getHr2Data} from "../../../apis/hr2/Hr2Service.tsx";

// interface WorkRecord {
//     workId: number;
//     employeeId: string;
//     userName: string;
//     workDate: string;
//     workMemo: string;
//     allowanceName: string | null;
// }


const HrTeam = () => {

    // const { data: records = [], refetch } = useQuery<WorkRecord[]>({
    //     queryKey: ["attendances"],
    //     queryFn: () => getHr2Data("work"),
    // });
    
    // const handleRefresh = () => {
    //     void refetch();
    // }

    return(
        <TeamLayout
            title="dd"
        >

        </TeamLayout>
    )
}
export default HrTeam;