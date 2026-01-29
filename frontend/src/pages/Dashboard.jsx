import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
