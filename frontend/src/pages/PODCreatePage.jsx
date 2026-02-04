import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const API_BASE = import.meta.env.VITE_POD_API || 'http://localhost:8001';

export default function PODCreatePage() {
  const navigate = useNavigate();
  const user = useContext(AuthContext);
  const [formData, setFormData] = useState({
    case_number: '',
    driver_name: user?.full_name || '',
    foreman_name: '',
    customer_name: '',
    notes: '',
    photo_paths: [],
    signature_path: '',
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    const response = await axios.post(`${API_BASE}/api/pod/upload`, formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.path;
  };

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const photoPaths = [];
      for (const photo of photos) {
        const path = await uploadFile(photo);
        photoPaths.push(path);
      }

      const payload = {
        ...formData,
        photo_paths: photoPaths,
      };

      await axios.post(`${API_BASE}/api/pod`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      navigate('/list');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create POD');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Ny Leveringskvittering</h1>
          <button
            onClick={() => navigate('/list')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Tilbage
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sagsnummer *</label>
                <input
                  type="text"
                  required
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="F.eks. SAG-2024-001"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Chauffør *</label>
                <input
                  type="text"
                  required
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Chauffør navn"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Formand</label>
                <input
                  type="text"
                  value={formData.foreman_name}
                  onChange={(e) => setFormData({ ...formData, foreman_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Formand navn"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Kunde</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Kunde navn"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Bemærkninger</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Eventuelle bemærkninger"
                rows="4"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Fotos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {photos.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">{photos.length} foto(er) valgt</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Sender...' : 'Opret Leveringskvittering'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/list')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
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
