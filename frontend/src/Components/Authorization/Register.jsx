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
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'Ошибка регистрации. Пожалуйста, попробуйте снова.' });
      }
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
            className={`${styles.authInput} ${errors.username ? styles.inputError : ''}`}
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.username && <span className={styles.error}>{errors.username}</span>}
          
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
          
          <select
            name="english_level"
            className={`${styles.authInput} ${errors.english_level ? styles.inputError : ''}`}
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
          {errors.english_level && <span className={styles.error}>{errors.english_level}</span>}

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