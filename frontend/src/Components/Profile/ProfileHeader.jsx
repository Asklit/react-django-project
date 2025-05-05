import React from "react";
import styles from "../../styles/profile.module.css";

const ProfileHeader = ({ username }) => {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}></div>
      <h1 className={styles.username}>{username || "Загрузка..."}</h1>
    </div>
  );
};

export default ProfileHeader;