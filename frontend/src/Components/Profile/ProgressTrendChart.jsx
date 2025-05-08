import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { format, parseISO } from "date-fns";
import axios from "axios";
import styles from "../../styles/profile.module.css";

const ProgressTrendChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/activity/?year=${new Date().getFullYear()}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        setActivities(response.data.activities);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке активности:", err);
        setError("Не удалось загрузить данные активности");
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    if (chartRef.current && activities.length > 0 && !loading) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }


      const labels = activities.map((activity) =>
        format(parseISO(activity.date), "dd MMM yyyy")
      );
      const wordCounts = activities.map((activity) => activity.word_count);


      const annotations = activities.reduce((acc, activity, index) => {
        const wordCount = activity.word_count;

        const avgWordCount =
          wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
        if (index % 10 === 0 || wordCount > avgWordCount * 1.5) {
          acc[`annotation${index}`] = {
            type: "line",
            xMin: index,
            xMax: index,
            yMin: 0,
            yMax: wordCount,
            borderColor: "rgba(255, 64, 129, 0.5)", 
            borderWidth: 1,
            label: {
              content: `${wordCount} слов`,
              display: true,
              position: "end",
              color: "#dcdee3",
              font: { size: 12, family: "'Roboto', sans-serif" },
              backgroundColor: "rgba(44, 47, 51, 0.8)", // --surface
              padding: 4,
            },
          };
        }
        return acc;
      }, {});

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Изученные слова",
              data: wordCounts,
              backgroundColor: "rgba(90, 101, 234, 0.6)",
              borderColor: "#5a65ea", 
              borderWidth: 2,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Дата сессии",
                color: "#dcdee3", // --text
                font: { size: 14, family: "'Roboto', sans-serif" },
              },
              ticks: {
                color: "#dcdee3",
                maxRotation: 45,
                minRotation: 45,
                maxTicksLimit: 10, // Limit number of ticks for readability
              },
            },
            y: {
              title: {
                display: true,
                text: "Количество слов",
                color: "#dcdee3",
                font: { size: 14, family: "'Roboto', sans-serif" },
              },
              ticks: { color: "#dcdee3" },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "#dcdee3",
                font: { family: "'Roboto', sans-serif" },
              },
            },
            tooltip: {
              backgroundColor: "#2c2f33",
              titleColor: "#dcdee3",
              bodyColor: "#dcdee3",
              callbacks: {
                label: (context) => `${context.parsed.y} слов`,
              },
            },
            annotation: {
              annotations,
            },
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activities, loading]);

  if (loading) {
    return <div className={styles.chartContainer}>Загрузка...</div>;
  }

  if (error) {
    return <div className={`${styles.chartContainer} ${styles.errorMessage}`}>{error}</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Прогресс изучения слов по сессиям</h2>
      <div className={styles.chartWrapper}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ProgressTrendChart;