import React, { useState, useRef, useEffect } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Hapus token dan arahkan ke login (atau sesuaikan dengan routing)
    localStorage.removeItem('accessTokens');
    window.location.href = '/'; // atau navigate('/LoginScreen') jika pakai react-router
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center fixed left-64 right-0 top-0 z-10">
      <h1 className="text-lg font-bold">Admin Panel</h1>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <span>Hi Admin</span>
          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center">
            HW
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-20">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
