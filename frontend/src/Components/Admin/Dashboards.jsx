import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";
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
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: new Date(),
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await api.get("http://localhost:8000/api/users/list/");
        const wordsRes = await api.get("http://localhost:8000/api/words/list/");
        const adminsRes = await api.get("http://localhost:8000/api/admins/");

        const statsData = {
          users: usersRes.data.length,
          words: wordsRes.data.length,
          admins: adminsRes.data.length,
        };

        setStats(statsData);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching stats:`, {
          message: error.message,
          stack: error.stack,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null,
        });
      }
    };

    const fetchActivity = async () => {
      try {
        const params = {};
        if (dateRange.startDate) {
          params.start_date = dateRange.startDate.toISOString().split('T')[0];
        }
        if (dateRange.endDate) {
          params.end_date = dateRange.endDate.toISOString().split('T')[0];
        }

        console.log(`[${new Date().toISOString()}] Sending request to activity endpoint: GET http://localhost:8000/api/activity/users-daily/`, params);
        const res = await axios.get("http://localhost:8000/api/activity/users-daily/", { params });
        console.log(`[${new Date().toISOString()}] Activity request completed. Status: ${res.status}, Response length: ${res.data.length}`);

        setActivityData(res.data);
        console.log(`[${new Date().toISOString()}] Activity data updated:`, res.data);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching activity:`, {
          message: error.message,
          stack: error.stack,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null,
        });
      }
    };

    console.log(`[${new Date().toISOString()}] Starting dashboard data fetch`);
    fetchStats();
    fetchActivity();
    console.log(`[${new Date().toISOString()}] Dashboard data fetch initiated`);
  }, [dateRange.startDate, dateRange.endDate]);

  const resetDateRange = () => {
    setDateRange({ startDate: null, endDate: new Date() });
  };

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
        text: "Активные пользователи за выбранный период",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h3
        className={styles.dashboardTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Общая статистика
      </motion.h3>
      <motion.div
        className={styles.statsGrid}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className={styles.statItem}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <span>Пользователей:</span> {stats.users}
        </motion.div>
        <motion.div
          className={styles.statItem}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <span>Слов:</span> {stats.words}
        </motion.div>
        <motion.div
          className={styles.statItem}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <span>Администраторов:</span> {stats.admins}
        </motion.div>
      </motion.div>

      <motion.h3
        className={styles.dashboardTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        Активность пользователей
      </motion.h3>
      <motion.div
        className={styles.datePickerCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className={styles.datePickerContainer}>
          <motion.div
            className={styles.datePickerWrapper}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <label>Начальная дата:</label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Выберите начальную дату"
              className={styles.datePickerInput}
              popperClassName={styles.datePickerPopper}
              popperPlacement="top-start"
              portalId="root-portal"
            />
          </motion.div>
          <motion.div
            className={styles.datePickerWrapper}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <label>Конечная дата:</label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Выберите конечную дату"
              className={styles.datePickerInput}
              popperClassName={styles.datePickerPopper}
              popperPlacement="top-start"
              portalId="root-portal"
            />
          </motion.div>
          <motion.button
            className={styles.resetButton}
            onClick={resetDateRange}
            whileHover={{ scale: 1.05, backgroundColor: "var(--error)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Сбросить
          </motion.button>
        </div>
      </motion.div>
      <motion.div
        className={styles.fullWidthChartContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Line data={chartData} options={chartOptions} />
      </motion.div>
    </motion.div>
  );
}

export default Dashboards;