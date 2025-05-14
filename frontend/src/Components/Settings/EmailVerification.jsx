import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../../styles/settings.module.css";
import api from "../../api";

const EmailVerification = () => {
  const [email, setEmail] = useState("example@domain.com");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("users/me/");
        setEmail(response.data.email);
        setIsVerified(response.data.is_email_verificated);
      } catch (err) {
        setError("Не удалось загрузить данные пользователя.");
      }
    };
    fetchUserData();
  }, []);

  // Handle cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Request verification email
  const handleVerify = async () => {
    if (cooldown > 0 || isVerified) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("auth/request-verification/");
      setSuccess(response.data.message);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка при отправке письма.");
    } finally {
      setLoading(false);
    }
  };

  return (<>
      <motion.h2
        className={styles.sectionTitle}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Подтверждение почты
      </motion.h2>

      <motion.div>
        {success && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        <p className={styles.infoText}>
          Ваш email: <span className={styles.email}>{email}</span>{" "}
          {isVerified ? (
            <span className={styles.successMessage}>(подтвержден)</span>
          ) : (
            <span className={styles.errorMessage}>(не подтвержден)</span>
          )}
        </p>
        <motion.button
          onClick={handleVerify}
          className={styles.submitButton}
          disabled={loading || cooldown > 0 || isVerified}
          whileHover={{ scale: 1.05, backgroundColor: "var(--secondary)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <span className={styles.loader}></span>
          ) : cooldown > 0 ? (
            `Повторная отправка через ${cooldown} сек`
          ) : isVerified ? (
            "Почта подтверждена"
          ) : (
            "Отправить письмо для подтверждения"
          )}
        </motion.button>
      </motion.div></>
  );
};

export default EmailVerification;