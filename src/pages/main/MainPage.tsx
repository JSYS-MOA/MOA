import {useAuthStore} from "../../stores/useAuthStore.tsx";
import MainPageLayout from "./MainPageLayout.tsx";
import HrTeam from "./team/HrTeam.tsx";
import LogisticsTeam from "./team/LogisticsTeam.tsx";
import SalesTeam from "./team/SalesTeam.tsx";

const MainPage = () => {

    const { user } = useAuthStore();

    if(user?.departmentId === 2) return <MainPageLayout><HrTeam /></MainPageLayout>
    if(user?.departmentId === 3) return <MainPageLayout><LogisticsTeam /></MainPageLayout>
    if(user?.departmentId === 4) return <MainPageLayout><SalesTeam /></MainPageLayout>

    return(
        <div>
            해당 부서의 정보가 없습니다
        </div>
        )
}
export default MainPage;