import React from "react";
import styles from "../../styles/profile.module.css";

const TotalWordsWidget = ({ stageCounts, levelProgress }) => {
  const studiedWords = stageCounts?.active_usage || 0;
  const totalWords = Object.values(levelProgress?.total_words || {}).reduce(
    (sum, count) => sum + (count || 0),
    0
  );

  return (
    <div className={styles.totalWordsWidget}>
      <h2 className={styles.chartTitle}>Общий прогресс изучения</h2>
      <div className={styles.widgetContent}>
        <span className={styles.wordsRatio}>
          {studiedWords} / {totalWords}
        </span>
        <span className={styles.wordsLabel}>Изучено / Всего слов</span>
      </div>
    </div>
  );
};

export default TotalWordsWidget;