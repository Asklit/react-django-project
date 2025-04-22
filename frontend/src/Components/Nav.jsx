import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import styles from "../styles/nav.module.css";

const Nav = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const [username, setUsername] = useState("Пользователь");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch username when authenticated
  useEffect(() => {
    const fetchUsername = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await api.get(`users/${userId}/`);
          setUsername(response.data.username || "Пользователь");
        } catch (err) {
          console.error("Failed to fetch username:", err);
        }
      }
    };
    if (isAuthenticated) {
      fetchUsername();
    }
  }, [isAuthenticated]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    // Skip API call to /logout/ since it doesn't exist in urls.py
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
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
                    {username} <span className={styles.caret}>▼</span>
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
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
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