import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = ({ onLoginSuccess }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      
      if (isCreatingAccount) {
        // Create new account
        const response = await axios.post(`${API_BASE_URL}/api/users/create-account`, {
          loginId,
          password
        });

        if (response.data.success) {
          // Store token in localStorage
          localStorage.setItem('bookVibeToken', response.data.token);
          localStorage.setItem('bookVibeUser', JSON.stringify(response.data.user));
          localStorage.setItem('bookViveSessionId', response.data.user.sessionId);
          
          onLoginSuccess(response.data.user);
        }
      } else {
        // Login existing account
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
          loginId,
          password
        });

        if (response.data.success) {
          // Store token in localStorage
          localStorage.setItem('bookVibeToken', response.data.token);
          localStorage.setItem('bookVibeUser', JSON.stringify(response.data.user));
          
          // Update the session ID in the existing session storage for backward compatibility
          localStorage.setItem('bookViveSessionId', response.data.user.sessionId);
          
          onLoginSuccess(response.data.user);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || `${isCreatingAccount ? 'Account creation' : 'Login'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex flex-col justify-center p-4 py-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TBR Roulette
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {isCreatingAccount ? 'Create your personal library!' : 'Welcome back to your library!'}
          </p>
        </div>

        {/* Login/Create Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your login ID"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isCreatingAccount ? 'Creating Account...' : 'Logging in...'}
              </div>
            ) : (
              isCreatingAccount ? 'Create My Library' : 'Access My Library'
            )}
          </button>
        </form>

        {/* Toggle between login and create account */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsCreatingAccount(!isCreatingAccount);
              setError('');
            }}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            {isCreatingAccount 
              ? 'Already have an account? Sign in' 
              : 'New user? Create an account'
            }
          </button>
        </div>

        {/* Fun footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Ready to find your next great read? 📖✨</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
