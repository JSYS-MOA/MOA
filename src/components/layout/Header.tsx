import "../../assets/styles/layout.css";

interface HeaderProps {
    menuList: Array<{
        menuId: number;
        menuTitle: string;
        menuNum: number;
    }>;
    userDept: string;
    activeMenu: number;
    onMenuClick: (menuId: number) => void;
}

const Header = ({ menuList, userDept: _userDept, activeMenu: _activeMenu, onMenuClick }: HeaderProps) => {
    if (!menuList || menuList.length === 0) {
        return <header>로딩 중...</header>;
    }

    const menuData: Record<number, string> = {
        2: "My page",
        3: "Groupware",
        4: "Admin",
        5: "HR",
        6: "Logistics",
        7: "Sales",
        8: "Base",
    };

    const uniqueMenuList = menuList.filter(
        (item, index, self) => index === self.findIndex((target) => target.menuNum === item.menuNum)
    );

    return (
        <header className="header-container">
            <div className="header-logo">MOA</div>
            <ul className="header-nav">
                {uniqueMenuList.map((item) => (
                    <li
                        key={item.menuId}
                        className="header-nav-item"
                        onClick={() => onMenuClick(item.menuNum)}
                    >
                        {menuData[item.menuNum] ?? item.menuTitle}
                    </li>
                ))}
            </ul>
        </header>
    );
};

export default Header;
