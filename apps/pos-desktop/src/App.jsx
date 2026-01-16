import React, { lazy, Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { ThemeProvider } from './context/ThemeProvider';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';
import UpdateNotification from './components/UpdateNotification';

// Lazy loading - Code Splitting
const DesktopLayout = lazy(() => import('./components/DesktopLayout'));


function App() {
  const [configChecked, setConfigChecked] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    const checkConfig = async () => {
      // Agar Electron bo'lmasa (Browser), konfiguratsiyani o'tkazib yuboramiz
      if (!window.electron) {
        setIsConfigured(true);
        setConfigChecked(true);
        return;
      }

      try {
        const settings = await window.electron.ipcRenderer.invoke('get-settings');
        if (settings && settings.restaurant_id && settings.access_key) {
          // 1. Optimistic UI: Darhol dasturni ochish
          setIsConfigured(true);
          setConfigChecked(true);

          // 2. Background Verification
          // Fon rejimida tekshirish (foydalanuvchini kutdirmaslik uchun)
          axios.get(`https://halboldi.uz/api/restaurants/${settings.restaurant_id}/verify`, {
            headers: { 'x-access-key': settings.access_key }
          }).then(() => {
            // Hammasi joyida
          }).catch(err => {
            if (err.response && err.response.status === 403) {
              // Obuna tugagan bo'lsa, bloklash
              setSubscriptionExpired(true);
              setBlockReason(err.response.data.message || "Obuna muddati tugagan.");
            } else {
              console.log("Background check error (Offline/Server):", err.message);
            }
          });
        } else {
          // Sozlamalar yo'q -> Onboarding
          setIsConfigured(false);
          setConfigChecked(true);
        }
      } catch (err) {
        console.error('Config check failed:', err);
        // Xatolik bo'lsa ham onboardingga o'tkazish xavfsizroq yoki retry qilish kerak
        setConfigChecked(true);
      }
    };

    checkConfig();
  }, []);

  if (!configChecked) return <LoadingSpinner />;

  // Onboarding va Obuna tekshiruvi olib tashlandi
  // if (subscriptionExpired) { ... }
  // if (!isConfigured) { return <Onboarding ... />; }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Asosiy Desktop ilova */}
              <Route path="/" element={<DesktopLayout />} />

              {/* Mobil Ofitsiant ilovasi */}

            </Routes>
          </Suspense>
          {/* <UpdateNotification /> - Removed by user request */}
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;