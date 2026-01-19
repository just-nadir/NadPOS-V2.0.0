import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Restaurants from './pages/Restaurants';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Payments from './pages/Payments';
import GlobalManagement from './pages/GlobalManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<Logs />} />
            <Route path="payments" element={<Payments />} />
            <Route path="global-management" element={<GlobalManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
