import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import styles from "../../styles/AdminPanel.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboards() {
  const [stats, setStats] = useState({ users: 0, words: 0, admins: 0 });
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, wordsRes, adminsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users/list/"),
          axios.get("http://localhost:8000/api/words/list/"),
          axios.get("http://localhost:8000/api/admins/"),
        ]);
        setStats({
          users: usersRes.data.length,
          words: wordsRes.data.length,
          admins: adminsRes.data.length,
        });
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/activity/users-daily/");
        setActivityData(res.data);
      } catch (error) {
        console.error("Ошибка загрузки активности пользователей:", error);
      }
    };

    fetchStats();
    fetchActivity();
  }, []);

  const chartData = {
    labels: activityData.map((a) => a.date),
    datasets: [
      {
        label: "Активные пользователи",
        data: activityData.map((a) => a.user_count),
        borderColor: "rgba(90, 101, 234, 1)",
        backgroundColor: "rgba(90, 101, 234, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#dcdee3",
          font: { size: 14, family: "'Roboto', sans-serif" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(44, 47, 51, 0.8)",
        titleColor: "#dcdee3", 
        bodyColor: "#dcdee3", 
        callbacks: {
          label: (context) => `${context.parsed.y} пользователей`,
        },
      },
      title: {
        display: true,
        text: "Активные пользователи за последние 30 дней",
        color: "#dcdee3", 
        font: { size: 16, family: "'Roboto', sans-serif" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#dcdee3" }, 
        grid: { color: "rgba(255, 255, 255, 0.1)" }, 
      },
      y: {
        ticks: { color: "#dcdee3" }, 
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <motion.div
      className={styles.dashboardContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={styles.dashboardTitle}>Общая статистика</h3>
      <div className={styles.statsGrid}>
        <motion.div
          className={styles.statItem}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span>Пользователей:</span> {stats.users}
        </motion.div>
        <motion.div
          className={styles.statItem}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span>Слов:</span> {stats.words}
        </motion.div>
        <motion.div
          className={styles.statItem}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <span>Администраторов:</span> {stats.admins}
        </motion.div>
      </div>

      <h3 className={styles.dashboardTitle}>Активность пользователей</h3>
      <motion.div
        className={styles.fullWidthChartContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Line data={chartData} options={chartOptions} />
      </motion.div>
    </motion.div>
  );
}

export default Dashboards;