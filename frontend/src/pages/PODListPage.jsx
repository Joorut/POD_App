import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const API_BASE = import.meta.env.VITE_POD_API || '';

export default function PODListPage() {
  const navigate = useNavigate();
  const user = useContext(AuthContext);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPODs();
  }, []);

  const fetchPODs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pod`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPods(response.data);
    } catch (err) {
      setError('Failed to load PODs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredPods = pods.filter((pod) => {
    if (filter === 'pending') return pod.status === 'pending';
    if (filter === 'approved') return pod.status === 'approved';
    if (filter === 'rejected') return pod.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loader...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">POD - Leveringskvitteringer</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold"
            >
              + Ny POD
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded font-semibold"
              >
                👤 Brugere
              </button>
            )}
            <span className="text-white">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold"
            >
              Log ud
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-semibold ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Alle ({pods.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded font-semibold ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Afventer ({pods.filter((p) => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded font-semibold ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Godkendt ({pods.filter((p) => p.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded font-semibold ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Afvist ({pods.filter((p) => p.status === 'rejected').length})
          </button>
        </div>

        {filteredPods.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">Ingen leveringskvitteringer fundet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPods.map((pod) => (
              <div
                key={pod.id}
                onClick={() => navigate(`/pod/${pod.id}`)}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Sag: {pod.case_number}</h2>
                    <p className="text-gray-600">Chauffør: {pod.driver_name}</p>
                    {pod.customer_name && (
                      <p className="text-gray-600">Kunde: {pod.customer_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded font-semibold text-white ${
                        pod.status === 'approved'
                          ? 'bg-green-600'
                          : pod.status === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {pod.status === 'pending'
                        ? 'Afventer'
                        : pod.status === 'approved'
                        ? 'Godkendt'
                        : 'Afvist'}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(pod.created_at).toLocaleDateString('da-DK')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
