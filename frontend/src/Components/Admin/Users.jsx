import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api";
import DateDisplay from "./DateFormat";
import debounce from "lodash/debounce";

function Users() {
  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [loading, setLoading] = useState(false);
  const [englishLevelOptions, setEnglishLevelOptions] = useState([
    { value: "A1", label: "A1 - Начальный" },
    { value: "A2", label: "A2 - Элементарный" },
    { value: "B1", label: "B1 - Средний" },
    { value: "B2", label: "B2 - Выше среднего" },
    { value: "C1", label: "C1 - Продвинутый" },
    { value: "C2", label: "C2 - Профессиональный" },
  ]);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    english_level: "A1",
  });

  const handleMouseEnter = (rowIndex, colIndex) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
  };

  const handleMouseLeave = () => {
    setHoveredCell({ row: null, col: null });
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const response = await api.get("users/list/");
      setUsers(response.data);
      setFormErrors({});
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      setFormErrors({ non_field_errors: "Не удалось загрузить список пользователей." });
    } finally {
      setLoading(false);
    }
  };

  // const fetchEnglishLevels = async () => {
  //   try {
  //     const response = await api.get("levels/");
  //     const levels = response.data.map((level) => ({
  //       value: level.level,
  //       label: `${level.level} - ${level.description}`,
  //     }));
  //     setEnglishLevelOptions(levels);
  //   } catch (error) {
  //     console.error("Error fetching English levels:", error.response?.data || error.message);
  //   }
  // };

  useEffect(() => {
    fetchUsersData();
    // fetchEnglishLevels();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newUser.username) errors.username = "Имя пользователя обязательно.";
    if (newUser.username.length > 20) errors.username = "Имя пользователя не должно превышать 20 символов.";
    if (!newUser.email) errors.email = "Электронная почта обязательна.";
    if (newUser.email.length > 20) errors.email = "Электронная почта не должна превышать 20 символов.";
    if (!/@\w+\.\w+/.test(newUser.email)) errors.email = "Введите действительный адрес электронной почты.";
    if (!newUser.password) errors.password = "Пароль обязателен.";
    if (newUser.password.length < 8) errors.password = "Пароль должен содержать не менее 8 символов.";
    if (!englishLevelOptions.some((opt) => opt.value === newUser.english_level)) {
      errors.english_level = "Выберите корректный уровень английского.";
    }
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
      const response = await api.post("users/", {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        english_level: newUser.english_level,
      });
      setNewUser({
        username: "",
        email: "",
        password: "",
        english_level: "A1",
      });
      setFormErrors({});
      await fetchUsersData();
    } catch (error) {
      const errors = error.response?.data || { non_field_errors: "Ошибка при создании пользователя." };
      console.error("Error creating user:", errors);
      setFormErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`users/${userId}/`);
      await fetchUsersData();
      setFormErrors({});
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || "Ошибка при удалении пользователя.";
      setFormErrors({ non_field_errors: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (userId, field, value) => {
      try {
        const response = await api.put(`users/${userId}/`, { [field]: value });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id_user === userId ? { ...user, [field]: value } : user
          )
        );
        setFieldErrors((prev) => ({ ...prev, [userId]: {} }));
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
        const errors = error.response?.data || { [field]: "Ошибка при обновлении." };
        setFieldErrors((prev) => ({
          ...prev,
          [userId]: errors,
        }));
        await fetchUsersData(); 
      }
    }, 500),
    []
  );

  const handleChange = (userId, field, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id_user === userId ? { ...user, [field]: value } : user
      )
    );
    debouncedUpdate(userId, field, value);
  };

  return (
    <>
      {loading && <div className={styles.loading}>Загрузка...</div>}
      <form onSubmit={handleSubmit} className={styles.admin_form}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Пользователь"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className={`${styles.admin_input} ${formErrors.username ? styles.inputError : ""}`}
            spellCheck="false"
            autoComplete="off"
            disabled={loading}
          />
          {formErrors.username && (
            <span className={styles.error}>{formErrors.username}</span>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className={`${styles.admin_input} ${formErrors.email ? styles.inputError : ""}`}
            spellCheck="false"
            autoComplete="off"
            disabled={loading}
          />
          {formErrors.email && (
            <span className={styles.error}>{formErrors.email}</span>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className={`${styles.admin_input} ${formErrors.password ? styles.inputError : ""}`}
            spellCheck="false"
            autoComplete="off"
            disabled={loading}
          />
          {formErrors.password && (
            <span className={styles.error}>{formErrors.password}</span>
          )}
        </div>
        <div>
          <select
            name="english_level"
            value={newUser.english_level}
            onChange={(e) =>
              setNewUser({ ...newUser, english_level: e.target.value })
            }
            className={`${styles.admin_input} ${styles.dropdown} ${formErrors.english_level ? styles.inputError : ""}`}
            disabled={loading}
          >
            {englishLevelOptions.map((option) => (
              <option key={option.value} value={option.value} className={styles.dropdownOption}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.english_level && (
            <span className={styles.error}>{formErrors.english_level}</span>
          )}
        </div>
        <div>
          <button type="submit" className={styles.admin_button} disabled={loading}>
            Добавить пользователя
          </button>
          {formErrors.non_field_errors && (
            <span className={styles.error}>{formErrors.non_field_errors}</span>
          )}
        </div>
      </form>
      <table className={styles.admin_table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Уровень английского</th>
            <th>Почта подтверждена</th>
            <th>Дата создания аккаунта</th>
            <th>Дата изменения пароля</th>
            <th>Последний вход в аккаунт</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.sort((a, b) => a.id_user - b.id_user).map((user, rowIndex) => (
            <tr key={user.id_user}>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                  hoveredCell.col === 0 ? styles.hoveredCol : ""
                } ${
                  hoveredCell.row === rowIndex && hoveredCell.col === 0 ? styles.hoveredCell : ""
                }`}
              >
                <div>{user.id_user}</div>
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
                  value={user.username}
                  onChange={(e) => handleChange(user.id_user, "username", e.target.value.trim())}
                  spellCheck="false"
                  className={`${styles.cellInput} ${
                    fieldErrors[user.id_user]?.username ? styles.inputError : ""
                  }`}
                  disabled={loading}
                />
                {fieldErrors[user.id_user]?.username && (
                  <span className={styles.error}>{fieldErrors[user.id_user].username}</span>
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
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleChange(user.id_user, "email", e.target.value.trim())}
                  spellCheck="false"
                  className={`${styles.cellInput} ${
                    fieldErrors[user.id_user]?.email ? styles.inputError : ""
                  }`}
                  disabled={loading}
                />
                {fieldErrors[user.id_user]?.email && (
                  <span className={styles.error}>{fieldErrors[user.id_user].email}</span>
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
                <select
                  value={user.english_level}
                  onChange={(e) => handleChange(user.id_user, "english_level", e.target.value)}
                  className={`${styles.cellInput} ${styles.dropdown} ${
                    fieldErrors[user.id_user]?.english_level ? styles.inputError : ""
                  }`}
                  disabled={loading}
                >
                  {englishLevelOptions.map((option) => (
                    <option key={option.value} value={option.value} className={styles.dropdownOption}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors[user.id_user]?.english_level && (
                  <span className={styles.error}>{fieldErrors[user.id_user].english_level}</span>
                )}
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 4)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${
                  hoveredCell.row === rowIndex ? styles.hoveredRow : ""
                } ${hoveredCell.col === 4 ? styles.hoveredCol : ""} ${
                  hoveredCell.row === rowIndex && hoveredCell.col === 4 ? styles.hoveredCell : ""
                }`}
              >
                <div className={styles.checkbox_wrapper}>
                  <input
                    type="checkbox"
                    checked={user.is_email_verificated}
                    onChange={(e) =>
                      handleChange(user.id_user, "is_email_verificated", e.target.checked)
                    }
                    disabled={loading}
                  />
                  <svg viewBox="0 0 35.6 35.6">
                    <circle className={styles.background} cx="17.8" cy="17.8" r="17.8"></circle>
                    <circle className={styles.stroke} cx="17.8" cy="17.8" r="14.37"></circle>
                    <polyline
                      className={`${styles.check} ${
                        user.is_email_verificated ? styles.visible : styles.hidden
                      }`}
                      points="11.78 18.12 15.55 22.23 25.17 12.87"
                    ></polyline>
                    <line
                      className={`${styles.cross} ${
                        !user.is_email_verificated ? styles.visible : styles.hidden
                      }`}
                      x1="10"
                      y1="10"
                      x2="25"
                      y2="25"
                    />
                    <line
                      className={`${styles.cross} ${
                        !user.is_email_verificated ? styles.visible : styles.hidden
                      }`}
                      x1="25"
                      y1="10"
                      x2="10"
                      y2="25"
                    />
                  </svg>
                </div>
                {fieldErrors[user.id_user]?.is_email_verificated && (
                  <span className={styles.error}>
                    {fieldErrors[user.id_user].is_email_verificated}
                  </span>
                )}
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 5)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                  hoveredCell.col === 5 ? styles.hoveredCol : ""
                } ${
                  hoveredCell.row === rowIndex && hoveredCell.col === 5 ? styles.hoveredCell : ""
                }`}
              >
                <DateDisplay dateString={user.account_created_at} />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 6)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                  hoveredCell.col === 6 ? styles.hoveredCol : ""
                } ${
                  hoveredCell.row === rowIndex && hoveredCell.col === 6 ? styles.hoveredCell : ""
                }`}
              >
                <DateDisplay dateString={user.password_changed_at} />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 7)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${
                  hoveredCell.col === 7 ? styles.hoveredCol : ""
                } ${
                  hoveredCell.row === rowIndex && hoveredCell.col === 7 ? styles.hoveredCell : ""
                }`}
              >
                <DateDisplay dateString={user.last_day_online} />
              </td>
              <td className={styles.border_none}>
                <div
                  className={styles.iconContainer}
                  onClick={() => handleDelete(user.id_user)}
                >
                  <span className={`material-icons ${styles.icon}`}>close</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Users;