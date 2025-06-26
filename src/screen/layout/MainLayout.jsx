import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Header from '../../component/Header';
import { useEffect } from 'react';

export default function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await localStorage.getItem('accessTokens');
      if (!user) {
        navigate('/LoginScreen');
      }
    };
    checkAuth();
  }, [navigate]);
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
