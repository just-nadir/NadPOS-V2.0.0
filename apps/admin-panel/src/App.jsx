import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

import Restaurants from './pages/Restaurants';

// Placeholder pages for now
const Payments = () => <div className="p-8 text-2xl font-bold text-gray-800">To'lovlar Tarixi (Tez kunda)</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
