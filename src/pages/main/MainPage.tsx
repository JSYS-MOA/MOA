import {useAuthStore} from "../../stores/useAuthStore.tsx";
import MainPageLayout from "./MainPageLayout.tsx";
import HrTeam from "./team/HrTeam.tsx";
import LogisticsTeam from "./team/LogisticsTeam.tsx";
import SalesTeam from "./team/SalesTeam.tsx";

const MainPage = () => {

    const { user } = useAuthStore();

    if(user?.departmentId === 2 || user?.departmentId === 1) return <MainPageLayout><HrTeam /></MainPageLayout>
    if(user?.departmentId === 3) return <MainPageLayout><LogisticsTeam /></MainPageLayout>
    if(user?.departmentId === 4) return <MainPageLayout><SalesTeam /></MainPageLayout>

    return(
        <div>
            해당 부서의 정보가 없습니다
        </div>
        )
}
export default MainPage;

// import {useEffect, useState} from "react";
// import {useAuthStore} from "../../stores/useAuthStore.tsx";
// import MainPageLayout from "./MainPageLayout.tsx";
// import HrTeam from "./team/HrTeam.tsx";
// import LogisticsTeam from "./team/LogisticsTeam.tsx";
// import SalesTeam from "./team/SalesTeam.tsx";
// import Header from "../../components/layout/Header.tsx";
// import {layoutApi} from "../../apis/LayoutService.tsx";
//
// const MainPage = () => {
//
//     const {user} = useAuthStore();
//     const [activeMenu, setActiveMenu] = useState<number | null>(null);
//     const [layoutData, setLayoutData] = useState<any>();
//
//     useEffect(() => {
//         const init = async () => {
//             try {
//                 const data = await layoutApi();
//                 setLayoutData(data);
//                 console.log("레이아웃 데이터 로딩 완료", data);
//             } catch (error) {
//                 console.error("레이아웃 데이터 로딩 실패:", error);
//             }
//         };
//         init();
//     }, []);
//
//     const header = (
//         <Header
//             userDept={layoutData?.departmentName || ""}
//             activeMenu={activeMenu || 0}
//             menuList={layoutData?.menuList || []}
//             onMenuClick={(id) => setActiveMenu(id)}
//         />
//     );
//
//     if (user?.departmentId === 2 || user?.departmentId === 1) return (
//         <>{header}<MainPageLayout><HrTeam /></MainPageLayout></>
//     )
//     if (user?.departmentId === 3) return (
//         <>{header}<MainPageLayout><LogisticsTeam /></MainPageLayout></>
//     )
//     if (user?.departmentId === 4) return (
//         <>{header}<MainPageLayout><SalesTeam /></MainPageLayout></>
//     )
//
//     return (
//         <>
//             {header}
//             <div><p>해당 부서의 정보가 없습니다</p></div>
//         </>
//     )
// }
// export default MainPage;