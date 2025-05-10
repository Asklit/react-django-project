import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";
import debounce from "lodash/debounce";

function PartsOfSpeech() {
  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: "" });
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

  const fetchParts = async () => {
    setLoading(true);
    try {
      const response = await api.get("partsofspeech/");
      setParts(response.data);
      setFormErrors({});
      setFieldErrors({});
    } catch (error) {
      setFormErrors({ non_field_errors: "Не удалось загрузить части речи." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newPart.name) errors.name = "Название части речи обязательно.";
    if (newPart.name.length > 50) errors.name = "Название не должно превышать 50 символов.";
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
      await api.post("partsofspeech/", { name: newPart.name.trim() });
      setNewPart({ name: "" });
      setFormErrors({});
      await fetchParts();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании части речи." });
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (id, field, value) => {
      try {
        await api.put(`partsofspeech/${id}/`, { [field]: value });
        setFieldErrors((prev) => ({ ...prev, [id]: {} }));
      } catch (error) {
        const errors = error.response?.data || { [field]: "Ошибка при обновлении." };
        setFieldErrors((prev) => ({ ...prev, [id]: errors }));
        await fetchParts(); // Revert to server state on error
      }
    }, 500),
    []
  );

  const handleChange = (id, field, value) => {
    setParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
    debouncedUpdate(id, field, value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту часть речи?")) return;
    setLoading(true);
    try {
      await api.delete(`partsofspeech/${id}/`);
      await fetchParts();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при удалении части речи." });
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
            placeholder="Название части речи"
            value={newPart.name}
            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
            className={`${styles.admin_input} ${formErrors.name ? styles.inputError : ""}`}
            disabled={loading}
            spellCheck="false"
            autoComplete="off"
          />
          {formErrors.name && <span className={styles.error}>{formErrors.name}</span>}
        </div>
        <button type="submit" className={styles.admin_button} disabled={loading}>
          Добавить часть речи
        </button>
        {formErrors.non_field_errors && <span className={styles.error}>{formErrors.non_field_errors}</span>}
      </form>
      <div className={styles.tableContainerForSmallTables}>
        <table className={`${styles.admin_table} ${styles.centered}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, rowIndex) => (
              <tr key={part.id}>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 0 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 0 ? styles.hoveredCell : ""
                  }`}
                >
                  <div>{part.id}</div>
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
                    value={part.name}
                    onChange={(e) => handleChange(part.id, "name", e.target.value.trim())}
                    className={`${styles.cellInput} ${
                      fieldErrors[part.id]?.name ? styles.inputError : ""
                    }`}
                    disabled={loading}
                    spellCheck="false"
                    autoComplete="off"
                  />
                  {fieldErrors[part.id]?.name && (
                    <span className={styles.error}>{fieldErrors[part.id].name}</span>
                  )}
                </td>
                <td className={styles.border_none}>
                  <div className={styles.iconContainer} onClick={() => handleDelete(part.id)}>
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

export default PartsOfSpeech;