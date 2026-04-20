import HrMain from "./HrMain.tsx";
import LogisticsMain from "./LogisticsMain.tsx";
import SalesMain from "./SalesMain.tsx";
import { useAuthStore } from "../../stores/useAuthStore.tsx";

const MainPage = () => {
    const { user } = useAuthStore();

    switch (user?.departmentId) {
        case 1:
            return <HrMain />;
        case 2:
            return <SalesMain />;
        case 3:
            return <LogisticsMain />;
        default:
            return <div>해당 부서의 정보가 없습니다.</div>;
    }
};

export default MainPage;
