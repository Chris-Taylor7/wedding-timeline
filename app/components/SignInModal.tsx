'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

interface SignInModalProps {
  onSignInComplete: (organizerId: string, weddingTitle: string, isReadOnly: boolean) => void;
}

type Tab = 'login' | 'register' | 'guest';

export const SignInModal: React.FC<SignInModalProps> = ({ onSignInComplete }) => {
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weddings, setWeddings] = useState<{ id: string; title: string }[]>([]);
  const [showPin, setShowPin] = useState(false);

  // Login state
  const [pin, setPin] = useState('');

  // Register state
  const [firstName, setFirstName] = useState('');
  const [weddingTitle, setWeddingTitle] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Guest state
  const [selectedWeddingId, setSelectedWeddingId] = useState('');

  // Fetch weddings for guest view
  useEffect(() => {
    if (tab === 'guest') {
      const fetchWeddings = async () => {
        try {
          const response = await axios.get('/api/auth/weddings');
          setWeddings(response.data);
          if (response.data.length > 0) {
            setSelectedWeddingId(response.data[0].id);
          }
        } catch (err) {
          setError('Failed to load weddings');
          console.error(err);
        }
      };
      fetchWeddings();
    }
  }, [tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { pin });
      onSignInComplete(response.data.organizerId, response.data.weddingTitle, false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (!firstName.trim() || !weddingTitle.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        firstName,
        weddingTitle,
        pin: newPin,
      });
      onSignInComplete(response.data.organizerId, response.data.weddingTitle, false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId) {
      setError('Please select a wedding');
      return;
    }

    const selected = weddings.find((w) => w.id === selectedWeddingId);
    onSignInComplete(selectedWeddingId, selected?.title || 'Wedding', true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-medium ${
              tab === 'login'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-medium ${
              tab === 'register'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setTab('guest');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-medium ${
              tab === 'guest'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Guest
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Login Tab */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back</h2>
              <p className="text-gray-600 text-sm mb-4">
                Enter your PIN to access your wedding timeline
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full bg-pink-500 text-white py-2 rounded-md font-medium hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>
          )}

          {/* Register Tab */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Account</h2>
              <p className="text-gray-600 text-sm mb-4">
                Set up your wedding timeline with a secure PIN
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding Title
                </label>
                <input
                  type="text"
                  value={weddingTitle}
                  onChange={(e) => setWeddingTitle(e.target.value)}
                  placeholder="e.g., Sarah & John's Wedding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Create PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="At least 4 digits"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={loading}
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading || !firstName || !weddingTitle || !newPin || !confirmPin}
                className="w-full bg-pink-500 text-white py-2 rounded-md font-medium hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Guest Tab */}
          {tab === 'guest' && (
            <form onSubmit={handleGuestAccess} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">View Wedding Timeline</h2>
              <p className="text-gray-600 text-sm mb-4">
                Select a wedding to view the timeline (read-only)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding
                </label>
                <select
                  value={selectedWeddingId}
                  onChange={(e) => setSelectedWeddingId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {weddings.map((wedding) => (
                    <option key={wedding.id} value={wedding.id}>
                      {wedding.title}
                    </option>
                  ))}
                </select>
              </div>

              {weddings.length === 0 && (
                <div className="text-yellow-600 text-sm">No weddings available to view</div>
              )}

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading || weddings.length === 0}
                className="w-full bg-blue-500 text-white py-2 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Loading...' : 'View Timeline'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
