import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import PODCreatePage from './pages/PODCreatePage';
import PODListPage from './pages/PODListPage';
import PODDetailPage from './pages/PODDetailPage';
import LoginPage from './pages/LoginPage';

const API_BASE = import.meta.env.VITE_POD_API || '';

// Auth context
export const AuthContext = React.createContext(null);

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <PODCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list"
          element={
            <ProtectedRoute>
              <PODListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pod/:podId"
          element={
            <ProtectedRoute>
              <PODDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/list" />} />
        <Route path="*" element={<Navigate to="/list" />} />
      </Routes>
    </Router>
  );
}

export default App;
