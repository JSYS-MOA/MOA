import '../assets/styles/header.css';

const Header = ({user_dept}) => {
  const menuData = [
    { id: 1, name: '인사', depts: ['HR-1', 'council'] },
    { id: 2, name: '물류', depts: ['WML-1', 'council'] },
    { id: 3, name: '영업', depts: ['ACLE-1', 'council'] },
    { id: 4, name: '관리', depts: ['council'] },
    { id: 5, name: '기본사항', depts: 'all' },
    { id: 6, name: '그룹웨어', depts: 'all' },
    { id: 7, name: 'My page', depts: 'all' },
  ];
  return (

    <header className="header-container">
      <div className="logo">MOA</div>
      
      <ul className="menu-List">
        {menuData.map((item) => (
          (item.depts === 'all' || item.depts.includes(user_dept)) && (
            <li key={item.id} className="menu-Item">
              {item.name}
            </li>
          )
        ))}
      </ul>
    </header>
  )
}

export default Header;
