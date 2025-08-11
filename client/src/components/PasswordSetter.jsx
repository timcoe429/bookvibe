import React, { useState } from 'react';
import axios from 'axios';

const PasswordSetter = () => {
  const [loginId, setLoginId] = useState('CarlyFries');
  const [password, setPassword] = useState('SamGusLegos');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
      const response = await axios.post(`${API_BASE_URL}/api/users/debug/set-password`, {
        loginId,
        password
      });

      if (response.data.success) {
        setResult(`✅ Success! Password set for ${loginId}. Book count: ${response.data.user.bookCount}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.response?.data?.error || 'Failed to set password'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Set Password
          </h1>
          <p className="text-gray-600 mt-2">Admin tool to set user passwords</p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login ID
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter login ID"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          {result && (
            <div className={`rounded-lg p-3 text-sm ${
              result.includes('Success') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {result}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting Password...
              </div>
            ) : (
              'Set Password'
            )}
          </button>
        </form>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>This will set the password for an existing user 🔐</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetter;
