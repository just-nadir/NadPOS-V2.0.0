import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import RestaurantDashboard from './pages/restaurant/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Universal Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Super Admin Routes (Siz) */}
          <Route path="/admin" element={
            <PrivateRoute role="super_admin">
              <Layout role="super_admin" />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Restaurant Admin Routes (Mijoz) */}
          <Route path="/dashboard" element={
            <PrivateRoute role="admin">
              <Layout role="admin" />
            </PrivateRoute>
          }>
            <Route index element={<RestaurantDashboard />} />
            <Route path="sales" element={<h1 className="text-white p-8">Savdolar</h1>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
