import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import axios from "axios";
import styles from "../../styles/settings.module.css";

const ChangeAvatar = () => {
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
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
        setIsCropping(true);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await image.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!croppedAreaPixels) {
      setError("Пожалуйста, обрежьте изображение");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

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
      setIsCropping(false);
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
    <div className={styles.settingsContainer}>
      <h2 className={styles.sectionTitle}>Смена аватарки</h2>
      {success && <div className={styles.successMessage}>{success}</div>}
      <div className={styles.avatarContainer}>
        {isCropping && preview && (
          <div className={styles.cropContainer}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}
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