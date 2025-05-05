import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileHeader from "./Profile/ProfileHeader";
import ActivitySection from "./Profile/ActivitySection";
import WordProgressChart from "./Profile/WordProgressChart";
import TotalWordsWidget from "./Profile/TotalWordsWidget";
import ProgressTrendChart from "./Profile/ProgressTrendChart";
import styles from "../styles/profile.module.css";

const Profile = () => {
  const [user, setUser] = useState({ username: "" });
  const [activities, setActivities] = useState([]);
  const [stageCounts, setStageCounts] = useState({
    introduction: 0,
    active_recall: 0,
    consolidation: 0,
    spaced_repetition: 0,
    active_usage: 0,
  });
  const [levelProgress, setLevelProgress] = useState({
    studied_words: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 },
    total_words: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 },
  });
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
        const [userResponse, activityResponse, stageResponse, levelResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/users/me/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
          axios.get(`http://localhost:8000/api/users/activity/?year=${selectedYear}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
          axios.get("http://localhost:8000/api/words/stage-counts/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
          axios.get("http://localhost:8000/api/words/level-progress/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
        ]);

        setUser(userResponse.data);
        setActivities(activityResponse.data.activities);
        setMaxWords(activityResponse.data.max_words);
        setStageCounts(stageResponse.data);
        setLevelProgress(levelResponse.data);
        setError(null);
      } catch (error) {
        console.error("Ошибка при загрузке данных профиля:", error);
        setError("Не удалось загрузить данные профиля");
      }
    };
    fetchUserData();
  }, [isAuthenticated, selectedYear]);

  if (error) {
    return <div className={`${styles.profileContainer} ${styles.errorMessage}`}>{error}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <ProfileHeader username={user.username} />
      <ActivitySection
        activities={activities}
        maxWords={maxWords}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
      <div className={styles.widgetsContainer}>
        <TotalWordsWidget stageCounts={stageCounts} levelProgress={levelProgress} />
        <WordProgressChart levelProgress={levelProgress} />
      </div>
      <div className={styles.fullWidthChartContainer}>
        <ProgressTrendChart />
      </div>
    </div>
  );
};

export default Profile;