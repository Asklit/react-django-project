import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/settings.module.css";

const ChangeAvatar = () => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Пожалуйста, выберите изображение (JPEG, PNG и т.д.)");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e.target.avatar.files[0]) {
      setError("Пожалуйста, выберите изображение");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("avatar", e.target.avatar.files[0]);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/change-avatar/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess(response.data.status);
      setPreview(null);
      e.target.reset();
    } catch (error) {
      setError(
        error.response?.data?.errors?.avatar?.[0] ||
        "Ошибка при загрузке аватара"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Смена аватарки</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      <div className={styles.avatarContainer}>
        {/* <div className={`${styles.avatarPreview} ${isLoading ? styles.loading : ""}`}>
          {preview ? (
            <img src={preview} alt="Avatar Preview" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>Выберите изображение</div>
          )}
          {isLoading && <div className={styles.loader}></div>}
        </div> */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
              disabled={isLoading}
            />
            <label htmlFor="avatar" className={styles.fileLabel}>
              Выбрать файл
            </label>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !preview}
          >
            {isLoading ? "Загрузка..." : "Загрузить аватарку"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeAvatar;