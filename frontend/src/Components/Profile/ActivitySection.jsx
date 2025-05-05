import React from "react";
import ActivityCalendar from "./ActivityCalendar";
import styles from "../../styles/profile.module.css";

const ActivitySection = ({ activities, maxWords, selectedYear, setSelectedYear }) => {
  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityHeader}>
        <h2>Активность за {selectedYear}</h2>
        <div className={styles.yearSelector}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ActivityCalendar activities={activities} maxWords={maxWords} selectedYear={selectedYear} />
    </div>
  );
};

export default ActivitySection;