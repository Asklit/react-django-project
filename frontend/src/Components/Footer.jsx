import React from "react";
import styles from "../styles/footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <span>Создано: asklit, 2024</span>
        <span>Почта: <a href="mailto:asklit@todo.com" className={styles.link}>asklit@todo.com</a></span>
      </div>
    </footer>
  );
};

export default Footer;