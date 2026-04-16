import { Outlet } from "react-router"
import {useState, useEffect} from "react";
import Header from "./Header.tsx"
import Sidebar from "./Sidebar.tsx";
import axios from "axios";



const MainLayout = () => {

    const [activeMenu, setActiveMenu] = useState<number | null>(null);

// [1] 백엔드에서 받아온 데이터를 담을 상태
    const [menuDataFromDB, setMenuDataFromDB] = useState<any[]>([]);
    const [userDept, setUserDept] = useState<number | null>(null);

    // 1️ sessionStorage 값 초기 세팅 (무조건 useEffect)
    useEffect(() => {
        const saved = sessionStorage.getItem("user_dept");

        if (saved) {
            setUserDept(parseInt(saved, 10));
        } else {
            setUserDept(5); // 기본값
        }
    }, []);
    // 2️ 백엔드 데이터 호출
    useEffect(() => {

        const getInitData = async () => {
            try {
                const menuRes = await axios.get("/api/auth/layout", {
                    params: {
                        employeeId: sessionStorage.getItem("employee_id")
                    }
                });

                // LayoutDTO 전체라고 가정
                setMenuDataFromDB(menuRes.data.menuList);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            }
        };

        getInitData();
    }, []);


  return (
    <div className="layout-wrapper">
      <Header
          user_dept={userDept ?? 0}
          activeMenu={activeMenu || 0}
          onMenuClick={(id) => setActiveMenu(id)}
      />
      <div className="main-content-layout" style={{ display: 'flex' }}>
          {/* 2. 사이드바: 메뉴가 선택됐을 때만 나타나고 데이터 전달 */}
          {activeMenu !== null && (
              <Sidebar
                  activeMenu={activeMenu}
                  menuDataFromDB={menuDataFromDB}
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

