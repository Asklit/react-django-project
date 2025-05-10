import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";

function WordLevels() {
    const [levels, setLevels] = useState([]);
    const [newLevel, setNewLevel] = useState({ level: "" });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchLevels = async () => {
        setLoading(true);
        try {
            const response = await api.get("wordlevels/");
            setLevels(response.data);
            setFormErrors({});
        } catch (error) {
            setFormErrors({ non_field_errors: "Не удалось загрузить уровни." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await api.post("wordlevels/", newLevel);
            setNewLevel({ level: "" });
            fetchLevels();
        } catch (error) {
            setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании уровня." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (id, field, value) => {
        setLevels((prev) =>
            prev.map((level) => (level.id === id ? { ...level, [field]: value } : level))
        );
        try {
            await api.put(`wordlevels/${id}/`, { [field]: value });
            fetchLevels();
        } catch (error) {
            setFormErrors(error.response?.data || { non_field_errors: "Ошибка при обновлении уровня." });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот уровень?")) return;
        setLoading(true);
        try {
            await api.delete(`wordlevels/${id}/`);
            fetchLevels();
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
                        {levels.map((level) => (
                            <tr key={level.id}>
                                <td>{level.id}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={level.level}
                                        onChange={(e) => handleChange(level.id, "level", e.target.value)}
                                        className={styles.cellInput}
                                        disabled={loading}
                                    />
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