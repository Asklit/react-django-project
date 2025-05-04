import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/profile.module.css";

const Profile = () => {
  const [user, setUser] = useState({ username: "" });
  const [activities, setActivities] = useState([]);
  const [maxWords, setMaxWords] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const isAuthenticated = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Пожалуйста, войдите в систему");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:8000/api/users/me/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUser(userResponse.data);

        const activityResponse = await axios.get(`http://localhost:8000/api/users/activity/?year=${selectedYear}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setActivities(activityResponse.data.activities);
        setMaxWords(activityResponse.data.max_words);
        setError(null);
      } catch (error) {
        console.error("Ошибка при загрузке данных профиля:", error);
        setError("Не удалось загрузить данные профиля");
      }
    };
    fetchUserData();
  }, [isAuthenticated, selectedYear]);

  const generateCalendar = () => {
    const startDate = new Date(selectedYear, 0, 1); // 1 января выбранного года
    const endDate = new Date(selectedYear, 11, 31); // 31 декабря выбранного года
    const calendar = [];
    let currentWeek = [];

    // Фильтруем активности текущего года
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate.getFullYear() === selectedYear;
    });

    // Получаем день недели для 1 января (0 - понедельник, 6 - воскресенье)
    const firstDayOfWeek = (startDate.getDay() + 6) % 7; // Сдвигаем, чтобы понедельник был 0

    // Добавляем пустые ячейки для дней ДО 1 января (чтобы понедельник был первым)
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: null, wordCount: 0, intensity: 0 });
    }

    // Проходим по всем дням года
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const activity = filteredActivities.find((a) => a.date === dateStr);
      const wordCount = activity ? activity.word_count : 0;
      const intensity = wordCount ? Math.min(Math.ceil((wordCount / maxWords) * 4), 4) : 0;

      currentWeek.push({
        date: dateStr,
        wordCount,
        intensity
      });

      // Если это воскресенье (день недели = 6) или последний день года
      if ((currentDate.getDay() + 6) % 7 === 6 || currentDate.getTime() === endDate.getTime()) {
        // Если это последний день года и неделя не полная, добавляем пустые дни до воскресенья
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

    // Добавляем смещение для первого января
    const firstDayOfWeek = (startDate.getDay() + 6) % 7;
    dayIndex = firstDayOfWeek;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() !== currentMonth) {
        positions.push({ 
          month: d.getMonth(), 
          weekIndex: Math.floor(dayIndex / 7) 
        });
        currentMonth = d.getMonth();
      }
      
      dayIndex++;
      
      // Если воскресенье или последний день года
      if ((d.getDay() + 6) % 7 === 6 || d.getTime() === endDate.getTime()) {
        weekIndex++;
      }
    }
    
    return positions;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

  if (error) {
    return <div className={styles.profileContainer}>{error}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.avatar}></div>
        <h1 className={styles.username}>{user.username || "Загрузка..."}</h1>
      </div>
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
                    className={`${styles.day} ${styles[`intensity-${day.intensity}`]} ${!day.date ? styles.empty : ''}`}
                    data-tooltip={day.date ? `Дата: ${formatDate(day.date)}\nСлов: ${day.wordCount}` : ''}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.legend}>
          <span>Меньше</span>
          <div className={styles.day}></div>
          <div className={styles.day + " " + styles["intensity-1"]}></div>
          <div className={styles.day + " " + styles["intensity-2"]}></div>
          <div className={styles.day + " " + styles["intensity-3"]}></div>
          <div className={styles.day + " " + styles["intensity-4"]}></div>
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;