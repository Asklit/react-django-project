import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/settings.module.css";

const ChangePassword = ({ setError, setSuccess }) => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/change-password/",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      setSuccess(response.data.status);
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setError(error.response?.data?.errors?.non_field_errors?.[0] || "Ошибка при смене пароля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена пароля</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="old_password">Текущий пароль</label>
          <input
            type="password"
            id="old_password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="new_password">Новый пароль</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirm_password">Подтверждение пароля</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Изменить пароль"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;