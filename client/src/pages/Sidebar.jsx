import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import booksIcon from '../assets/books.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    window.location.href = '/';
  };

  const menuItems = [
    { 
      name: 'Library', 
      path: '/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> 
    },
    { 
      name: 'Upload', 
      path: '/upload',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> 
    }
  ];

  return (
    <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar}/>
    )}

    <div className={`fixed top-0 left-0 h-full w-52 md:w-64 lg:w-72 bg-[#A5978B] z-50 transition-transform duration-300 transform
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen`}>
      <div className="p-5 font-bold text-xl flex flex-row justify-center items-center">
        <p className='!text-[#5A2A27]'>KoboSync</p>
        <button onClick={toggleSidebar} className="md:hidden font-bold text-[#5C4742]">✕</button>
      </div>
      <nav className='flex flex-col gap-2 px-3'>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div  key={item.name} onClick={() => {navigate(item.path); if (isOpen) toggleSidebar(); }}
              className={`flex flex-row gap-3 items-center cursor-pointer px-3 py-2 rounded-lg font-bold transition-all
                ${isActive 
                  ? 'bg-[#8D5B4C] text-[#e7dfd5]' 
                  : 'text-[#5A2A27] hover:bg-[#8D5B4C]/20 hover:text-white'
                }
              `}>
              <span className={isActive ? 'text-[#ddd6cd]' : 'text-[#5A2A27]'}>
                {item.icon}
              </span>
              {item.name}
            </div>
          );
        })}
      </nav>

      <div className='flex justify-center p-3 bottom-0 absolute w-full'>
        <button onClick={logout} className='text-[#5A2A27] border-none hover:border-none hover:text-white'>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;