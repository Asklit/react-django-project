import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/MainPageWords.module.css";

const rusToEngLayout = {
  "й": "q",
  "ц": "w",
  "у": "e",
  "к": "r",
  "е": "t",
  "н": "y",
  "г": "u",
  "ш": "i",
  "щ": "o",
  "з": "p",
  "х": "[",
  "ъ": "]",
  "ф": "a",
  "ы": "s",
  "в": "d",
  "а": "f",
  "п": "g",
  "р": "h",
  "о": "j",
  "л": "k",
  "д": "l",
  "ж": ";",
  "э": "'",
  "я": "z",
  "ч": "x",
  "с": "c",
  "м": "v",
  "и": "b",
  "т": "n",
  "ь": "m",
  "б": ",",
  "ю": ".",
  ".": "/",
  "ё": "`",
};

const engToRusLayout = Object.fromEntries(
  Object.entries(rusToEngLayout).map(([rus, eng]) => [eng, rus])
);

const MAX_INPUT_LENGTH = 24;

const Words = ({
  word,
  translate,
  partOfSpeech,
  level,
  index,
  onComplete,
  onCardChange,
  onFirstInput,
  incrementWordCount,
  totalWords,
}) => {
  const [inputWord, setInputWord] = useState("");
  const [inputTranslate, setInputTranslate] = useState("");
  const [wordInputBuffer, setWordInputBuffer] = useState("");
  const [translateInputBuffer, setTranslateInputBuffer] = useState("");
  const [countedWords, setCountedWords] = useState(new Set());
  const inputWordRef = useRef(null);
  const inputTranslateRef = useRef(null);

  // Reset countedWords when the card is re-rendered with new word or translate
  useEffect(() => {
    setCountedWords(new Set());
    setInputWord("");
    setInputTranslate("");
    setWordInputBuffer("");
    setTranslateInputBuffer("");
  }, [word, translate]);

  useEffect(() => {
    if (index === 0 && inputWordRef.current) {
      inputWordRef.current.focus();
    }
  }, [index]);

  const clearInputs = () => {
    setInputWord("");
    setInputTranslate("");
    setWordInputBuffer("");
    setTranslateInputBuffer("");
  };

  const countSpaces = (str) => {
    return (str.match(/ /g) || []).length;
  };

  const getSubstringUpToNthSpace = (str, n) => {
    let spaceCount = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === " ") {
        spaceCount++;
        if (spaceCount === n) {
          return str.slice(0, i + 1);
        }
      }
    }
    return str;
  };

  const checkWordCorrectness = (buffer, target) => {
    const bufferWords = buffer.trim().split(/\s+/).filter((w) => w.length > 0);
    const targetWords = target.trim().split(/\s+/).filter((w) => w.length > 0);
    const lastBufferWord = bufferWords[bufferWords.length - 1]?.toLowerCase();
    const lastTargetWord = targetWords[bufferWords.length - 1]?.toLowerCase();
    const isCorrect = lastBufferWord === lastTargetWord;
    return isCorrect;
  };

  const handleChangeWord = (e) => {
    let value = e.target.value;
    const prevValue = wordInputBuffer;
    let newBuffer = prevValue;

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
        inputChar =
          lastChar === lastChar.toLowerCase()
            ? transliteratedChar
            : transliteratedChar.toUpperCase();
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
        inputChar =
          lastChar === lastChar.toLowerCase()
            ? transliteratedChar
            : transliteratedChar.toUpperCase();
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

      if (e.target === inputWordRef.current) {
        const bufferSpaces = countSpaces(wordInputBuffer);
        const wordSpaces = countSpaces(word);

        if (e.key === " " && bufferSpaces < wordSpaces) {
          const targetSubstring = getSubstringUpToNthSpace(word, bufferSpaces + 1);
          setWordInputBuffer(targetSubstring);
          setInputWord(targetSubstring);
          return;
        }

        const isWordCorrect = checkWordCorrectness(wordInputBuffer, word);
        if (isWordCorrect && !countedWords.has(word)) {
          console.log("Words: Word correct, incrementing count for", word);
          incrementWordCount(word);
          setCountedWords((prev) => new Set(prev).add(word));
        }

        inputTranslateRef.current?.focus();
      } else {
        const bufferSpaces = countSpaces(translateInputBuffer);
        const translateSpaces = countSpaces(translate);

        if (e.key === " " && bufferSpaces < translateSpaces) {
          const targetSubstring = getSubstringUpToNthSpace(translate, bufferSpaces + 1);
          setTranslateInputBuffer(targetSubstring);
          setInputTranslate(targetSubstring);
          return;
        }

        const isTranslateCorrect = checkWordCorrectness(translateInputBuffer, translate);
        if (isTranslateCorrect && !countedWords.has(translate)) {
          console.log("Words: Translate correct, incrementing count for", translate);
          incrementWordCount(translate);
          setCountedWords((prev) => new Set(prev).add(translate));
        }

        const isCorrect = wordInputBuffer === word && translateInputBuffer === translate;
        console.log("Words: handleKeyDown, isCorrect =", isCorrect, "wordInputBuffer =", wordInputBuffer, "translateInputBuffer =", translateInputBuffer);

        onComplete(index, isCorrect);
        clearInputs();

        // Фокус на первую карточку после завершения
        if (index < totalWords - 1) {
          const nextInput = document.querySelectorAll(`.${styles.inputWord}`)[(index + 1) * 2];
          if (nextInput) {
            nextInput.focus();
          }
        } else {
          const firstInput = document.querySelector(`.${styles.inputWord}`);
          if (firstInput) {
            firstInput.focus();
          }
        }
      }
    } else if (e.key === "Backspace") {
      if (e.target === inputWordRef.current && inputWord === "" && index > 0) {
        const prevInput = document.querySelectorAll(`.${styles.inputWord}`)[(index - 1) * 2];
        if (prevInput) {
          prevInput.focus();
        }
      } else if (e.target === inputTranslateRef.current && inputTranslate === "") {
        inputWordRef.current?.focus();
        inputWordRef.current?.setSelectionRange(inputWord.length, inputWord.length);
      }
    }
  };

  const renderWord = ({ string, buffer }) => {
    const renderedChars = [...string].map((char, index) => {
      const inputChar = buffer[index];
      const isMatched =
        inputChar &&
        (string[index].toLowerCase() === inputChar.toLowerCase() ||
          rusToEngLayout[inputChar.toLowerCase()] === string[index].toLowerCase() ||
          engToRusLayout[inputChar.toLowerCase()] === string[index].toLowerCase());
      const color = isMatched
        ? "var(--text)"
        : inputChar
        ? "var(--error)"
        : "var(--text-muted)";
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
          <div className={styles.word}>
            {renderWord({ string: word, buffer: wordInputBuffer })}
          </div>
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
          <div className={styles.word}>
            {renderWord({ string: translate, buffer: translateInputBuffer })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Words;