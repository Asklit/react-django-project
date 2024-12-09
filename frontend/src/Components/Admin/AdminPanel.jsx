import React, { useState } from "react";
import styles from "../../styles/AdminPanel.module.css";
import Users from "./Users";
import Admins from "./Admins";
import Words from "./Words";

function AdminPanel() {
  
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className={styles.admin_container}>
      <h2 className={styles.admin_title}>Панель администратора</h2>
      <div className={styles.admin_tabs}>
        <button
          className={`${styles.admin_tab} ${
            activeTab === "users" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("users")}>
          Пользователи
        </button>
        <button
          className={`${styles.admin_tab} ${
            activeTab === "admins" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("admins")}
        >
          Администраторы
        </button>
        <button
          className={`${styles.admin_tab} ${
            activeTab === "words" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("words")}
        >
          Слова
        </button>
      </div>

      {activeTab === "users" && (
        <Users />
      )}

      {activeTab === "admins" && (
        <Admins />
      )}

      {activeTab === "words" && (
        <Words />
      )}
    </div>
  );
}

export default AdminPanel;