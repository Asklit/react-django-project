import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await api.post('login/', {
        email: formData.email,
        password: formData.password, // Должно быть password
      });
  
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('userId', response.data.user_id);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Sign In</h2>
        
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            required
            className={styles.authInput}
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          
          <input
            name="password"
            type="password"
            required
            className={styles.authInput}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          {error && (
            <span className={styles.error}>
              {typeof error === 'object' ? JSON.stringify(error) : error}
            </span>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${styles.authButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <span className={styles.loadingContent}>
                <svg
                  className={styles.spinner}
                  viewBox="0 0 24 24"
                >
                  <circle
                    className={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className={styles.authLink}>
          Don't have an account?{' '}
          <a href="/register" className={styles.link}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;