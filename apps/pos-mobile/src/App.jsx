import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage';
import ProtectedRoute from './components/ProtectedRoute';

import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SocketProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Tables />
                  </ProtectedRoute>
                } />
                <Route path="/menu/:tableId" element={
                  <ProtectedRoute>
                    <Menu />
                  </ProtectedRoute>
                } />
                <Route path="/cart/:tableId" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                {/* Cart page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
