import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/nav.module.css";
import api from '../api';

const Nav = () => {
  const navigate = useNavigate();
  // Проверяем наличие токена в localStorage для определения статуса авторизации
  const isAuthenticated = !!localStorage.getItem("accessToken");

  // Функция для перехода на главную страницу
  const handleLogoClick = () => {
    navigate("/");
  };

  // Функция для выхода из аккаунта
  const handleLogout = async () => {
    try {
      await api.post("logout/", { refresh: localStorage.getItem("refreshToken") });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <header>
      <div className={styles.container}>
        {/* Логотип */}
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
              <>
                {/* Кнопка Профиль */}
                <li className={styles.item}>
                  <Link to="/profile" className={styles.link}>
                    Профиль
                  </Link>
                </li>
                {/* Кнопка Выход */}
                <li className={styles.item}>
                  <button
                    onClick={handleLogout}
                    className={styles.link} // Используем тот же стиль, что и для ссылок
                    style={{ background: "none", border: "none", cursor: "pointer" }} // Убираем стандартный вид кнопки
                  >
                    Выход
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Кнопка Войти */}
                <li className={styles.item}>
                  <Link to="/login" className={styles.link}>
                    Войти
                  </Link>
                </li>
                {/* Кнопка Зарегистрироваться */}
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