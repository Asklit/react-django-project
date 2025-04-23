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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('userId', response.data.user_id);
      
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Ошибка входа. Пожалуйста, попробуйте снова.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Вход</h2>
        
        <div className={styles.authForm}>
          <input
            name="email"
            type="email"
            required
            className={`${styles.authInput} ${errors.email ? styles.inputError : ''}`}
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
          
          <input
            name="password"
            type="password"
            required
            className={`${styles.authInput} ${errors.password ? styles.inputError : ''}`}
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}

          {errors.general && <span className={styles.error}>{errors.general}</span>}

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
                Вход...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </div>

        <p className={styles.authLink}>
          Нет аккаунта?{' '}
          <a href="/register" className={styles.link}>
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;