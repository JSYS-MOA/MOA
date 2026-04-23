import { Outlet } from "react-router"
import {useState, useEffect} from "react";
import Header from "./Header.tsx"
import Sidebar from "./Sidebar.tsx";
import {layoutApi} from "../../apis/LayoutService.tsx";

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

    const [activeMenu, setActiveMenu] = useState<number | null>(null);
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

    return (
        <div className="layout-wrapper">
            <Header
                userDept={layoutData?.departmentName || ""}
                activeMenu={activeMenu || 0}
                menuList={layoutData?.menuList || []}
                onMenuClick={(id) => setActiveMenu(id)}
            />
            <div className="main-content-layout" style={{ display: 'flex', height:"100%" }}>
                {activeMenu !== null && layoutData && (
                    <Sidebar
                        activeMenu={activeMenu}
                        layoutData={layoutData}
                    />
                )}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout