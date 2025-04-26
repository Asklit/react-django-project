import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import styles from "../styles/nav.module.css";

const Nav = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [username, setUsername] = useState(null); // null indicates loading
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Функция для получения имени пользователя
  const fetchUsername = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    // Проверяем наличие токена и userId
    if (!accessToken || !userId) {
      setUsername("Гость");
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await api.get(`/users/${userId}/`);
      if (response.data && response.data.username) {
        setUsername(response.data.username);
        setIsAuthenticated(true);
      } else {
        setUsername("Гость");
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Failed to fetch username:", err);
      setUsername("Гость");
      setIsAuthenticated(false);

      // Если ошибка 401, перехватчик в api.js уже перенаправит на /login,
      // но мы дополнительно очищаем состояние
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Проверяем авторизацию и получаем username при монтировании и изменении состояния
  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]);

  // Отслеживаем изменения в localStorage (на случай логина/регистрации)
  useEffect(() => {
    const handleStorageChange = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsAuthenticated(!!accessToken);
      if (accessToken) {
        fetchUsername();
      } else {
        setUsername("Гость");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUsername]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUsername("Гость");
    setDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header>
      <div className={styles.container}>
        <div
          className={styles.title}
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleLogoClick();
            }
          }}
        >
          Title<span>TODO</span>
        </div>
        <nav>
          <ul className={styles.menu}>
            {isAuthenticated ? (
              <li className={styles.item}>
                <div className={styles.dropdown}>
                  <button
                    className={styles.link}
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    {username || "Загрузка..."} <span className={styles.caret}>▼</span>
                  </button>
                  {dropdownOpen && (
                    <ul className={styles.dropdownMenu}>
                      <li>
                        <Link to="/profile" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>
                          Профиль
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>
                          Панель администратора
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className={styles.dropdownLink}
                        >
                          Выход
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            ) : (
              <>
                <li className={styles.item}>
                  <Link to="/login" className={styles.link}>
                    Войти
                  </Link>
                </li>
                <li className={styles.item}>
                  <Link to="/register" className={styles.link}>
                    Зарегистрироваться
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Nav;