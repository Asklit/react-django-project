import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Words from "./Words";
import styles from "../styles/main.module.css";

const Main = () => {
  const [wordsList, setWordsList] = useState([]);
  const [wordsPool, setWordsPool] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [stageCounts, setStageCounts] = useState({});
  const [userLevel, setUserLevel] = useState(null);
  const MAX_CARDS = 4;
  const POOL_SIZE = 20;

  const isAuthenticated = !!localStorage.getItem("accessToken");

  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const levelOptions = [
    { value: "all", label: "Все уровни" },
    { value: "A1", label: "Начальный" },
    { value: "A2", label: "Элементарный" },
    { value: "B1", label: "Средний" },
    { value: "B2", label: "Выше среднего" },
    { value: "C1", label: "Продвинутый" },
    { value: "C2", label: "Владение в совершенстве" },
  ];

  const stageOptions = [
    { value: "all", label: "Все стадии" },
    { value: "introduction", label: "Введение" },
    { value: "active_recall", label: "Активное воспроизведение" },
    { value: "consolidation", label: "Закрепление" },
    { value: "spaced_repetition", label: "Интервальное повторение" },
    { value: "active_usage", label: "Активное использование" },
  ];

  const getRandomWords = (words, count) => {
    if (!words || words.length === 0) return [];
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, words.length));
  };

  const initializeWordsPool = useCallback(
    (words, stageCounts) => {
      console.log("initializeWordsPool: userLevel =", userLevel);
      console.log("initializeWordsPool: words count =", words.length);
      console.log("initializeWordsPool: stageCounts =", stageCounts);

      if (!words || words.length === 0) {
        console.warn("No words available to initialize pool");
        setWordsPool([]);
        setCurrentWords([]);
        return;
      }

      let pool = [];

      // Если слов меньше или равно POOL_SIZE, используем их все
      if (words.length <= POOL_SIZE) {
        pool = [...words];
      } else {
        // Логика выбора слов по уровню и стадии
        const userLevelIndex = userLevel && levelOrder.includes(userLevel)
          ? levelOrder.indexOf(userLevel)
          : levelOrder.indexOf("B1");
        const lowerLevels = levelOrder.slice(0, userLevelIndex);
        const higherLevels = levelOrder.slice(userLevelIndex + 1);
        const currentLevel = levelOrder[userLevelIndex];

        console.log("lowerLevels =", lowerLevels);
        console.log("higherLevels =", higherLevels);
        console.log("currentLevel =", currentLevel);

        if (selectedStage !== "all") {
          const stagedWords = words.filter((word) => word.stage === selectedStage);
          console.log("stagedWords count =", stagedWords.length);

          if (stagedWords.length === 0) {
            const lowerLevelWords = words.filter((word) =>
              lowerLevels.includes(word.word_level)
            );
            const currentLevelWords = words.filter((word) =>
              word.word_level === currentLevel
            );
            const higherLevelWords = words.filter((word) =>
              higherLevels.includes(word.word_level)
            );

            pool = [
              ...getRandomWords(lowerLevelWords, 5),
              ...getRandomWords(currentLevelWords, 10),
              ...getRandomWords(higherLevelWords, 5),
            ];
          } else {
            const lowerLevelWords = stagedWords.filter((word) =>
              lowerLevels.includes(word.word_level)
            );
            const currentLevelWords = stagedWords.filter((word) =>
              word.word_level === currentLevel
            );
            const higherLevelWords = stagedWords.filter((word) =>
              higherLevels.includes(word.word_level)
            );

            pool = [
              ...getRandomWords(lowerLevelWords, 5),
              ...getRandomWords(currentLevelWords, 10),
              ...getRandomWords(higherLevelWords, 5),
            ];
          }
        } else {
          const hasWordsInStages =
            isAuthenticated &&
            Object.values(stageCounts).some((count) => count > 0);

          if (!hasWordsInStages) {
            const lowerLevelWords = words.filter((word) =>
              lowerLevels.includes(word.word_level)
            );
            const currentLevelWords = words.filter((word) =>
              word.word_level === currentLevel
            );
            const higherLevelWords = words.filter((word) =>
              higherLevels.includes(word.word_level)
            );

            pool = [
              ...getRandomWords(lowerLevelWords, 5),
              ...getRandomWords(currentLevelWords, 10),
              ...getRandomWords(higherLevelWords, 5),
            ];
          } else {
            const stagedWords = words.filter(
              (word) => word.stage && word.stage !== "none"
            );
            const newWords = words.filter(
              (word) => !word.stage || word.stage === "none"
            );

            pool = [
              ...getRandomWords(stagedWords, 15),
              ...getRandomWords(newWords, 5),
            ];
          }
        }

        // Удаление дубликатов по id_word
        pool = Array.from(
          new Map(pool.map((word) => [word.id_word, word])).values()
        );

        // Заполнение пула до POOL_SIZE уникальными словами, если возможно
        if (pool.length < POOL_SIZE) {
          const remainingWords = words.filter(
            (w) => !pool.some((pw) => pw.id_word === w.id_word)
          );
          pool = [...pool, ...getRandomWords(remainingWords, POOL_SIZE - pool.length)];
        }
      }

      console.log("Final pool count =", pool.length);
      console.log("Pool levels:", pool.map((w) => w.word_level));

      setWordsPool(pool);
      setCurrentWords(getRandomWords(pool, Math.min(MAX_CARDS, pool.length)));
    },
    [isAuthenticated, userLevel, selectedStage]
  );

  useEffect(() => {
    const fetchWordsAndCounts = async () => {
      try {
        let url = "http://localhost:8000/api/words/list/";
        const params = {};
        if (selectedLevel !== "all") {
          params.level = selectedLevel;
        }
        if (selectedStage !== "all" && isAuthenticated) {
          params.stage = selectedStage;
          url = "http://localhost:8000/api/words/stage/";
        }

        const config = isAuthenticated
          ? {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              params,
            }
          : { params };

        const requests = [
          axios.get(url, config),
          isAuthenticated
            ? axios.get("http://localhost:8000/api/words/stage-counts/", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              })
            : Promise.resolve({ data: {} }),
        ];

        if (isAuthenticated) {
          const userId = localStorage.getItem("userId");
          if (userId) {
            requests.push(
              axios.get(`http://localhost:8000/api/users/${userId}/`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              })
            );
          }
        }

        const [wordsResponse, countsResponse, userResponse] = await Promise.all(requests);

        const wordsData = wordsResponse.data || [];
        setWordsList(wordsData);
        setStageCounts(countsResponse.data);

        const newUserLevel = userResponse?.data?.english_level || "B1";
        setUserLevel(newUserLevel);

        console.log("wordsList count =", wordsData.length);
        console.log("userLevel =", newUserLevel);

        initializeWordsPool(wordsData, countsResponse.data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setUserLevel("B1");
        setWordsList([]);
        setWordsPool([]);
        setCurrentWords([]);
      }
    };
    fetchWordsAndCounts();
  }, [selectedLevel, selectedStage, isAuthenticated]);

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

  const incrementWordCount = async (buffer) => {
    console.log("incrementWordCount called with buffer:", buffer);
    if (!buffer || typeof buffer !== "string") {
      console.error("incrementWordCount: Invalid buffer, expected string, got:", buffer);
      return;
    }
    const words = buffer.trim().split(/\s+/).filter((word) => word.length > 0);
    console.log("Words counted:", words, "Count:", words.length);
    setWordCount((prev) => {
      const newCount = prev + words.length;
      console.log("New wordCount:", newCount);
      return newCount;
    });
    updateWpm();

    if (isAuthenticated) {
      try {
        const token = localStorage.getItem("accessToken");
        console.log("Sending POST to /api/users/activity/update/ with token:", token);
        await axios.post(
          "http://localhost:8000/api/users/activity/update/",
          { count: words.length },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("User activity updated successfully, words added:", words.length);
      } catch (error) {
        console.error("Error updating user activity:", error.response?.data || error.message);
      }
    }
  };

  const handleWordComplete = async (index, isCorrect, wordId) => {
    let newStage = null;
    if (isAuthenticated && isCorrect) {
      try {
        const progressResponse = await axios.post(
          "http://localhost:8000/api/words/progress/",
          { word_id: wordId, is_correct: true },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        newStage = progressResponse.data.stage;
        const countsResponse = await axios.get(
          "http://localhost:8000/api/words/stage-counts/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setStageCounts(countsResponse.data);
      } catch (error) {
        console.error("Ошибка при обновлении прогресса слова:", error);
      }
    }

    setCurrentWords((prev) => {
      const newWords = [...prev];
      const completedWord = newWords[index];
      newWords.splice(index, 1);

      setWordsPool((prevPool) => {
        let updatedPool = [...prevPool];

        // Удаляем слово, если его стадия изменилась и не соответствует выбранной
        if (
          newStage &&
          newStage !== completedWord.stage &&
          selectedStage !== "all"
        ) {
          updatedPool = updatedPool.filter((w) => w.id_word !== wordId);
        }

        // Если пул слишком мал, повторно добавляем завершённое слово
        if (updatedPool.length < POOL_SIZE && wordsList.length <= POOL_SIZE) {
          updatedPool.push(completedWord);
        } else if (updatedPool.length < POOL_SIZE) {
          const remainingWords = wordsList.filter(
            (w) =>
              !updatedPool.some((pw) => pw.id_word === w.id_word) &&
              !newWords.some((nw) => nw.id_word === w.id_word)
          );
          if (remainingWords.length > 0) {
            const newWord = getRandomWords(remainingWords, 1)[0];
            updatedPool.push(newWord);
          } else {
            updatedPool.push(completedWord);
          }
        }

        return updatedPool.slice(0, POOL_SIZE);
      });

      let updatedCurrentWords = [...newWords];
      if (updatedCurrentWords.length < MAX_CARDS) {
        const poolWordsNotInCurrent = wordsPool.filter(
          (w) => !updatedCurrentWords.some((nw) => nw.id_word === w.id_word)
        );
        if (poolWordsNotInCurrent.length > 0) {
          const newWord = getRandomWords(poolWordsNotInCurrent, 1)[0];
          if (newWord) {
            updatedCurrentWords.push(newWord);
          }
        } else if (wordsPool.length > 0) {
          updatedCurrentWords.push(completedWord);
        }
      }

      return updatedCurrentWords.slice(0, MAX_CARDS);
    });
  };

  const removeCardAndAddNew = (index, completedWordId) => {
    setCurrentWords((prev) => {
      const newWords = [...prev];
      const completedWord = newWords[index];
      newWords.splice(index, 1);

      setWordsPool((prevPool) => {
        let updatedPool = [...prevPool];
        if (updatedPool.length < POOL_SIZE && wordsList.length <= POOL_SIZE) {
          updatedPool.push(completedWord);
        } else if (updatedPool.length < POOL_SIZE) {
          const remainingWords = wordsList.filter(
            (w) =>
              !updatedPool.some((pw) => pw.id_word === w.id_word) &&
              !newWords.some((nw) => nw.id_word === w.id_word)
          );
          if (remainingWords.length > 0) {
            const newWord = getRandomWords(remainingWords, 1)[0];
            updatedPool.push(newWord);
          } else {
            updatedPool.push(completedWord);
          }
        }

        return updatedPool.slice(0, POOL_SIZE);
      });

      let updatedCurrentWords = [...newWords];
      if (updatedCurrentWords.length < MAX_CARDS) {
        const poolWordsNotInCurrent = wordsPool.filter(
          (w) => !updatedCurrentWords.some((nw) => nw.id_word === w.id_word)
        );
        if (poolWordsNotInCurrent.length > 0) {
          const newWord = getRandomWords(poolWordsNotInCurrent, 1)[0];
          if (newWord) {
            updatedCurrentWords.push(newWord);
          }
        } else if (wordsPool.length > 0) {
          updatedCurrentWords.push(completedWord);
        }
      }

      return updatedCurrentWords.slice(0, MAX_CARDS);
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
          <span>Слов: {wordCount}</span>
          <span>Слов/мин: {wpm}</span>
          <span>Время: {formatTimer(timer)}</span>
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
                <option
                  key={option.value}
                  value={option.value}
                  disabled={
                    option.value !== "all" && !stageCounts[option.value]
                  }
                >
                  {option.label}{" "}
                  {option.value !== "all"
                    ? `(${stageCounts[option.value] || 0})`
                    : ""}
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
        {(
          currentWords.map((wordData, index) => (
            <Words
              key={`${wordData.id_word}-${index}`}
              word={wordData.word}
              translate={wordData.translate_word}
              partOfSpeech={wordData.part_of_speech}
              level={wordData.word_level}
              index={index}
              onComplete={(index, isCorrect) =>
                handleWordComplete(index, isCorrect, wordData.id_word)
              }
              onCardChange={removeCardAndAddNew}
              onFirstInput={handleFirstInput}
              incrementWordCount={incrementWordCount}
              totalWords={currentWords.length}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Main;