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

const MAX_INPUT_LENGTH = 10; // Ограничение длины ввода

const Words = ({ word, translate, partOfSpeech, level, index, onComplete, onCardChange, totalWords }) => {
  const [inputWord, setInputWord] = useState(""); // Поле ввода с правильными буквами
  const [inputTranslate, setInputTranslate] = useState(""); // Поле ввода с правильными буквами
  const [wordInputBuffer, setWordInputBuffer] = useState(""); // Буфер с исходным вводом пользователя для слова
  const [translateInputBuffer, setTranslateInputBuffer] = useState(""); // Буфер с исходным вводом пользователя для перевода
  const inputWordRef = useRef(null);
  const inputTranslateRef = useRef(null);

  // Устанавливаем фокус на первое слово первой карточки при монтировании
  useEffect(() => {
    if (index === 0) {
      inputWordRef.current.focus();
    }
  }, [index]);

  const handleChangeWord = (e) => {
    let value = e.target.value;
    const lastChar = value[value.length - 1];

    // Транслитерация русской буквы в английскую, если введена
    if (lastChar && /[а-яё]/i.test(lastChar)) {
      const transliteratedChar = rusToEngLayout[lastChar.toLowerCase()] || lastChar;
      value = value.slice(0, -1) + (lastChar === lastChar.toLowerCase() ? transliteratedChar : transliteratedChar.toUpperCase());
    }

    // Обновляем буфер с учетом ограничения в 10 символов
    if (value.length <= MAX_INPUT_LENGTH) {
      setWordInputBuffer(value);
    } else {
      setWordInputBuffer(value.slice(0, MAX_INPUT_LENGTH));
      value = value.slice(0, MAX_INPUT_LENGTH);
    }

    // Подставляем правильные буквы в поле ввода
    if (value.length <= word.length) {
      setInputWord(word.slice(0, value.length));
      e.target.value = word.slice(0, value.length);
    } else {
      // Если превышает длину слова, добавляем введенные символы в конец
      const extraChars = value.slice(word.length);
      setInputWord(word + extraChars);
      e.target.value = word + extraChars;
    }
  };

  const handleChangeTranslate = (e) => {
    let value = e.target.value;
    const lastChar = value[value.length - 1];

    // Транслитерация английской буквы в русскую, если введена
    if (lastChar && /[a-z]/i.test(lastChar)) {
      const transliteratedChar = engToRusLayout[lastChar.toLowerCase()] || lastChar;
      value = value.slice(0, -1) + (lastChar === lastChar.toLowerCase() ? transliteratedChar : transliteratedChar.toUpperCase());
    }

    // Обновляем буфер с учетом ограничения в 10 символов
    if (value.length <= MAX_INPUT_LENGTH) {
      setTranslateInputBuffer(value);
    } else {
      setTranslateInputBuffer(value.slice(0, MAX_INPUT_LENGTH));
      value = value.slice(0, MAX_INPUT_LENGTH);
    }

    // Подставляем правильные буквы в поле ввода
    if (value.length <= translate.length) {
      setInputTranslate(translate.slice(0, value.length));
      e.target.value = translate.slice(0, value.length);
    } else {
      // Если превышает длину перевода, добавляем введенные символы в конец
      const extraChars = value.slice(translate.length);
      setInputTranslate(translate + extraChars);
      e.target.value = translate + extraChars;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
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
      const inputChar = buffer[index]; // Используем буфер для проверки корректности
      const isMatched = inputChar && (string[index].toLowerCase() === inputChar.toLowerCase() || 
        (rusToEngLayout[inputChar.toLowerCase()] === string[index].toLowerCase()) || 
        (engToRusLayout[inputChar.toLowerCase()] === string[index].toLowerCase()));
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