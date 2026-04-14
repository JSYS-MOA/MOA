import '../assets/styles/header.css';

const Header = ({user_dept, onMenuClick}) => {
  const menuData = [ // id는 메뉴 테이블의 menu_num 참고
    { id: 5, name: '인사', depts: ['HR-1', 'council'] },
    { id: 6, name: '물류', depts: ['WML-1', 'council'] },
    { id: 7, name: '영업', depts: ['ACLE-1', 'council'] },
    { id: 4, name: '관리', depts: ['council'] },
    { id: 8, name: '기본사항', depts: 'all' },
    { id: 3, name: '그룹웨어', depts: 'all' },
    { id: 2, name: 'My page', depts: 'all' },
  ];
  return (

    <header className="header">
      <div className="logo">MOA</div>
      
      <ul className="menu-List">
        {menuData.map((item) => (
          (item.depts === 'all' || item.depts.includes(user_dept)) && (
            <li key={item.id} 
                className="menu-Item"
                onClick={onMenuClick(item.depts)}
            >
              {item.name}
            </li>
          )
        ))}
      </ul>
    </header>
  )
}

export default Header;
