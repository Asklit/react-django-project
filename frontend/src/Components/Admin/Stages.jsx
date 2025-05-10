import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";

function Stages() {
    const [stages, setStages] = useState([]);
    const [newStage, setNewStage] = useState({ name: "", next_stage: null, interactions_needed: 0 });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchStages = async () => {
        setLoading(true);
        try {
            const response = await api.get("stages/");
            setStages(response.data);
            setFormErrors({});
        } catch (error) {
            setFormErrors({ non_field_errors: "Не удалось загрузить этапы." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStages();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await api.post("stages/", newStage);
            setNewStage({ name: "", next_stage: null, interactions_needed: 0 });
            fetchStages();
        } catch (error) {
            setFormErrors(error.response?.data || { non_field_errors: "Ошибка при создании этапа." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (id, field, value) => {
        setStages((prev) =>
            prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage))
        );
        try {
            await api.put(`stages/${id}/`, { [field]: value });
            fetchStages();
        } catch (error) {
            setFormErrors(error.response?.data || { non_field_errors: "Ошибка при обновлении этапа." });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот этап?")) return;
        setLoading(true);
        try {
            await api.delete(`stages/${id}/`);
            fetchStages();
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
                        {stages.map((stage) => (
                            <tr key={stage.id}>
                                <td>{stage.id}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={stage.name}
                                        onChange={(e) => handleChange(stage.id, "name", e.target.value)}
                                        className={styles.cellInput}
                                        disabled={loading}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={stage.next_stage || ""}
                                        onChange={(e) => handleChange(stage.id, "next_stage", e.target.value || null)}
                                        className={`${styles.cellInput} ${styles.dropdown}`}
                                        disabled={loading}
                                    >
                                        <option value="">Нет</option>
                                        {stages.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={stage.interactions_needed}
                                        onChange={(e) => handleChange(stage.id, "interactions_needed", parseInt(e.target.value) || 0)}
                                        className={styles.cellInput}
                                        disabled={loading}
                                    />
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