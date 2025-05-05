import React from "react";
import ChangePassword from "./Settings/ChangePassword";
import ChangeAvatar from "./Settings/ChangeAvatar";
import ChangeUsername from "./Settings/ChangeUsername";
import EmailVerification from "./Settings/EmailVerification";
import styles from "../styles/settings.module.css";

const Settings = () => {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    return (
      <div className={`${styles.settingsContainer}`}>
        Пожалуйста, войдите в систему
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.header}>Настройки</h1>
      <div className={styles.section}>
        <ChangeAvatar />
      </div>
      <div className={styles.section}>
        <ChangeUsername />
      </div>
      <div className={styles.section}>
        <ChangePassword />
      </div>
      <div className={styles.section}>
        <EmailVerification />
      </div>
    </div>
  );
};

export default Settings;