import React, { useState } from "react";
import styles from "../../styles/settings.module.css";

const ChangeAvatar = () => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Пожалуйста, выберите изображение");
        setPreview(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Файл слишком большой (максимум 5 МБ)");
        setPreview(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preview) {
      setError("Пожалуйста, выберите изображение");
      return;
    }
    // Будет реализовано позже
    setSuccess("Функционал смены аватарки будет добавлен позже!");
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена аватарки</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      <div className={styles.avatarContainer}>
        <div className={styles.avatarPreview}>
          {preview ? (
            <img src={preview} alt="Avatar Preview" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>Выберите изображение</div>
          )}
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <label htmlFor="avatar" className={styles.fileLabel}>
              Выбрать файл
            </label>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
          <button type="submit" className={styles.submitButton}>
            Загрузить аватарку
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeAvatar;