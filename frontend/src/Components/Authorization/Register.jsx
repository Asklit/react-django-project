import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    english_level: 'A1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        english_level: formData.english_level,
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('userId', response.data.user_id);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Регистрация</h2>
        
        <div className={styles.authForm}>
          <input
            name="username"
            type="text"
            required
            className={styles.authInput}
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          
          <input
            name="email"
            type="email"
            required
            className={styles.authInput}
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          
          <input
            name="password"
            type="password"
            required
            className={styles.authInput}
            placeholder="Пароль"
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
            <option value="A1">A1 - Начальный</option>
            <option value="A2">A2 - Элементарный</option>
            <option value="B1">B1 - Средний</option>
            <option value="B2">B2 - Выше среднего</option>
            <option value="C1">C1 - Продвинутый</option>
            <option value="C2">C2 - Профессиональный</option>
          </select>

          {error && (
            <span className={styles.error}>
              {typeof error === 'object' ? JSON.stringify(error) : error}
            </span>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${styles.authButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <span className={styles.loadingContent}>
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" />
                </svg>
                Регистрация...
              </span>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </div>

        <p className={styles.authLink}>
          Уже есть аккаунт?{' '}
          <a href="/login" className={styles.link}>
            Войти
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;