import '../../assets/styles/layout.css';


interface HeaderMenu {
    id: number;
    name: string;
    depts: string | string[];
}

interface HeaderProps {
    user_dept: string;
    activeMenu: number; // 현재 활성화된 메뉴 번호 (스타일링용)
    onMenuClick: (menuId: number) => void; // 부모의 setActiveMenu를 실행할 함수
}



const Header = ({user_dept, onMenuClick}:HeaderProps) => {
  const menuData:HeaderMenu[] = [ // id는 메뉴 테이블의 menu_num 참고
    { id: 2, name: 'My page', depts: 'all' },
    { id: 3, name: '그룹웨어', depts: 'all' },
    { id: 4, name: '관리', depts: ['council'] },
    { id: 5, name: '인사', depts: ['HR-1', 'council'] },
    { id: 6, name: '물류', depts: ['WML-1', 'council'] },
    { id: 7, name: '영업', depts: ['ACLE-1', 'council'] },
    { id: 8, name: '기본사항', depts: 'all' },
  ];
  return (

    <header className="header">
      <div className="logo">MOA</div>
      
      <ul className="menu-List">
        {menuData.map((item) => {
            const hasAccess = item.depts === 'all' ||
                (Array.isArray(item.depts) && item.depts.includes(user_dept));

            if (!hasAccess) return null;
            return(
            (item.depts === 'all' || item.depts.includes(user_dept)) && (
                <li
                    key={item.id}
                    className="menu-Item"
                    onClick={() => onMenuClick(item.id)}
                >
                    {item.name}
                </li>
            ));
        })}
      </ul>
    </header>
  );
}

export default Header;
