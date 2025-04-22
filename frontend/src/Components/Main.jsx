import React, { useState, useEffect } from "react";
import axios from "axios";
import Words from "./Words";
import styles from "../styles/main.module.css";

const Main = () => {
  const [wordsList, setWordsList] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const MAX_CARDS = 5;

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/words/list/");
        setWordsList(response.data);
        setCurrentWords(getRandomWords(response.data, MAX_CARDS));
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };
    fetchWords();
  }, []);

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const updateWpm = (completedWords) => {
    if (!startTime) {
      setStartTime(Date.now());
      setWordCount(completedWords);
    } else {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      setWordCount(prev => prev + completedWords);
      setWpm(Math.round(wordCount / timeElapsed));
    }
  };

  const resetWpm = () => {
    setWpm(0);
    setStartTime(null);
    setWordCount(0);
  };

  const handleWordComplete = (index, isCorrect) => {
    if (isCorrect) updateWpm(1); // Обновляем WPM только для правильных слов
    // Удаление перенесено в handleKeyDown в Words.js
  };

  const removeCardAndAddNew = (index) => {
    setCurrentWords(prev => {
      const newWords = [...prev];
      newWords.splice(index, 1);
      const remainingWords = wordsList.filter(w => !newWords.some(nw => nw.id_word === w.id_word));
      if (remainingWords.length > 0 && newWords.length < MAX_CARDS) {
        newWords.push(getRandomWords(remainingWords, 1)[0]);
      }
      return newWords;
    });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.wpmContainer}>
        <span>WPM: {wpm}</span>
        <button className={styles.resetButton} onClick={resetWpm}>
          Сбросить
        </button>
      </div>
      <div className={styles.wordsList}>
        {currentWords.map((wordData, index) => (
          <Words
            key={wordData.id_word}
            word={wordData.word}
            translate={wordData.translate_word}
            partOfSpeech={wordData.part_of_speech}
            level={wordData.word_level}
            index={index}
            onComplete={handleWordComplete}
            onCardChange={removeCardAndAddNew}
            totalWords={currentWords.length}
          />
        ))}
      </div>
    </div>
  );
};

export default Main;