import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/settings.module.css";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
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
      const errorData = error.response?.data?.errors || {};
      setErrors({
        old_password: errorData.old_password?.[0],
        new_password: errorData.new_password?.[0],
        confirm_password: errorData.confirm_password?.[0] || errorData.non_field_errors?.[0],
        general: !errorData.old_password && !errorData.new_password && !errorData.confirm_password
          ? "Ошибка при смене пароля"
          : null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена пароля</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}
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
          {errors.old_password && <div className={styles.errorMessage}>{errors.old_password}</div>}
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
          {errors.new_password && <div className={styles.errorMessage}>{errors.new_password}</div>}
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
          {errors.confirm_password && (
            <div className={styles.errorMessage}>{errors.confirm_password}</div>
          )}
        </div>
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Изменить пароль"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;