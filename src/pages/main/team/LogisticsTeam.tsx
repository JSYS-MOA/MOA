import "../../../assets/styles/main/team.css";
import TeamLayout from "./TeamLayout.tsx";
import InventoryInbounds from "../../inventory/InventoryInbounds.tsx";
const LogisticsTeam = () => {
    return (
            <TeamLayout
                title="입고현황"
                linkTo="/inventory/inbounds"
            >

            </TeamLayout>
    );
};
export default LogisticsTeam;