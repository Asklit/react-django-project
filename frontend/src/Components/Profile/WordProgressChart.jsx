import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import styles from "../../styles/profile.module.css";

const WordProgressChart = ({ levelProgress }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      const levels = ["A1", "A2", "B1", "B2", "C1"];

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: levels,
          datasets: [
            {
              label: "Изученные слова",
              data: levels.map((level) => levelProgress.studied_words[level] || 0),
              backgroundColor: "rgba(90, 101, 234, 0.6)",
              borderColor: "#5a65ea",
              borderWidth: 1,
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
                text: "Уровень",
                color: "#dcdee3",
                font: { size: 14, family: "'Roboto', sans-serif" },
              },
              ticks: { color: "#dcdee3" },
              grid: { display: false },
            },
            y: {
              type: "logarithmic",
              title: {
                display: true,
                text: "Количество изученных слов",
                color: "#dcdee3",
                font: { size: 14, family: "'Roboto', sans-serif" },
              },
              ticks: {
                color: "#dcdee3",
                callback: (value) => (Number.isInteger(Math.log10(value)) ? value : null),
                min: 1,
              },
              min: 1,
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
              borderColor: "#4f545c",
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  const level = context.label;
                  const studied = levelProgress.studied_words[level] || 0;
                  const total = levelProgress.total_words[level] || 1;
                  const percentage = total > 0 ? ((studied / total) * 100).toFixed(2) : 0;
                  return `Изучено: ${studied} из ${total} (${percentage}%)`;
                },
              },
            },
            annotation: {
              annotations: levels.map((level, index) => {
                const studied = levelProgress.studied_words[level] || 0;
                return {
                  type: "label",
                  xValue: index,
                  yValue: studied > 0 ? studied : 1,
                  content: studied.toString(),
                  color: "#dcdee3",
                  font: { size: 12, family: "'Roboto', sans-serif" },
                  position: "center",
                  yAdjust: -20,
                  enabled: studied > 0,
                };
              }),
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
  }, [levelProgress]);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.chartTitle}>Прогресс изучения слов по уровням</h2>
      <div className={styles.chartWrapper}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default WordProgressChart;