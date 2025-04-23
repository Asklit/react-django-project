import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/MainPageWords.module.css";

// Таблица соответствия стандартной раскладки (русская → английская)
const rusToEngLayout = {
  "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t", "н": "y", "г": "u", "ш": "i",
  "щ": "o", "з": "p", "х": "[", "ъ": "]", "ф": "a", "ы": "s", "в": "d", "а": "f",
  "п": "g", "р": "h", "о": "j", "л": "k", "д": "l", "ж": ";", "э": "'", "я": "z",
  "ч": "x", "с": "c", "м": "v", "и": "b", "т": "n", "ь": "m", "б": ",", "ю": ".",
  ".": "/", "ё": "`"
};

// Обратная таблица (английская → русская)
const engToRusLayout = Object.fromEntries(
  Object.entries(rusToEngLayout).map(([rus, eng]) => [eng, rus])
);

const MAX_INPUT_LENGTH = 24;

const Words = ({ word, translate, partOfSpeech, level, index, onComplete, onCardChange, onFirstInput, totalWords }) => {
  const [inputWord, setInputWord] = useState("");
  const [inputTranslate, setInputTranslate] = useState("");
  const [wordInputBuffer, setWordInputBuffer] = useState("");
  const [translateInputBuffer, setTranslateInputBuffer] = useState("");
  const inputWordRef = useRef(null);
  const inputTranslateRef = useRef(null);

  useEffect(() => {
    if (index === 0) {
      inputWordRef.current.focus();
    }
  }, [index]);

  const handleChangeWord = (e) => {
    let value = e.target.value;
    const prevValue = wordInputBuffer;
    let newBuffer = prevValue;

    // Вызываем onFirstInput при первом вводе
    if (prevValue === "" && value !== "") {
      onFirstInput();
    }

    if (value.length >= MAX_INPUT_LENGTH) {
      return;
    }

    if (value.length > MAX_INPUT_LENGTH) {
      value = value.slice(0, MAX_INPUT_LENGTH);
      e.target.value = value;
    }

    if (value.length < prevValue.length) {
      newBuffer = prevValue.slice(0, value.length);
      setWordInputBuffer(newBuffer);

      if (value.length <= word.length) {
        setInputWord(word.slice(0, value.length));
      } else {
        const extraChars = value.slice(word.length);
        setInputWord(word + extraChars);
      }
    } else if (value.length <= MAX_INPUT_LENGTH) {
      const lastChar = value[value.length - 1];
      let inputChar = lastChar;

      if (lastChar && /[а-яё]/i.test(lastChar)) {
        const transliteratedChar = rusToEngLayout[lastChar.toLowerCase()] || lastChar;
        inputChar = lastChar === lastChar.toLowerCase() ? transliteratedChar : transliteratedChar.toUpperCase();
      }

      newBuffer = prevValue + inputChar;
      setWordInputBuffer(newBuffer);

      if (value.length <= word.length) {
        setInputWord(word.slice(0, value.length));
      } else {
        const extraChars = value.slice(word.length);
        setInputWord(word + extraChars);
      }
    }
  };

  const handleChangeTranslate = (e) => {
    let value = e.target.value;
    const prevValue = translateInputBuffer;
    let newBuffer = prevValue;

    // Вызываем onFirstInput при первом вводе
    if (prevValue === "" && value !== "") {
      onFirstInput();
    }

    if (value.length >= MAX_INPUT_LENGTH) {
      return;
    }

    if (value.length > MAX_INPUT_LENGTH) {
      value = value.slice(0, MAX_INPUT_LENGTH);
      e.target.value = value;
    }

    if (value.length < prevValue.length) {
      newBuffer = prevValue.slice(0, value.length);
      setTranslateInputBuffer(newBuffer);

      if (value.length <= translate.length) {
        setInputTranslate(translate.slice(0, value.length));
      } else {
        const extraChars = value.slice(translate.length);
        setInputTranslate(translate + extraChars);
      }
    } else if (value.length <= MAX_INPUT_LENGTH) {
      const lastChar = value[value.length - 1];
      let inputChar = lastChar;

      if (lastChar && /[a-z]/i.test(lastChar)) {
        const transliteratedChar = engToRusLayout[lastChar.toLowerCase()] || lastChar;
        inputChar = lastChar === lastChar.toLowerCase() ? transliteratedChar : transliteratedChar.toUpperCase();
      }

      newBuffer = prevValue + inputChar;
      setTranslateInputBuffer(newBuffer);

      if (value.length <= translate.length) {
        setInputTranslate(translate.slice(0, value.length));
      } else {
        const extraChars = value.slice(translate.length);
        setInputTranslate(translate + extraChars);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
      e.preventDefault();
      const isCorrect = inputWord === word && inputTranslate === translate;
      onComplete(index, isCorrect);
      if (e.target === inputWordRef.current) {
        inputTranslateRef.current.focus();
      } else if (index < totalWords - 1) {
        onCardChange(index);
        document.querySelectorAll(`.${styles.inputWord}`)[(index + 1) * 2].focus();
      } else {
        onCardChange(index);
      }
    } else if (e.key === "Backspace") {
      if (e.target === inputWordRef.current && inputWord === "" && index > 0) {
        document.querySelectorAll(`.${styles.inputWord}`)[(index - 1) * 2].focus();
      } else if (e.target === inputTranslateRef.current && inputTranslate === "") {
        inputWordRef.current.focus();
        inputWordRef.current.setSelectionRange(inputWord.length, inputWord.length);
      }
    }
  };

  const renderWord = ({ string, buffer }) => {
    const renderedChars = [...string].map((char, index) => {
      const inputChar = buffer[index];
      const isMatched = inputChar && (
        string[index].toLowerCase() === inputChar.toLowerCase() ||
        (rusToEngLayout[inputChar.toLowerCase()] === string[index].toLowerCase()) ||
        (engToRusLayout[inputChar.toLowerCase()] === string[index].toLowerCase())
      );
      const color = isMatched ? "var(--text)" : inputChar ? "var(--error)" : "var(--text-muted)";
      return (
        <span key={index} style={{ color }}>
          {char}
        </span>
      );
    });

    if (buffer.length > string.length) {
      const extraChars = [...buffer].slice(string.length).map((char, index) => (
        <span key={string.length + index} style={{ color: "var(--error)" }}>
          {char}
        </span>
      ));
      return [...renderedChars, ...extraChars];
    }
    return renderedChars;
  };

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.partOfSpeech}>{partOfSpeech}</span>
        <span className={styles.level}>{level}</span>
      </div>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <input
            ref={inputWordRef}
            className={styles.inputWord}
            value={inputWord}
            onChange={handleChangeWord}
            onKeyDown={handleKeyDown}
            spellCheck="false"
          />
          <div className={styles.word}>{renderWord({ string: word, buffer: wordInputBuffer })}</div>
        </div>
        <div className={styles.wrapper}>
          <input
            ref={inputTranslateRef}
            className={styles.inputWord}
            value={inputTranslate}
            onChange={handleChangeTranslate}
            onKeyDown={handleKeyDown}
            spellCheck="false"
          />
          <div className={styles.word}>{renderWord({ string: translate, buffer: translateInputBuffer })}</div>
        </div>
      </div>
    </div>
  );
};

export default Words;