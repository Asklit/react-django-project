import React, { useState, useEffect } from "react";
import api from '../../api';
import styles from "../../styles/profile.module.css";

const ProfileHeader = ({ username }) => {
  const [avatar, setAvatar] = useState(null);

  const fetchAvatar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await api.get(`/users/${userId}/`);
      setAvatar(response.data.avatar || null);
    } catch (err) {
      console.error("Failed to fetch avatar:", err);
      setAvatar(null);
    }
  };

  useEffect(() => {
    fetchAvatar();

    const handleAvatarUpdated = () => {
      fetchAvatar();
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdated);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdated);
    };
  }, []);

  const handleImageError = () => {
    setAvatar(null); 
  };

  return (
    <div className={styles.header}>
      <div className={styles.avatar}>
        {avatar ? (
          <img
            src={avatar}
            alt="User Avatar"
            className={styles.avatarImage}
            onError={handleImageError}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {username?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <h1 className={styles.username}>{username || "Загрузка..."}</h1>
    </div>
  );
};

export default ProfileHeader;