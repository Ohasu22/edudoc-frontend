import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100 bg-gradient-primary">
      <div className="login-card bg-white p-5 rounded shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 className="fw-bold text-primary">EduDoc</h1>
          <p className="text-muted">Enhanced Document Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <div className="mb-3 text-start">
            <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-4 text-start">
            <label htmlFor="password" className="form-label fw-semibold">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Signing In...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center bg-light p-3 rounded">
          <p className="mb-1">
            <i className="fas fa-info-circle me-2 text-secondary"></i>
            Need an account?
          </p>
          <p className="text-muted small mb-0">Contact your system administrator for account creation.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
