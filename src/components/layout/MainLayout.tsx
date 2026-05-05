import {Outlet, useNavigate} from "react-router"
import {useState, useEffect} from "react";
import Header from "./Header.tsx"
import Sidebar from "./Sidebar.tsx";
import {layoutApi} from "../../apis/LayoutService.tsx";
import CalendarAlarm from "../../pages/mypage/CalendarAlarm.tsx";

interface LayoutData {
    userName: string;
    employeeId: string;
    departmentName: string;
    gradeName: string;
    menuList: {
        menuId: number;
        menuTitle: string;
        menuNum: number;
        pagePath: string;
    }[];
}

const MainLayout = () => {

    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = useState<number>(1);
    const [layoutData, setLayoutData] = useState<LayoutData>();

// [2] 백엔드 데이터 호출 (세션 방식)
    useEffect(() => {
        const init = async () => {
            try {
                const data = await layoutApi();
                setLayoutData(data);
                console.log("레이아웃 데이터 로딩 완료", data);
            } catch (error) {
                console.error("레이아웃 데이터 로딩 실패:", error);
            }
        };
        init();
    }, []);

    const handleMenuClick = (menuNum: number) => {
        setActiveMenu(menuNum);

        const paths: Record<number, string> = {
            1: '/home',
            2: '/my/profile',
            3: '/gw/approvals',
            4: '/admin/levels',
            5: '/hr/cards',
            6: '/inventory/status',
            7: '/sales/journals',
            8: '/base/form'

        };

        navigate(paths[menuNum] || '/home');
    };


    return (
        <div className="layout-wrapper">
            <Header
                userDept={layoutData?.departmentName || ""}
                activeMenu={activeMenu || 0}
                menuList={layoutData?.menuList || []}
                onMenuClick={handleMenuClick}
            />

            <div className="main-content-layout" style={{ display: 'flex', height:"100%" }}>
                {activeMenu !== null && activeMenu !== 1 && layoutData && (
                    <Sidebar
                        activeMenu={activeMenu}
                        layoutData={layoutData}
                    />
                )}
                <main className="main">
                    <Outlet />
                </main>
                
            </div>
            <CalendarAlarm/>
        </div>
    )
}

export default MainLayout