import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Restaurants from './pages/Restaurants';
import Payments from './pages/Payments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="payments" element={<Payments />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
