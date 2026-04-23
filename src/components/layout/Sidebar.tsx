import { useNavigate } from "react-router";
import "../../assets/styles/layout.css";
import { logoutApi } from "../../apis/LoginService.tsx";
import { useAuthStore } from "../../stores/useAuthStore.tsx";

interface MenuData {
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

interface SidebarProps {
    layoutData: MenuData;
    activeMenu: number;
}

const Sidebar = ({ layoutData, activeMenu }: SidebarProps) => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const menuItems = layoutData.menuList.filter((item) => item.menuNum === activeMenu);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("logout error", error);
        } finally {
            logout();
            navigate("/", { replace: true });
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-notification">
                <span className="icon-bell">i</span>
                <span className="notif-text">알림이 있습니다</span>
                <span className="notif-dot"></span>
            </div>

            <div className="sidebar-user-card">
                <div className="user-avatar-circle">
                    {layoutData.userName ? layoutData.userName[0] : "U"}
                </div>
                <div className="user-info-detail">
                    <div className="user-name-row">
                        <span className="u-name">{layoutData.userName}</span>
                    </div>
                    <p className="u-sub-info">
                        {layoutData.departmentName} | {layoutData.gradeName} | {layoutData.employeeId}
                    </p>
                </div>
            </div>

            <ul className="side-menu-List">
                {menuItems.map((menuItem) => (
                    <li key={menuItem.menuId} className="side-menu-Group">
                        <div
                            className="side-menu-Item group-Title is-Active"
                            onClick={() => navigate(menuItem.pagePath)}
                        >
                            {menuItem.menuTitle}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer" onClick={handleLogout}>
                <span>로그아웃</span>
                <span className="icon-logout">{">"}</span>
            </div>
        </aside>
    );
};

export default Sidebar;
