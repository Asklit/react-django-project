import React, { useState } from "react";
import ChangePassword from "./Settings/ChangePassword";
import ChangeAvatar from "./Settings/ChangeAvatar";
import EmailVerification from "./Settings/EmailVerification";
import styles from "../styles/settings.module.css";

const Settings = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    return <div className={`${styles.settingsContainer} ${styles.errorMessage}`}>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.header}>Настройки</h1>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      <div className={styles.section}>
        <ChangePassword setError={setError} setSuccess={setSuccess} />
      </div>
      <div className={styles.section}>
        <ChangeAvatar />
      </div>
      <div className={styles.section}>
        <EmailVerification />
      </div>
    </div>
  );
};

export default Settings;