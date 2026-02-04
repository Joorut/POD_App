import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PODCreatePage from './pages/PODCreatePage';
import PODListPage from './pages/PODListPage';
import PODDetailPage from './pages/PODDetailPage';
import LoginPage from './pages/LoginPage';

const API_BASE = import.meta.env.VITE_POD_API || 'http://localhost:8001';

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
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Kunne ikke gemme')
      const record = await res.json()
      setStatus(`Gemt POD #${record.id}`)
    } catch (e) {
      setStatus('Fejl ved gem')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 20, fontFamily: 'Arial' }}>
      <h1>POD - Leveringskvittering</h1>

      <div style={{ display: 'grid', gap: 10 }}>
        <input placeholder="Sags nr" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} />
        <input placeholder="Chauffør / Pakkemester" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
        <input placeholder="Formand" value={foremanName} onChange={(e) => setForemanName(e.target.value)} />
        <input placeholder="Kunde" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <textarea placeholder="Noter" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <label>
          Billeder
          <input type="file" multiple onChange={(e) => setPhotos(Array.from(e.target.files))} />
        </label>

        <label>
          Signatur (upload som fil)
          <input type="file" onChange={(e) => setSignature(e.target.files[0])} />
        </label>

        <button onClick={handleSubmit} style={{ padding: 12, background: '#1e40af', color: '#fff', border: 0 }}>
          Gem POD
        </button>

        {status && <div>{status}</div>}
      </div>
    </div>
  )
}
