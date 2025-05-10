import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";

function PartsOfSpeech() {
  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const response = await api.get("partsofspeech/");
      setParts(response.data);
      setFormErrors({});
    } catch (error) {
      setFormErrors({ non_field_errors: "Не удалось загрузить части речи." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("partsofspeech/", newPart);
      setNewPart({ name: "" });
      fetchParts();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании части речи." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (id, field, value) => {
    setParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
    try {
      await api.put(`partsofspeech/${id}/`, { [field]: value });
      fetchParts();
    } catch (error) {
      setFormErrors(error.response?.data || { non_field_errors: "Ошибка при обновлении части речи." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту часть речи?")) return;
    setLoading(true);
    try {
      await api.delete(`partsofspeech/${id}/`);
      fetchParts();
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
            {parts.map((part) => (
              <tr key={part.id}>
                <td>{part.id}</td>
                <td>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => handleChange(part.id, "name", e.target.value)}
                    className={styles.cellInput}
                    disabled={loading}
                  />
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