import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/auth.module.css'; // Создадим отдельный файл стилей

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    english_level: 'A1'
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
      const response = await api.post('register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password, // Изменено с password_hash на password
        english_level: formData.english_level
      });
  
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('userId', response.data.user_id);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Create Account</h2>
        
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            required
            className={styles.authInput}
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          
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
          
          <select
            name="english_level"
            className={styles.authInput}
            value={formData.english_level}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficiency</option>
          </select>

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
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className={styles.authLink}>
          Already have an account?{' '}
          <a href="/login" className={styles.link}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;