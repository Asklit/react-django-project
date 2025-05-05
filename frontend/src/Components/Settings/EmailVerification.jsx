import React, { useState } from "react";
import styles from "../../styles/settings.module.css";

const EmailVerification = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = () => {
    // Будет реализовано позже
    setSuccess("Функционал подтверждения почты будет добавлен позже!");
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Подтверждение почты</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
      <p className={styles.infoText}>
        Ваш email: <span className={styles.email}>example@domain.com</span> (не подтвержден)
      </p>
      <button onClick={handleVerify} className={styles.submitButton}>
        Отправить письмо для подтверждения
      </button>
    </div>
  );
};

export default EmailVerification;