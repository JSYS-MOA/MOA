import {useAuthStore} from "../../stores/useAuthStore.tsx";
import SalesMain from "./SalesMain.tsx";
import HrMain from "./HrMain.tsx";
import LogisticsMain from "./LogisticsMain.tsx";

const MainPage = () => {

    const { user } = useAuthStore();

    if(user?.departmentId === 1) return <HrMain />
    if(user?.departmentId === 3) return <LogisticsMain />
    if(user?.departmentId === 3) return <SalesMain />

    return(
        <div>
            해당 부서의 정보가 없습니다
        </div>
        )
}
export default MainPage;