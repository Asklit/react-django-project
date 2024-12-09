import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import axios from "axios";
import DateDisplay from "./DateFormat";

function Users() {
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password_hash: "",
    english_level: "",
  });

  const fetchUsersData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/list/users");
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
    try {
      await axios.post(
        "http://localhost:8000/api/create/users",
        newUser
      );
      setNewUser({
        username: "",
        email: "",
        password_hash: "",
        english_level: "",
      });
    } catch (error) {
      console.error(
        "There has been a problem with create user operation:",
        error
      );
    }
    fetchUsersData();
  };

  const handleDelete = async (userId) => {
    try {
      const url = `http://localhost:8000/api/delete/users/${userId}/`;

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
      const url = `http://localhost:8000/api/update/users/${userId}/`;
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
        <input
          type="text"
          name="username"
          placeholder="Пользователь"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className={styles.admin_input}
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className={styles.admin_input}
        />
        <input
          type="text"
          name="password"
          placeholder="Пароль"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password_hash: e.target.value })
          }
          className={styles.admin_input}
        />
        <input
          type="text"
          name="english level"
          placeholder="Уровень английского"
          value={newUser.english_level}
          onChange={(e) =>
            setNewUser({ ...newUser, english_level: e.target.value })
          }
          className={styles.admin_input}
        />
        <button type="submit" className={styles.admin_button}>
          Add User
        </button>
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
            <th>Количество дней в берверке</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_user}>
              <td>
                <div>{user.id_user}</div>
              </td>
              <td>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) =>
                    handleChange(user.id_user, "username", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    handleChange(user.id_user, "email", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={user.english_level}
                  onChange={(e) =>
                    handleChange(user.id_user, "english_level", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={String(user.is_email_verificated)}
                  onChange={(e) =>
                    handleChange(
                      user.id_user,
                      "is_email_verificated",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <DateDisplay dateString={user.account_created_at} />
              </td>
              <td>
                <DateDisplay dateString={user.password_changed_at} />
              </td>
              <td>
                <DateDisplay dateString={user.last_day_online} />
              </td>
              <td>
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
                />
              </td>
              <td className={styles.border_none}>
                {/* <button
                className={styles.admin_actionButton}
                value={user.id_user}
                onClick={(e) => handleDelete(e)}
              >
                Удалить
              </button> */}
                <div className={styles.iconContainer} onClick={() => handleDelete(user.id_user)}>
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
