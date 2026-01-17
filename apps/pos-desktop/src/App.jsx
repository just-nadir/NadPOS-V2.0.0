import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import LicenseGuard from './components/LicenseGuard'; // YANGI
import UpdateNotification from './components/UpdateNotification';

// Lazy loading - Code Splitting
const DesktopLayout = lazy(() => import('./components/DesktopLayout'));

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ErrorBoundary>
        <LicenseGuard>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Asosiy Desktop ilova */}
                <Route path="/" element={<DesktopLayout />} />

                {/* Boshqa routelar shu yerga qo'shilishi mumkin */}
              </Routes>
            </Suspense>
            {/* <UpdateNotification /> */}
          </Router>
        </LicenseGuard>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
