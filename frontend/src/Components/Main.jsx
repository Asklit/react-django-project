import React, { useRef }from "react";
import Words from "./Words";
import styles from "../styles/main.module.css";

const Main = () => {
  // inputRefs = useRef([])
  // const switchFocus = (index) => {
  //   const nextIndex = index + 1;
  //   if (nextIndex < inputRefs.current.length) {
  //     inputRefs.current[nextIndex].focus();
  //   }
  // }  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.title}>
          Вводите слова и их перевод для запоминания
        </div>
        <div className={styles.words}>
          <Words word="Word" translate="Слово" />
          <Words word="Inspire" translate="Вдохновлять" />
          <Words word="Constraint" translate="Ограничение" index="4" />
        </div>
      </div>
    </div>
  );
};

export default Main;