"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

const getAuthErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Email atau password salah. Silakan coba lagi.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Silakan periksa email Anda.';
    case 'auth/wrong-password':
      return 'Password salah. Silakan coba lagi.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
    default:
      return 'Terjadi kesalahan. Silakan coba lagi.';
  }
};

export default function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const { user, loading, error } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      if (!email || !password) {
        setLoginError('Email dan password harus diisi');
        return;
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/BookingTable');
    } catch (error: unknown) {
      console.error('Login error:', error); // untuk debugging
      if (error && typeof error === 'object' && 'code' in error) {
        setLoginError(getAuthErrorMessage(error as AuthError));
      } else {
        setLoginError('Terjadi kesalahan yang tidak diketahui');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null; // akan di-redirect oleh useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 w-full">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Sign In
        </h2>
        {(loginError || error) && (
          <p className="text-red-500 text-sm mb-4">{loginError || error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
