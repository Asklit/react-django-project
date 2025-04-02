import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import Users from "./Users";
import Words from "./Words";
import Admins from "./Admins";

function AdminPanel() {
  // Загружаем начальное значение из localStorage или используем "users" по умолчанию
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "users";
  });

  // Сохраняем activeTab в localStorage при каждом его изменении
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className={styles.admin_container}>
      <h2 className={styles.admin_title}>Панель администратора</h2>
      <div className={styles.admin_tabs}>
        <button
          className={`${styles.admin_tab} ${activeTab === "users" ? styles.active : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Пользователи
        </button>
        <button
          className={`${styles.admin_tab} ${activeTab === "words" ? styles.active : ""}`}
          onClick={() => setActiveTab("words")}
        >
          Слова
        </button>
        <button
          className={`${styles.admin_tab} ${activeTab === "admins" ? styles.active : ""}`}
          onClick={() => setActiveTab("admins")}
        >
          Администраторы
        </button>
      </div>

      {activeTab === "users" && <Users />}
      {activeTab === "words" && <Words />}
      {activeTab === "admins" && <Admins />}
    </div>
  );
}

export default AdminPanel;