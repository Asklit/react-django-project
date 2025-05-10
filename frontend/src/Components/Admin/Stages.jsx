import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";
import debounce from "lodash/debounce";

function Stages() {
  const [stages, setStages] = useState([]);
  const [newStage, setNewStage] = useState({ name: "", next_stage: null, interactions_needed: 0 });
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

  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await api.get("stages/");
      setStages(response.data);
      setFormErrors({});
      setFieldErrors({});
    } catch (error) {
      setFormErrors({ non_field_errors: "Не удалось загрузить этапы." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newStage.name) errors.name = "Название этапа обязательно.";
    if (newStage.name.length > 50) errors.name = "Название не должно превышать 50 символов.";
    if (newStage.interactions_needed < 0) errors.interactions_needed = "Количество взаимодействий не может быть отрицательным.";
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
      await api.post("stages/", { ...newStage, name: newStage.name.trim() });
      setNewStage({ name: "", next_stage: null, interactions_needed: 0 });
      setFormErrors({});
      await fetchStages();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании этапа." });
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (id, field, value) => {
      try {
        await api.put(`stages/${id}/`, { [field]: value });
        setFieldErrors((prev) => ({ ...prev, [id]: {} }));
      } catch (error) {
        const errors = error.response?.data || { [field]: "Ошибка при обновлении." };
        setFieldErrors((prev) => ({ ...prev, [id]: errors }));
        await fetchStages(); // Revert to server state on error
      }
    }, 500),
    []
  );

  const handleChange = (id, field, value) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage))
    );
    debouncedUpdate(id, field, field === "interactions_needed" ? parseInt(value) || 0 : value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот этап?")) return;
    setLoading(true);
    try {
      await api.delete(`stages/${id}/`);
      await fetchStages();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при удалении этапа." });
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
            placeholder="Название этапа"
            value={newStage.name}
            onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
            className={`${styles.admin_input} ${formErrors.name ? styles.inputError : ""}`}
            disabled={loading}
            spellCheck="false"
            autoComplete="off"
          />
          {formErrors.name && <span className={styles.error}>{formErrors.name}</span>}
        </div>
        <div>
          <select
            value={newStage.next_stage || ""}
            onChange={(e) => setNewStage({ ...newStage, next_stage: e.target.value || null })}
            className={`${styles.admin_input} ${styles.dropdown}`}
            disabled={loading}
          >
            <option value="">Нет</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="number"
            placeholder="Взаимодействий нужно"
            value={newStage.interactions_needed}
            onChange={(e) => setNewStage({ ...newStage, interactions_needed: parseInt(e.target.value) || 0 })}
            className={`${styles.admin_input} ${formErrors.interactions_needed ? styles.inputError : ""}`}
            disabled={loading}
          />
          {formErrors.interactions_needed && <span className={styles.error}>{formErrors.interactions_needed}</span>}
        </div>
        <button type="submit" className={styles.admin_button} disabled={loading}>
          Добавить этап
        </button>
        {formErrors.non_field_errors && <span className={styles.error}>{formErrors.non_field_errors}</span>}
      </form>
      <div className={styles.tableContainerForSmallTables}>
        <table className={`${styles.admin_table} ${styles.centered}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Следующий этап</th>
              <th>Взаимодействий нужно</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, rowIndex) => (
              <tr key={stage.id}>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 0 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 0 ? styles.hoveredCell : ""
                  }`}
                >
                  <div>{stage.id}</div>
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
                    value={stage.name}
                    onChange={(e) => handleChange(stage.id, "name", e.target.value.trim())}
                    className={`${styles.cellInput} ${
                      fieldErrors[stage.id]?.name ? styles.inputError : ""
                    }`}
                    disabled={loading}
                    spellCheck="false"
                    autoComplete="off"
                  />
                  {fieldErrors[stage.id]?.name && (
                    <span className={styles.error}>{fieldErrors[stage.id].name}</span>
                  )}
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 2)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 2 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 2 ? styles.hoveredCell : ""
                  }`}
                >
                  <select
                    value={stage.next_stage || ""}
                    onChange={(e) => handleChange(stage.id, "next_stage", e.target.value || null)}
                    className={`${styles.cellInput} ${styles.dropdown} ${
                      fieldErrors[stage.id]?.next_stage ? styles.inputError : ""
                    }`}
                    disabled={loading}
                  >
                    <option value="">Нет</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors[stage.id]?.next_stage && (
                    <span className={styles.error}>{fieldErrors[stage.id].next_stage}</span>
                  )}
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 3)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                    hoveredCell.col === 3 ? styles.hoveredCol : ""
                  } ${
                    hoveredCell.row === rowIndex && hoveredCell.col === 3 ? styles.hoveredCell : ""
                  }`}
                >
                  <input
                    type="number"
                    value={stage.interactions_needed}
                    onChange={(e) => handleChange(stage.id, "interactions_needed", parseInt(e.target.value) || 0)}
                    className={`${styles.cellInput} ${
                      fieldErrors[stage.id]?.interactions_needed ? styles.inputError : ""
                    }`}
                    disabled={loading}
                  />
                  {fieldErrors[stage.id]?.interactions_needed && (
                    <span className={styles.error}>{fieldErrors[stage.id].interactions_needed}</span>
                  )}
                </td>
                <td className={styles.border_none}>
                  <div className={styles.iconContainer} onClick={() => handleDelete(stage.id)}>
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

export default Stages;