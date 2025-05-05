import React from "react";
import styles from "../../styles/settings.module.css";

const EmailVerification = () => {
  const handleVerify = () => {
    // Будет реализовано позже
    alert("Функционал подтверждения почты будет добавлен позже!");
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Подтверждение почты</h2>
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