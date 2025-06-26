import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const menuItems = [
  { name: 'Beranda', path: '/HomeScreen/DashboardScreen', icon: '🏠' },
  { name: 'Arisan', path: '/HomeScreen/ArisanScreen', icon: '🤝' },
  { name: 'Patungan', path: '/HomeScreen/PatunganScreen', icon: '💰' },
  { name: 'Pengguna', path: '/HomeScreen/UserScreen', icon: '👥' },
  {
    name: 'Pengaturan',
    icon: '⚙️',
    children: [
      { name: 'Event', path: '/HomeScreen/BannerScreen' },
      // { name: 'Setting', path: '/HomeScreen/SettingScreen' },
      { name: 'Galeri Gambar', path: '/HomeScreen/GaleryScreen' },
    ],
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white shadow fixed top-0 left-0 overflow-y-auto">
      <div className="p-4 text-2xl font-bold text-purple-600">BERES</div>
      <nav className="flex flex-col space-y-2 p-4">
        {menuItems.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.name] || item.children.some(child => isActivePath(child.path));
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded hover:bg-purple-100 'text-gray-700'`}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="pl-8 mt-1 space-y-1">
                    {item.children.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block px-2 py-1 rounded hover:bg-purple-100 ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-600'
                          }`
                        }
                      >
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded hover:bg-purple-100 ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
