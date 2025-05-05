import React from "react";
import styles from "../../styles/profile.module.css";

const ActivityCalendar = ({ activities, maxWords, selectedYear }) => {
  const generateCalendar = () => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const calendar = [];
    let currentWeek = [];

    const filteredActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === selectedYear;
    });

    const firstDayOfWeek = (startDate.getDay() + 6) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: null, wordCount: 0, intensity: 0 });
    }

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const activity = filteredActivities.find((a) => a.date === dateStr);
      const wordCount = activity ? activity.word_count : 0;
      const intensity = wordCount ? Math.min(Math.ceil((wordCount / maxWords) * 4), 4) : 0;

      currentWeek.push({
        date: dateStr,
        wordCount,
        intensity,
      });

      if ((currentDate.getDay() + 6) % 7 === 6 || currentDate.getTime() === endDate.getTime()) {
        if (currentDate.getTime() === endDate.getTime() && currentWeek.length < 7) {
          while (currentWeek.length < 7) {
            currentWeek.push({ date: null, wordCount: 0, intensity: 0 });
          }
        }
        calendar.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  };

  const getMonthPositions = () => {
    const positions = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    let currentMonth = -1;
    let weekIndex = 0;
    let dayIndex = 0;

    const firstDayOfWeek = (startDate.getDay() + 6) % 7;
    dayIndex = firstDayOfWeek;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() !== currentMonth) {
        positions.push({
          month: d.getMonth(),
          weekIndex: Math.floor(dayIndex / 7),
        });
        currentMonth = d.getMonth();
      }

      dayIndex++;
      if ((d.getDay() + 6) % 7 === 6 || d.getTime() === endDate.getTime()) {
        weekIndex++;
      }
    }

    return positions;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.monthLabels}>
        {getMonthPositions().map((pos, index) => (
          <span
            key={index}
            className={styles.monthLabel}
            style={{ left: `${pos.weekIndex * 14}px` }}
          >
            {monthNames[pos.month]}
          </span>
        ))}
      </div>
      <div className={styles.calendar}>
        {generateCalendar().map((week, weekIndex) => (
          <div key={weekIndex} className={styles.week}>
            {week.map((day, dayIndex) => (
              <div
                key={day.date || `${weekIndex}-${dayIndex}`}
                className={`${styles.day} ${styles[`intensity-${day.intensity}`]} ${
                  !day.date ? styles.empty : ""
                }`}
                data-tooltip={
                  day.date ? `Дата: ${formatDate(day.date)}\nСлов: ${day.wordCount}` : ""
                }
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span>Меньше</span>
        <div className={styles.day}></div>
        <div className={`${styles.day} ${styles["intensity-1"]}`}></div>
        <div className={`${styles.day} ${styles["intensity-2"]}`}></div>
        <div className={`${styles.day} ${styles["intensity-3"]}`}></div>
        <div className={`${styles.day} ${styles["intensity-4"]}`}></div>
        <span>Больше</span>
      </div>
    </div>
  );
};

export default ActivityCalendar;