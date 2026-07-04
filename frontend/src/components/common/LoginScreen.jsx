import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SignupScreen from './SignupScreen';
import { GoogleLogin } from '@react-oauth/google';
import ApiService from '../../services/api';

const LoginScreen = () => {
  const { login } = useAuth();
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password, userType);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (showSignup) {
    return <SignupScreen onSwitchToLogin={() => setShowSignup(false)} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #E8A33D 100%)' }}
    >
      <div className="bg-cream-card rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-display font-semibold text-center mb-2" style={{ color: '#6B4A63' }}>
          Eventora
        </h1>
        <p className="text-center text-ink-muted mb-8">College Communities Hub</p>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setUserType('student')} 
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              userType === 'student' ? 'text-white' : 'bg-cream-dim text-ink-muted'
            }`}
            style={userType === 'student' ? { background: '#6B4A63' } : {}}
          >
            Student
          </button>
          <button 
            onClick={() => setUserType('admin')} 
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              userType === 'admin' ? 'text-white' : 'bg-cream-dim text-ink-muted'
            }`}
            style={userType === 'admin' ? { background: '#D8A13A' } : {}}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder={userType === 'student' ? 'College Email' : 'Club Email'}
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300" 
          />
          
          <input 
            type="password" 
            placeholder="Password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300" 
          />
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #D8A13A 100%)' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        {userType === 'student' && (
          <div className="mt-6 text-center">
            <p className="text-ink-muted mb-3">Don't have an account?</p>
            <button
              onClick={() => setShowSignup(true)}
              className="w-full py-3 rounded-xl font-semibold text-white transition mb-3"
              style={{ background: 'linear-gradient(135deg, #7A9B76 0%, #D8A13A 100%)' }}
            >
              Create Account
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-cream-dim" />
              <span className="text-ink-faint text-sm">or</span>
              <div className="flex-1 h-px bg-cream-dim" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  setError('');
                  try {
                    const response = await ApiService.googleAuth(credentialResponse.credential);
                    const { token, ...userData } = response.data.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    window.location.reload();
                  } catch (err) {
                    setError(err.response?.data?.message || 'Google login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => setError('Google login failed')}
                text="continue_with"
                shape="rectangular"
                theme="outline"
                width="300"
              />
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default LoginScreen;