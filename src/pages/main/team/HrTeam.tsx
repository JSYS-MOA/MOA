import "../../../assets/styles/main/team.css";
// import TeamLayout from "./TeamLayout.tsx";
// import {useQuery} from "@tanstack/react-query";
// import {getHr2Data} from "../../../apis/hr2/Hr2Service.tsx";
// import {hr2Configs} from "../../../types/hr2Configs.tsx";
// import Table, {type TableColumn} from "../../../components/Table.tsx";
//
// interface WorkRecord {
//     workId: number;
//     employeeId: string;
//     userName: string;
//     workDate: string;
//     workMemo: string;
//     allowanceName: string | null;
// }


const HrTeam = () => {

    // const config = hr2Configs.approvalWait;
    //
    // const {data = [], refetch} = useQuery({
    //     queryKey: ["approvalWait"],
    //     queryFn: () => getHr2Data("approvalWait"),
    // });
    //
    // const columns: TableColumn<any>[] = config.columns.map(col => ({
    //     key: col.key,
    //     label: col.label,
    //     render: col.render ? (val: any) => col.render!(val) : undefined,
    // }));

    return (
        <div className="team-Wrapper">
            {/*<TeamLayout*/}
            {/*    title="근태관리"*/}
            {/*    inkTo="/base/approvalWait"l*/}
            {/*    onRefresh={() => void refetch()}*/}
            {/*>*/}
            {/*    <Table*/}
            {/*        items={Array.isArray(data) ? data : data.content ?? []}*/}
            {/*        idKey={config.idKey}*/}
            {/*        columns={columns}*/}
            {/*        className="mainPage-Table"*/}
            {/*        wrapperStyle={{overflowX: "auto"}}*/}
            {/*    />*/}
            {/*</TeamLayout>*/}
        </div>
    );
};
export default HrTeam;