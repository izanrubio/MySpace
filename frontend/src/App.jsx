import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import AIResources from './pages/AIResources';
import Projects from './pages/Projects';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/repositories" replace />} />
        <Route path="repositories" element={<Repositories />} />
        <Route path="ai-resources" element={<AIResources />} />
        <Route path="projects" element={<Projects />} />
      </Route>
    </Routes>
  );
}

export default App;
