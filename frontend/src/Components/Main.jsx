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
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all"); // Для стадий изучения
  const MAX_CARDS = 5;

  const isAuthenticated = !!localStorage.getItem("accessToken");

  const levelOptions = [
    { value: "all", label: "All Levels" },
    { value: "A1", label: "A1" },
    { value: "A2", label: "A2" },
    { value: "B1", label: "B1" },
    { value: "B2", label: "B2" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
  ];

  const stageOptions = [
    { value: "all", label: "All Stages" },
    { value: "introduction", label: "Introduction" },
    { value: "active_recall", label: "Active Recall" },
    { value: "consolidation", label: "Consolidation" },
    { value: "spaced_repetition", label: "Spaced Repetition" },
    { value: "active_usage", label: "Active Usage" },
  ];

  useEffect(() => {
    const fetchWords = async () => {
      try {
        let url = "http://localhost:8000/api/words/stage/";
        const params = {};
        if (selectedLevel !== "all") {
          params.level = selectedLevel;
        }
        if (selectedStage !== "all" && isAuthenticated) {
          params.stage = selectedStage;
        } else {
          url = "http://localhost:8000/api/words/list/";
        }
        const response = await axios.get(url, { params });
        setWordsList(response.data);
        setCurrentWords(getRandomWords(response.data, MAX_CARDS));
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };
    fetchWords();
  }, [selectedLevel, selectedStage, isAuthenticated]);

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const updateWpm = () => {
    if (!startTime) {
      setStartTime(Date.now());
    } else {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      setWpm(Math.round(wordCount / timeElapsed));
    }
  };

  const resetWpm = () => {
    setWpm(0);
    setStartTime(null);
    setWordCount(0);
    setTimer(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleWordComplete = async (index, isCorrect) => {
    if (isCorrect) {
      setWordCount((prev) => prev + 2); // Увеличиваем на 2 (русское + английское слово)
      updateWpm();

      // Отправляем запрос для обновления прогресса, если пользователь авторизован
      if (isAuthenticated) {
        try {
          const wordId = currentWords[index].id_word;
          await axios.post(
            "http://localhost:8000/api/words/progress/",
            { word_id: wordId, is_correct: true },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
        } catch (error) {
          console.error("Error updating word progress:", error);
        }
      }
    }
    removeCardAndAddNew(index, isCorrect);
  };

  const removeCardAndAddNew = (index, isCorrect) => {
    setCurrentWords((prev) => {
      const newWords = [...prev];
      const completedWord = newWords[index];
      newWords.splice(index, 1);

      // Проверяем, нужно ли добавить слово обратно
      const remainingWords = wordsList.filter(
        (w) => !newWords.some((nw) => nw.id_word === w.id_word)
      );

      if (isCorrect && remainingWords.length > 0) {
        if (selectedStage !== "all" && newWords.length >= 4) {
          // Если выбрана стадия и слов >= 4, добавляем в случайное место
          const randomIndex = Math.floor(Math.random() * newWords.length);
          newWords.splice(randomIndex, 0, completedWord);
        } else {
          // Иначе добавляем в конец или оставляем одно слово
          newWords.push(completedWord);
        }
      } else if (remainingWords.length > 0 && newWords.length < MAX_CARDS) {
        // Добавляем новое слово, если слов недостаточно
        newWords.push(getRandomWords(remainingWords, 1)[0]);
      }

      return newWords;
    });
  };

  const handleLevelChange = (event) => {
    setSelectedLevel(event.target.value);
    resetWpm();
  };

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
    resetWpm();
  };

  const handleFirstInput = () => {
    if (!timerInterval) {
      setStartTime(Date.now());
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.wpmContainer}>
        <div className={styles.stats}>
          <span>Words: {wordCount}</span>
          <span>WPM: {wpm}</span>
          <span>Time: {formatTimer(timer)}</span>
        </div>
        <div className={styles.controls}>
          <select
            value={selectedLevel}
            onChange={handleLevelChange}
            className={styles.levelSelect}
          >
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isAuthenticated && (
            <select
              value={selectedStage}
              onChange={handleStageChange}
              className={styles.stageSelect}
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <button className={styles.resetButton} onClick={resetWpm}>
            Сбросить
          </button>
        </div>
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
            onFirstInput={handleFirstInput}
            totalWords={currentWords.length}
          />
        ))}
      </div>
    </div>
  );
};

export default Main;