import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/settings.module.css";

const ChangeUsername = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/change-username/",
        { new_username: username },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      setSuccess(response.data.status);
      setUsername("");
    } catch (error) {
      setError(
        error.response?.data?.errors?.new_username?.[0] ||
        "Ошибка при смене имени пользователя"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена имени пользователя</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="new_username">Новое имя пользователя</label>
          <input
            type="text"
            id="new_username"
            name="new_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
            placeholder="Введите новое имя пользователя"
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Сохранение..." : "Изменить имя"}
        </button>
      </form>
    </div>
  );
};

export default ChangeUsername;