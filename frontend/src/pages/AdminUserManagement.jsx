import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_POD_API || '';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'worker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Bruger "${formData.username}" oprettet!`);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'worker'
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Kunne ikke oprette bruger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin - Brugeradministration</h1>
          <button
            onClick={() => navigate('/list')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
          >
            Tilbage til POD Liste
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Opret Ny Bruger</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Brugernavn *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Indtast brugernavn"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Indtast email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Fulde Navn *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Indtast fulde navn"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Adgangskode *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Indtast adgangskode"
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 tegn</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rolle *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="worker">Chauffør (Worker)</option>
                <option value="foreman">Formand (Foreman)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Opretter...' : 'Opret Bruger'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/list')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Annuller
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
