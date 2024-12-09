import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/nav.module.css";

const Nav = () => {
  return (
    <header>
      <div className={styles.container}>
        <div className={styles.title}>Title<span>TODO</span></div>
        <nav>
          <ul className={styles.menu}>
            <li className={styles.item}>
              <Link to="#" className={styles.link}>Войти</Link>
            </li>
            <li>
              <Link href="#" className={styles.link}>Зарегистрироваться</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
