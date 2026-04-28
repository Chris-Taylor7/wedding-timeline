'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { Loader } from './Loader';

interface SignInModalProps {
  onSignInComplete: (organizerId: string, weddingTitle: string, isReadOnly: boolean) => void;
}

type Tab = 'login' | 'register' | 'guest';

export const SignInModal: React.FC<SignInModalProps> = ({ onSignInComplete }) => {
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weddings, setWeddings] = useState<{ id: string; weddingTitle: string }[]>([]);
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
      setTimeout(() => {
        onSignInComplete(response.data.organizerId, response.data.weddingTitle, false);
      }, 600);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid PIN');
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
      setTimeout(() => {
        onSignInComplete(response.data.organizerId, response.data.weddingTitle, false);
      }, 600);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
    setTimeout(() => {
      onSignInComplete(selectedWeddingId, selected?.weddingTitle || 'Wedding', true);
    }, 600);
  };

  if (loading) {
    return <Loader message={tab === 'login' ? 'Signing in...' : tab === 'register' ? 'Creating account...' : 'Loading timeline...'} />;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#fdfd96]/20 to-[#ffb7b2]/20 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-white to-[#faf9f6] rounded-3xl shadow-2xl w-full max-w-md border-2 border-[#e5e5e5] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ffb7b2] to-[#ffdac1] px-6 py-8 text-center">
          <div className="flex justify-center mb-3">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Wedding Timeline</h1>
          <p className="text-white/90 text-sm font-medium">Plan your perfect day</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-[#e5e5e5] bg-white">
          <button
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 ${
              tab === 'login'
                ? 'border-b-4 border-[#ffb7b2] text-[#ffb7b2] bg-[#fff9f9]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 ${
              tab === 'register'
                ? 'border-b-4 border-[#cbaacb] text-[#cbaacb] bg-[#faf8fb]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setTab('guest');
              setError('');
            }}
            className={`flex-1 py-3 px-4 font-semibold transition-all duration-300 ${
              tab === 'guest'
                ? 'border-b-4 border-[#a2b5a4] text-[#a2b5a4] bg-[#f8faf8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Wedding Guest
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[380px] animate-fade-in">
          {/* Login Tab */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Enter your PIN to access your wedding timeline</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    className="w-full px-4 py-3 text-black placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffb7b2] focus:ring-2 focus:ring-[#ffb7b2]/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full bg-gradient-to-r from-[#ffb7b2] to-[#ffdac1] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Tab */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
                <p className="text-gray-600 text-sm">Set up your wedding timeline with a secure PIN</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-4 py-3 text-black placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wedding Title
                </label>
                <input
                  type="text"
                  value={weddingTitle}
                  onChange={(e) => setWeddingTitle(e.target.value)}
                  placeholder="e.g., Sarah & John's Wedding"
                  className="w-full px-4 py-3 text-black placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Create PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="At least 4 digits"
                  className="w-full px-4 py-3 text-black placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  className="w-full px-4 py-3 text-black placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !firstName || !weddingTitle || !newPin || !confirmPin}
                className="w-full bg-gradient-to-r from-[#cbaacb] to-[#a2b5a4] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Guest Tab */}
          {tab === 'guest' && (
            <form onSubmit={handleGuestAccess} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">View Wedding Timeline</h2>
                <p className="text-gray-600 text-sm">Select a wedding to view the timeline (read-only)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wedding
                </label>
                <select
                  value={selectedWeddingId}
                  onChange={(e) => setSelectedWeddingId(e.target.value)}
                  className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#a2b5a4] focus:ring-2 focus:ring-[#a2b5a4]/20 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                >
                  <option value="">Select a wedding...</option>
                  {weddings.map((wedding) => (
                    <option key={wedding.id} value={wedding.id} className="text-black">
                      {wedding.weddingTitle}
                    </option>
                  ))}
                </select>
              </div>

              {weddings.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm font-medium">
                  ✨ No weddings available to view at the moment.
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || weddings.length === 0 || !selectedWeddingId}
                className="w-full bg-gradient-to-r from-[#a2b5a4] to-[#fdfd96] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loading ? 'Loading...' : 'View Timeline'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-in;
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
