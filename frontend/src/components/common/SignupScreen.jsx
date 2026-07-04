import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SignupScreen = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Credentials

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.name) {
      setError('Please fill in all fields');
      return false;
    }

    if (!formData.email.endsWith('@iiitdwd.ac.in')) {
      setError('Please use your IIIT Dharwad email (@iiitdwd.ac.in)');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
    setError('');
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    const result = await register({
      email: formData.email,
      username: formData.username,
      name: formData.name,
      password: formData.password,
      userType: 'student'
    });

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #E8A33D 100%)' }}
    >
      <div className="bg-cream-card rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-display font-semibold text-center mb-2" style={{ color: '#6B4A63' }}>
          Eventora
        </h1>
        <p className="text-center text-ink-muted mb-6">Join Our College Community</p>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          <div
            className={`h-1 flex-1 rounded-full transition ${
              step >= 1 ? 'bg-plum-500' : 'bg-cream-dim'
            }`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition ${
              step >= 2 ? 'bg-plum-500' : 'bg-cream-dim'
            }`}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                placeholder="yourname@iiitdwd.ac.in"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300"
              />
              <p className="text-xs text-ink-muted mt-1">Must be an IIIT Dharwad email</p>
            </div>

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 transition mt-6"
              style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #D8A13A 100%)' }}
            >
              Next Step
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose your username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300"
              />
              <p className="text-xs text-ink-muted mt-1">
                3-20 characters, letters/numbers/underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300"
              />
              <p className="text-xs text-ink-muted mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-4 border-2 border-cream-dim rounded-xl focus:outline-none focus:border-plum-300"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex-1 py-4 rounded-xl font-semibold text-ink-soft bg-cream-dim hover:bg-plum-50 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 transition"
                style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #D8A13A 100%)' }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}

        {/* Switch to Login */}
        <div className="mt-6 text-center text-sm text-ink-muted">
          <p>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold hover:underline"
              style={{ color: '#6B4A63' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;
