import React, { useRef, useState } from "react";
import styles from "../styles/words.module.css";

const Words = ({ word, translate }) => {
  const [inputWord, setInputWord] = useState("");
  const [inputTranslate, setInputTranslate] = useState("");

  const inputWordHtml = useRef("")
  const inputTranslateHtml = useRef("")

  const handleChangeWord = (e) => {
    if (e.target.value[inputWord.length] === " "){
      
    } else {
    if (e.target.value.length === 0) {
      setInputWord("");
    } else if (e.target.value.length === 15) {
      e.target.value = e.target.value.slice(0, e.target.value.length-1)
    } else if (inputWord.length < e.target.value.length) {
      setInputWord(inputWord + e.target.value[inputWord.length]);
      if (inputWord.length < word.length) {
        e.target.value = word.slice(0, inputWord.length + 1);
      }
    } else if (inputWord.length > e.target.value.length) {
      setInputWord(inputWord.slice(0, inputWord.length - 1));
      if (inputWord.length > word.length) {
        e.target.value = word.slice(0, inputWord.length) + inputWord.slice(word.length, inputWord.length - 1);
      } else {
        e.target.value = word.slice(0, inputWord.length - 1);
      }
    }}
  };

  const handleChangeTranslate = (e) => {
    setInputTranslate(e.target.value);
  };

  const renderWord = ({ string, value }) => {
    const renderedChars = [...string].map((char, index) => {
      const isMatched = value[index] === char;
      const color = isMatched
        ? "#dcdee3"
        : value[index]
        ? "#df4f4b"
        : "#54555e";
      return (
        <span key={index} style={{ color }}>
          {char}
        </span>
      );
    });
  
    if (value.length > string.length) {
      const extraChars = [...value].slice(string.length).map((char, index) => (
        <span key={string.length + index} style={{ color: "#df4f4b" }}>
          {char}
        </span>
      ));
      return (
        <>
          {renderedChars}
          {extraChars}
        </>
      );
    }
  
    return renderedChars;
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <input
          className={`${styles.inputWord} ${styles.firstInputLength}`}
          ref={inputWordHtml}
          onChange={handleChangeWord}
        />
        <div className={`${styles.word}`}>
          {renderWord({ string: word, value: inputWord })}
        </div>
      </div>
      <div className={styles.wrapper}>
        <input
          className={`${styles.inputWord} ${styles.secondInputLength}`}
          onChange={handleChangeTranslate}
          ref={inputTranslateHtml}
        />
        <div className={`${styles.word}`}>
          {renderWord({ string: translate, value: inputTranslate })}
        </div>
      </div>
    </div>
  );
};

export default Words;
