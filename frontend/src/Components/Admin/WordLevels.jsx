import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";
import debounce from "lodash/debounce";

function WordLevels() {
  const [levels, setLevels] = useState([]);
  const [newLevel, setNewLevel] = useState({ level: "" });
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = (rowIndex, colIndex) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
  };

  const handleMouseLeave = () => {
    setHoveredCell({ row: null, col: null });
  };

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await api.get("wordlevels/");
      setLevels(response.data);
      setFormErrors({});
      setFieldErrors({});
    } catch (error) {
      setFormErrors({ non_field_errors: "Не удалось загрузить уровни." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newLevel.level) errors.level = "Уровень обязателен.";
    if (newLevel.level.length > 10) errors.level = "Уровень не должен превышать 10 символов.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.post("wordlevels/", { level: newLevel.level.trim() });
      setNewLevel({ level: "" });
      setFormErrors({});
      await fetchLevels();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании уровня." });
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (id, field, value) => {
      try {
        await api.put(`wordlevels/${id}/`, { [field]: value });
        setFieldErrors((prev) => ({ ...prev, [id]: {} }));
      } catch (error) {
        const errors = error.response?.data || { [field]: "Ошибка при обновлении." };
        setFieldErrors((prev) => ({ ...prev, [id]: errors }));
        await fetchLevels(); // Revert to server state on error
      }
    }, 500),
    []
  );

  const handleChange = (id, field, value) => {
    setLevels((prev) =>
      prev.map((level) => (level.id === id ? { ...level, [field]: value } : level))
    );
    debouncedUpdate(id, field, value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот уровень?")) return;
    setLoading(true);
    try {
      await api.delete(`wordlevels/${id}/`);
      await fetchLevels();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при удалении уровня." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <div className={styles.loading}>Загрузка...</div>}
      <form onSubmit={handleSubmit} className={styles.admin_form}>
        <div>
          <input
            type="text"
            placeholder="Уровень (например, A1)"
            value={newLevel.level}
            onChange={(e) => setNewLevel({ ...newLevel, level: e.target.value })}
            className={`${styles.admin_input} ${formErrors.level ? styles.inputError : ""}`}
            disabled={loading}
            spellCheck="false"
            autoComplete="off"
          />
          {formErrors.level && <span className={styles.error}>{formErrors.level}</span>}
        </div>
        <button type="submit" className={styles.admin_button} disabled={loading}>
          Добавить уровень
        </button>
        {formErrors.non_field_errors && <span className={styles.error}>{formErrors.non_field_errors}</span>}
      </form>
      <div className={styles.tableContainerForSmallTables}>
        <table className={`${styles.admin_table} ${styles.centered}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Уровень</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level, rowIndex) => (
              <tr key={level.id}>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 0 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 0 ? styles.hoveredCell : ""
                  }`}
                >
                  <div>{level.id}</div>
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 1)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 1 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 1 ? styles.hoveredCell : ""
                  }`}
                >
                  <input
                    type="text"
                    value={level.level}
                    onChange={(e) => handleChange(level.id, "level", e.target.value.trim())}
                    className={`${styles.cellInput} ${
                      fieldErrors[level.id]?.level ? styles.inputError : ""
                    }`}
                    disabled={loading}
                    spellCheck="false"
                    autoComplete="off"
                  />
                  {fieldErrors[level.id]?.level && (
                    <span className={styles.error}>{fieldErrors[level.id].level}</span>
                  )}
                </td>
                <td className={styles.border_none}>
                  <div className={styles.iconContainer} onClick={() => handleDelete(level.id)}>
                    <span className={`material-icons ${styles.icon}`}>close</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default WordLevels;