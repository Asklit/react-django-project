import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";
import styles from "../styles/nav.module.css";

const Nav = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [username, setUsername] = useState(null); // null indicates loading
  const [avatar, setAvatar] = useState(null); // URL аватара
  const [isAdmin, setIsAdmin] = useState(false); // Статус администратора
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Функция для получения данных пользователя
  const fetchUserData = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!accessToken || !userId) {
      setUsername("Гость");
      setAvatar(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      return;
    }

    try {
      const response = await api.get(`/users/${userId}/`);
      if (response.data && response.data.username) {
        setUsername(response.data.username);
        setAvatar(response.data.avatar || null);
        setIsAuthenticated(true);
      } else {
        setUsername("Гость");
        setAvatar(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setUsername("Гость");
      setAvatar(null);
      setIsAuthenticated(false);
      setIsAdmin(false);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Проверка статуса администратора
  const fetchAdminStatus = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsAdmin(false);
      return;
    }

    try {
      await axios.get("http://localhost:8000/api/admins/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setIsAdmin(true);
    } catch (err) {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchAdminStatus();
  }, [fetchUserData, fetchAdminStatus]);

  useEffect(() => {
    const handleStorageChange = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsAuthenticated(!!accessToken);
      if (accessToken) {
        fetchUserData();
        fetchAdminStatus();
      } else {
        setUsername("Гость");
        setAvatar(null);
        setIsAdmin(false);
      }
    };

    const handleAvatarUpdated = () => {
      fetchUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarUpdated", handleAvatarUpdated);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdated", handleAvatarUpdated);
    };
  }, [fetchUserData, fetchAdminStatus]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUsername("Гость");
    setAvatar(null);
    setIsAdmin(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleImageError = () => {
    setAvatar(null);
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
                    className={styles.userButton}
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className={styles.avatar}>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="User Avatar"
                          className={styles.avatarImage}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <span className={styles.username}>{username || "Загрузка..."}</span>
                    <span className={styles.caret}></span>
                  </button>
                  {dropdownOpen && (
                    <ul className={styles.dropdownMenu}>
                      <li className={styles.dropdownSection}>
                        <span className={styles.sectionLabel}>Аккаунт</span>
                      </li>
                      <li>
                        <Link to="/profile" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>
                          Профиль
                        </Link>
                      </li>
                      <li>
                        <Link to="/settings" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>
                          Настройки
                        </Link>
                      </li>
                      {isAdmin && (
                        <>
                          <li className={styles.dropdownDivider}></li>
                          <li className={styles.dropdownSection}>
                            <span className={styles.sectionLabel}>Администрирование</span>
                          </li>
                          <li>
                            <Link to="/admin" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>
                              Панель администратора
                            </Link>
                          </li>
                        </>
                      )}
                      <li className={styles.dropdownDivider}></li>
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