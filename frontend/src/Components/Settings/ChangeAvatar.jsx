import React, { useState } from "react";
import styles from "../../styles/settings.module.css";

const ChangeAvatar = () => {
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Будет реализовано позже
    alert("Функционал смены аватарки будет добавлен позже!");
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена аватарки</h2>
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