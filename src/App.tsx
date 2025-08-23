import './App.css'
import {Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import Header from './components/layout/Header';
import SeatSelection from './pages/SeatSelection';
import AdminLogin from './pages/Admin/AdminLogin';
import HallManager from './pages/Admin/HallManager';
import ProtectedRoute from './components/admin/ProtectedRoute';

import Background from './components/layout/Background';
import { useLocation } from 'react-router-dom';
import { useAuth } from './pages/Admin/AuthContext';
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const { isAuthenticated } = useAuth();
  return (
    <>
    <main className="main-content">
      <Background isAdmin={isAdminPage} />
      <Header />
        
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session/:seanceId" element={<SeatSelection />} />

          <Route path="/admin/login" element={ isAuthenticated ? <Navigate to="/admin/halls"/> : <AdminLogin />} />

          <Route
            path="/admin/halls"
            element={ 
              <ProtectedRoute>
                <HallManager />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
      <AppContent />    
  )
}

export default App
