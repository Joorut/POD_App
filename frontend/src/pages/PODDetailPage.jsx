import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const API_BASE = import.meta.env.VITE_POD_API || '';

export default function PODDetailPage() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const user = useContext(AuthContext);
  const [pod, setPod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPOD();
  }, [podId]);

  const fetchPOD = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pod/${podId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPod(response.data);
    } catch (err) {
      setError('Failed to load POD');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/pod/${podId}/approve`,
        { status: 'approved', approval_notes: approveNotes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/list');
    } catch (err) {
      setError('Failed to approve POD');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/pod/${podId}/approve`,
        { status: 'rejected', approval_notes: approveNotes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/list');
    } catch (err) {
      setError('Failed to reject POD');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pod/${podId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `POD_${pod.case_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loader...</p>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/list')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-6"
          >
            Tilbage
          </button>
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">Leveringskvittering ikke fundet</p>
          </div>
        </div>
      </div>
    );
  }

  const canApprove = user?.role === 'foreman' || user?.role === 'admin';
  const isCreator = pod.driver_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/list')}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-6"
        >
          Tilbage til liste
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sag: {pod.case_number}</h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded font-semibold text-white ${
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
            </div>
            <button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Chauffør</h3>
              <p className="text-lg text-gray-800">{pod.driver_name}</p>
            </div>
            {pod.foreman_name && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Formand</h3>
                <p className="text-lg text-gray-800">{pod.foreman_name}</p>
              </div>
            )}
            {pod.customer_name && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Kunde</h3>
                <p className="text-lg text-gray-800">{pod.customer_name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Oprettet</h3>
              <p className="text-lg text-gray-800">
                {new Date(pod.created_at).toLocaleDateString('da-DK')}
              </p>
            </div>
          </div>

          {pod.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Bemærkninger</h3>
              <p className="text-gray-800">{pod.notes}</p>
            </div>
          )}

          {pod.photo_paths && pod.photo_paths.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Fotos</h3>
              <div className="grid grid-cols-3 gap-4">
                {pod.photo_paths.map((path, idx) => (
                  <img
                    key={idx}
                    src={path}
                    alt="POD photo"
                    className="rounded shadow object-cover h-40"
                  />
                ))}
              </div>
            </div>
          )}

          {pod.signature_path && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Signatur</h3>
              <img
                src={pod.signature_path}
                alt="Signature"
                className="border border-gray-300 rounded p-2 h-32"
              />
            </div>
          )}

          {canApprove && pod.status === 'pending' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Godkendelse</h3>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Bemærkninger</label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Eventuelle bemærkninger til godkendelsen"
                  rows="3"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {actionLoading ? 'Behandler...' : '✓ Godkend'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {actionLoading ? 'Behandler...' : '✗ Afvis'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
