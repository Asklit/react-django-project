import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import axios from "axios";

function Words() {
  const [wordsByLevel, setWordsByLevel] = useState({
    'A1': null, 'A2': null, 'B1': null, 'B2': null, 'C1': null, 'C2': null
  });
  const [expandedLevels, setExpandedLevels] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [hoveredCells, setHoveredCells] = useState({});
  const [draggedWord, setDraggedWord] = useState(null);
  const [sortConfig, setSortConfig] = useState({});

  const [newWord, setNewWord] = useState({
    word: "",
    part_of_speech: "",
    translate_word: "",
    word_level: "",
    rating: 1
  });

  const englishLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const fetchWordsForLevel = async (level) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/words/list/?level=${level}`);
      setWordsByLevel(prev => ({
        ...prev,
        [level]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching words for level ${level}:`, error);
      setWordsByLevel(prev => ({
        ...prev,
        [level]: [] // Set empty array on error
      }));
    }
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => {
      const isExpanding = !prev[level];
      if (isExpanding && wordsByLevel[level] === null) {
        fetchWordsForLevel(level);
      }
      return { ...prev, [level]: isExpanding };
    });
  };

  const handleDragStart = (word, level) => {
    setDraggedWord({ ...word, originalLevel: level });
  };

  const handleDrop = async (targetLevel) => {
    if (!draggedWord || draggedWord.word_level === targetLevel) return;

    const updatedWord = { ...draggedWord, word_level: targetLevel };

    setWordsByLevel(prev => {
      const newState = { ...prev };
      if (newState[draggedWord.originalLevel]) {
        newState[draggedWord.originalLevel] = newState[draggedWord.originalLevel].filter(w => w.id_word !== draggedWord.id_word);
      }
      if (newState[targetLevel] === null) {
        newState[targetLevel] = [updatedWord];
      } else {
        newState[targetLevel] = newState[targetLevel].filter(w => w.id_word !== updatedWord.id_word).concat(updatedWord);
      }
      return newState;
    });

    try {
      const url = `http://localhost:8000/api/words/${draggedWord.id_word}/`;
      await axios.put(url, { word_level: targetLevel });
    } catch (error) {
      console.error("Error moving word:", error);
      setWordsByLevel(prev => {
        const newState = { ...prev };
        if (newState[targetLevel]) {
          newState[targetLevel] = newState[targetLevel].filter(w => w.id_word !== updatedWord.id_word);
        }
        if (newState[draggedWord.originalLevel] === null) {
          newState[draggedWord.originalLevel] = [draggedWord];
        } else if (newState[draggedWord.originalLevel]) {
          newState[draggedWord.originalLevel] = [...newState[draggedWord.originalLevel], draggedWord];
        }
        return newState;
      });
    }
    setDraggedWord(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMouseEnter = (rowIndex, colIndex, level) => {
    if (colIndex === 5) return; // Adjust for new column
    setHoveredCells(prev => ({
      ...prev,
      [level]: { row: rowIndex, col: colIndex }
    }));
  };

  const handleMouseLeave = (level) => {
    setHoveredCells(prev => ({
      ...prev,
      [level]: { row: null, col: null }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/words/", newWord);
      const createdWord = response.data;
      setWordsByLevel(prev => ({
        ...prev,
        [createdWord.word_level]: prev[createdWord.word_level] === null 
          ? [createdWord] 
          : [...prev[createdWord.word_level], createdWord]
      }));
      setNewWord({ word: "", part_of_speech: "", translate_word: "", word_level: "", rating: 1 });
      setFormErrors({});
    } catch (error) {
      setFormErrors(error.response?.data || { general: "Error adding word" });
    }
  };

  const handleDelete = async (wordId, level) => {
    const wordToDelete = wordsByLevel[level].find(w => w.id_word === wordId);
    setWordsByLevel(prev => ({
      ...prev,
      [level]: prev[level].filter(w => w.id_word !== wordId)
    }));

    try {
      await axios.delete(`http://localhost:8000/api/words/${wordId}/`);
    } catch (error) {
      console.error("Error deleting word:", error);
      setWordsByLevel(prev => ({
        ...prev,
        [level]: prev[level] ? [...prev[level], wordToDelete] : [wordToDelete]
      }));
    }
  };

  const handleChange = async (wordId, field, value, level) => {
    setWordsByLevel(prev => ({
      ...prev,
      [level]: prev[level].map(word =>
        word.id_word === wordId ? { ...word, [field]: value } : word
      )
    }));

    try {
      const url = `http://localhost:8000/api/words/${wordId}/`;
      await axios.put(url, { [field]: value });
    } catch (error) {
      console.error("Error updating word:", error);
    }
  };

  const requestSort = (level, key) => {
    setSortConfig(prev => {
      const currentConfig = prev[level] || { key: null, direction: 'ascending' };
      let direction = 'ascending';
      if (currentConfig.key === key && currentConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { ...prev, [level]: { key, direction } };
    });
  };

  const getSortedWords = (level, words) => {
    if (!words) return [];
    const config = sortConfig[level] || { key: null, direction: 'ascending' };
    if (!config.key) return words;

    const sorted = [...words];
    sorted.sort((a, b) => {
      const aValue = a[config.key];
      const bValue = b[config.key];
      if (aValue < bValue) return config.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const renderTable = (level, words) => {
    if (words === null) return <div>Loading...</div>;
    const hoveredCell = hoveredCells[level] || { row: null, col: null };
    const sortedWords = getSortedWords(level, words);

    return (
      <table 
        className={styles.admin_table}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(level)}
      >
        <thead>
          <tr>
            <th onClick={() => requestSort(level, 'id_word')}>ID</th>
            <th onClick={() => requestSort(level, 'word')}>Word</th>
            <th onClick={() => requestSort(level, 'part_of_speech')}>Part of Speech</th>
            <th onClick={() => requestSort(level, 'translate_word')}>Translation</th>
            <th onClick={() => requestSort(level, 'word_level')}>Level</th>
            <th onClick={() => requestSort(level, 'rating')}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {sortedWords.map((word, rowIndex) => (
            <tr 
              key={word.id_word}
              draggable
              onDragStart={() => handleDragStart(word, level)}
            >
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 0, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 0, hoveredCell)}`}
              >
                <div>{word.id_word}</div>
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 1, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 1, hoveredCell)}`}
              >
                <input
                  type="text"
                  value={word.word}
                  onChange={(e) => handleChange(word.id_word, "word", e.target.value, level)}
                  spellCheck="false"
                />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 2, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 2, hoveredCell)}`}
              >
                <input
                  type="text"
                  value={word.part_of_speech}
                  onChange={(e) => handleChange(word.id_word, "part_of_speech", e.target.value, level)}
                  spellCheck="false"
                />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 3, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 3, hoveredCell)}`}
              >
                <input
                  type="text"
                  value={word.translate_word}
                  onChange={(e) => handleChange(word.id_word, "translate_word", e.target.value, level)}
                  spellCheck="false"
                />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 4, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 4, hoveredCell)}`}
              >
                <div>{word.word_level}</div>
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 5, level)}
                onMouseLeave={() => handleMouseLeave(level)}
                className={`${styles.cell} ${getHoverClasses(rowIndex, 5, hoveredCell)}`}
              >
                <input
                  type="text"
                  value={word.rating}
                  onChange={(e) => handleChange(word.id_word, "rating", parseInt(e.target.value) || 1, level)}
                  min="1"
                />
              </td>
              <td className={styles.border_none}>
                <div
                  className={styles.iconContainer}
                  onClick={() => handleDelete(word.id_word, level)}
                >
                  <span className={`material-icons ${styles.icon}`}>
                    close
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getHoverClasses = (rowIndex, colIndex, hoveredCell) => {
    return `
      ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""}
      ${hoveredCell.col === colIndex ? styles.hoveredCol : ""}
      ${hoveredCell.row === rowIndex && hoveredCell.col === colIndex ? styles.hoveredCell : ""}
    `;
  };

  return (
    <div className={styles.admin_container}>
      <form onSubmit={handleSubmit} className={styles.admin_form}>
        <div>
          <input
            type="text"
            name="word"
            placeholder="Word"
            value={newWord.word}
            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.word && <span className={styles.error}>{formErrors.word.join(", ")}</span>}
        </div>
        <div>
          <input
            type="text"
            name="part_of_speech"
            placeholder="Part of Speech"
            value={newWord.part_of_speech}
            onChange={(e) => setNewWord({ ...newWord, part_of_speech: e.target.value })}
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.part_of_speech && <span className={styles.error}>{formErrors.part_of_speech.join(", ")}</span>}
        </div>
        <div>
          <input
            type="text"
            name="translate_word"
            placeholder="Translation"
            value={newWord.translate_word}
            onChange={(e) => setNewWord({ ...newWord, translate_word: e.target.value })}
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.translate_word && <span className={styles.error}>{formErrors.translate_word.join(", ")}</span>}
        </div>
        <div>
          <select
            name="word_level"
            value={newWord.word_level}
            onChange={(e) => setNewWord({ ...newWord, word_level: e.target.value })}
            className={styles.admin_input}
          >
            <option value="">Select Level</option>
            {englishLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {formErrors.word_level && <span className={styles.error}>{formErrors.word_level.join(", ")}</span>}
        </div>
        <div>
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            value={newWord.rating}
            onChange={(e) => setNewWord({ ...newWord, rating: parseInt(e.target.value) || 1 })}
            className={styles.admin_input}
            min="1"
          />
          {formErrors.rating && <span className={styles.error}>{formErrors.rating.join(", ")}</span>}
        </div>
        <div>
          <button type="submit" className={styles.admin_button}>
            Add Word
          </button>
        </div>
      </form>

      <div className={styles.accordion}>
        {englishLevels.map(level => (
          <div 
            key={level}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(level)}
          >
            <div 
              className={styles.levelHeader}
              onClick={() => toggleLevel(level)}
            >
              <h3>
                {level} ({wordsByLevel[level] === null ? "..." : wordsByLevel[level].length} words)
              </h3>
              <span>{expandedLevels[level] ? '▼' : '▶'}</span>
            </div>
            {expandedLevels[level] && renderTable(level, wordsByLevel[level])}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Words;