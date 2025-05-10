import React, { useState, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import axios from "axios";
import styles from "../../styles/AdminPanel.module.css";
import Users from "./Users";
import Words from "./Words";
import Admins from "./Admins";
import Dashboards from "./Dashboards";
import Stages from "./Stages";
import WordLevels from "./WordLevels";
import PartsOfSpeech from "./PartsOfSpeech";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "users";
  });
  const [isAdmin, setIsAdmin] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        await axios.get("http://localhost:8000/api/admins/me/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setIsAdmin(true);
        setError(null);
      } catch (err) {
        setIsAdmin(false);
        setError("У вас нет прав администратора для доступа к этой странице");
      }
    };

    checkAdminStatus();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <Users />;
      case "words":
        return <Words />;
      case "admins":
        return <Admins />;
      case "dashboards":
        return <Dashboards />;
      case "stages":
        return <Stages />;
      case "wordlevels":
        return <WordLevels />;
      case "partsofspeech":
        return <PartsOfSpeech />;
      default:
        return <Users />;
    }
  };

  if (isAdmin === null) {
    return <div className={`${styles.admin_container} ${styles.errorMessage}`}>Загрузка...</div>;
  }

  if (!isAdmin) {
    return (
      <div className={`${styles.admin_container} ${styles.errorMessage}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.admin_container}>
      <h2 className={styles.admin_title}>Панель администратора</h2>
      <div className={styles.admin_tabs}>
        <button
          className={`${styles.admin_tab} ${activeTab === "dashboards" ? styles.active : ""}`}
          onClick={() => setActiveTab("dashboards")}
        >
          Дашборды
        </button>
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
        <button
          className={`${styles.admin_tab} ${activeTab === "stages" ? styles.active : ""}`}
          onClick={() => setActiveTab("stages")}
        >
          Этапы
        </button>
        <button
          className={`${styles.admin_tab} ${activeTab === "wordlevels" ? styles.active : ""}`}
          onClick={() => setActiveTab("wordlevels")}
        >
          Уровни слов
        </button>
        <button
          className={`${styles.admin_tab} ${activeTab === "partsofspeech" ? styles.active : ""}`}
          onClick={() => setActiveTab("partsofspeech")}
        >
          Части речи
        </button>
      </div>

      <TransitionGroup>
        <CSSTransition
          key={activeTab}
          timeout={300}
          classNames={{
            enter: styles.tabEnter,
            enterActive: styles.tabEnterActive,
            exit: styles.tabExit,
            exitActive: styles.tabExitActive,
          }}
        >
          <div className={styles.tabContent}>{renderTabContent()}</div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default AdminPanel;