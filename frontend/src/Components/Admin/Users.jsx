import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import axios from "axios";
import DateDisplay from "./DateFormat";

function Users() {
  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password_hash: "",
    english_level: "",
  });

  const handleMouseEnter = (rowIndex, colIndex) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
  };

  const handleMouseLeave = () => {
    setHoveredCell({ row: null, col: null });
  };

  const fetchUsersData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users/list/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let response;
    try {
      response = await axios.post(
        "http://localhost:8000/api/users/",
        newUser
      );
      setNewUser({
        username: "",
        email: "",
        password_hash: "",
        english_level: "",
      });
      setFormErrors({});
      fetchUsersData();
    } catch (error) {
      const errors = error.response.data;
      console.error(
        "There has been a problem with create user operation:",
        errors
      );
      setFormErrors(errors);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const url = `http://localhost:8000/api/users/${userId}/`;

      console.log(`Deleting user at URL: ${url}`);

      const response = await axios.delete(url);

      console.log("User deleted successfully:", response.data);
    } catch (error) {
      console.error(
        "There has been a problem with the delete user operation:",
        error.response ? error.response.data : error.message
      );
    }

    fetchUsersData();
  };

  const handleChange = async (userId, field, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id_user === userId ? { ...user, [field]: value } : user
      )
    );

    try {
      const url = `http://localhost:8000/api/users/${userId}/`;
      const updatedData = {
        [field]: value,
      };

      console.log(`Updating user at URL: ${url}`, updatedData);
      const response = await axios.put(url, updatedData);
      console.log("User updated successfully:", response.data);
    } catch (error) {
      console.error(
        "There has been a problem with the update user operation:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)} className={styles.admin_form}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Пользователь"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className={styles.admin_input}
            spellCheck="false"
            autocomplete="off"
          />
          {formErrors.username && (
            <span className={styles.error}>
              {formErrors.username.join(", ")}
            </span>
          )}
        </div>
        <div>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.email && (
            <span className={styles.error}>{formErrors.email.join(", ")}</span>
          )}
        </div>
        <div>
          <input
            type="text"
            name="password"
            placeholder="Пароль"
            value={newUser.password_hash}
            onChange={(e) =>
              setNewUser({ ...newUser, password_hash: e.target.value })
            }
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.password_hash && (
            <span className={styles.error}>
              {formErrors.password_hash.join(", ")}
            </span>
          )}
        </div>
        <div>
          <input
            type="text"
            name="english level"
            placeholder="Уровень английского"
            value={newUser.english_level}
            onChange={(e) =>
              setNewUser({ ...newUser, english_level: e.target.value })
            }
            className={styles.admin_input}
            spellCheck="false"
          />
          {formErrors.english_level && (
            <span className={styles.error}>
              {formErrors.english_level.join(", ")}
            </span>
          )}
        </div>
        <div>
          <button type="submit" className={styles.admin_button}>
            Добавить пользователя
          </button>
          {formErrors.something && (
            <span className={styles.error}>
              {formErrors.something.join(", ")}
            </span>
          )}
        </div>
      </form>
      <table className={styles.admin_table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usermane</th>
            <th>Email</th>
            <th>Уровень английского</th>
            <th>Почта подтверждена</th>
            <th>Дата создания аккаунта</th>
            <th>Дата изменения пароля</th>
            <th>Последний вход в аккаунт</th>
            <th>Берсерк</th>
          </tr>
        </thead>
        <tbody>
          {users
            .sort((a, b) => a.id_user - b.id_user)
            .map((user, rowIndex) => (
              <tr key={user.id_user}>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 0 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 0
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <div>{user.id_user}</div>
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 1)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 1 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 1
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) =>
                      handleChange(user.id_user, "username", e.target.value)
                    }
                    spellCheck="false"
                  />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 2)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 2 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 2
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      handleChange(user.id_user, "email", e.target.value)
                    }
                    spellCheck="false"
                  />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 3)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 3 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 3
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <input
                    type="text"
                    value={user.english_level}
                    onChange={(e) =>
                      handleChange(
                        user.id_user,
                        "english_level",
                        e.target.value
                      )
                    }
                    spellCheck="false"
                  />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 4)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 4 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 4
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <div className={styles.checkbox_wrapper}>
                    <input
                      type="checkbox"
                      checked={user.is_email_verificated}
                      onChange={(e) =>
                        handleChange(
                          user.id_user,
                          "is_email_verificated",
                          e.target.checked
                        )
                      }
                    />
                    <svg viewBox="0 0 35.6 35.6">
                      <circle
                        className={styles.background}
                        cx="17.8"
                        cy="17.8"
                        r="17.8"
                      ></circle>
                      <circle
                        className={styles.stroke}
                        cx="17.8"
                        cy="17.8"
                        r="14.37"
                      ></circle>
                      <polyline
                        className={`${styles.check} ${
                          user.is_email_verificated
                            ? styles.visible
                            : styles.hidden
                        }`}
                        points="11.78 18.12 15.55 22.23 25.17 12.87"
                      ></polyline>
                      <line
                        className={`${styles.cross} ${
                          !user.is_email_verificated
                            ? styles.visible
                            : styles.hidden
                        }`}
                        x1="10"
                        y1="10"
                        x2="25"
                        y2="25"
                      />
                      <line
                        className={`${styles.cross} ${
                          !user.is_email_verificated
                            ? styles.visible
                            : styles.hidden
                        }`}
                        x1="25"
                        y1="10"
                        x2="10"
                        y2="25"
                      />
                    </svg>
                  </div>
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 5)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 5 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 5
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <DateDisplay dateString={user.account_created_at} />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 6)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 6 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 6
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <DateDisplay dateString={user.password_changed_at} />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 7)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 7 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 7
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <DateDisplay dateString={user.last_day_online} />
                </td>
                <td
                  onMouseEnter={() => handleMouseEnter(rowIndex, 8)}
                  onMouseLeave={handleMouseLeave}
                  className={`${styles.cell} 
                                ${
                                  hoveredCell.row === rowIndex
                                    ? styles.hoveredRow
                                    : ""
                                } 
                                ${
                                  hoveredCell.col === 8 ? styles.hoveredCol : ""
                                } 
                                ${
                                  hoveredCell.row === rowIndex &&
                                  hoveredCell.col === 8
                                    ? styles.hoveredCell
                                    : ""
                                }`}
                >
                  <input
                    type="text"
                    value={user.days_in_berserk}
                    onChange={(e) =>
                      handleChange(
                        user.id_user,
                        "days_in_berserk",
                        e.target.value
                      )
                    }
                    spellCheck="false"
                  />
                </td>
                <td className={styles.border_none}>
                  <div
                    className={styles.iconContainer}
                    onClick={() => handleDelete(user.id_user)}
                  >
                    <span className={`material-icons ${styles.icon}`}>
                      close
                    </span>
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