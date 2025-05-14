import React, { useState, useEffect } from "react";
import styles from "../../styles/AdminPanel.module.css";
import api from "../../api"; 

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [successMessage, setSuccessMessage] = useState("");

  const [newAdmin, setNewAdmin] = useState({
    id_admin: "",
    first_name: "",
    surname: "",
    established_post: "",
  });

  const handleMouseEnter = (rowIndex, colIndex) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
  };

  const handleMouseLeave = () => {
    setHoveredCell({ row: null, col: null });
  };

  const fetchAdminsData = async () => {
    try {
      const response = await api.get("http://localhost:8000/api/admins/");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const fetchUsersData = async () => {
    try {
      const response = await api.get("http://localhost:8000/api/users/list/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAdminsData();
    fetchUsersData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("http://localhost:8000/api/admins/", newAdmin);
      setNewAdmin({ id_admin: "", first_name: "", surname: "", established_post: "" });
      setFormErrors({});
      fetchAdminsData();
    } catch (error) {
      const errors = error.response.data;
      console.error("There has been a problem with create admin operation:", errors);
      setFormErrors(errors);
    }
  };

  const handleDelete = async (id_admin) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого администратора?")) {
      return;
    }
    try {
      const url = `http://localhost:8000/api/admins/${id_admin}/`;
      console.log(`Deleting admin at URL: ${url}`);
      await api.delete(url);
      setSuccessMessage("Администратор успешно удален!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchAdminsData();
    } catch (error) {
      console.error("There has been a problem with the delete admin operation:", error.response ? error.response.data : error.message);
    }
  };

  const handleChange = async (id_admin, field, value) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) =>
        admin.id_admin === id_admin ? { ...admin, [field]: value } : admin
      )
    );

    try {
      const url = `http://localhost:8000/api/admins/${id_admin}/`;
      const updatedData = { [field]: value };
      console.log(`Updating admin at URL: ${url}`, updatedData);
      await api.put(url, updatedData);
    } catch (error) {
      console.error("There has been a problem with the update admin operation:", error.response ? error.response.data : error.message);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedAdmins = () => {
    const sortedAdmins = [...admins];
    if (sortConfig.key) {
      sortedAdmins.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "id_admin") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortedAdmins;
  };

  const availableUsers = users.filter(
    (user) => !admins.some((admin) => admin.id_admin === user.id_user)
  );

  return (
    <>
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      <form onSubmit={(e) => handleSubmit(e)} className={styles.admin_form}>
        <div>
          <select
            name="id_admin"
            value={newAdmin.id_admin}
            onChange={(e) => setNewAdmin({ ...newAdmin, id_admin: e.target.value })}
            className={`${styles.admin_input} ${styles.dropdown} ${formErrors.id_admin ? styles.inputError : ""}`}
            disabled={availableUsers.length === 0}
          >
            <option value="">Выберите пользователя</option>
            {availableUsers.map((user) => (
              <option key={user.id_user} value={user.id_user} className={styles.dropdownOption}>
                {user.username} (ID: {user.id_user})
              </option>
            ))}
          </select>
          {formErrors.id_admin && <span className={styles.error}>{formErrors.id_admin.join(", ")}</span>}
        </div>
        <div>
          <input
            type="text"
            name="first_name"
            placeholder="Имя"
            value={newAdmin.first_name}
            onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
            className={`${styles.admin_input} ${formErrors.first_name ? styles.inputError : ""}`}
            spellCheck="false"
          />
          {formErrors.first_name && <span className={styles.error}>{formErrors.first_name.join(", ")}</span>}
        </div>
        <div>
          <input
            type="text"
            name="surname"
            placeholder="Фамилия"
            value={newAdmin.surname}
            onChange={(e) => setNewAdmin({ ...newAdmin, surname: e.target.value })}
            className={`${styles.admin_input} ${formErrors.surname ? styles.inputError : ""}`}
            spellCheck="false"
          />
          {formErrors.surname && <span className={styles.error}>{formErrors.surname.join(", ")}</span>}
        </div>
        <div>
          <input
            type="text"
            name="established_post"
            placeholder="Должность"
            value={newAdmin.established_post}
            onChange={(e) => setNewAdmin({ ...newAdmin, established_post: e.target.value })}
            className={`${styles.admin_input} ${formErrors.established_post ? styles.inputError : ""}`}
            spellCheck="false"
          />
          {formErrors.established_post && <span className={styles.error}>{formErrors.established_post.join(", ")}</span>}
        </div>
        <div>
          <button type="submit" className={styles.admin_button}>Добавить администратора</button>
          {formErrors.detail && <span className={styles.error}>{formErrors.detail}</span>}
        </div>
      </form>
      <table className={styles.admin_table}>
        <thead>
          <tr>
            <th onClick={() => requestSort("id_admin")} className={sortConfig.key === "id_admin" ? styles[sortConfig.direction] : ""}>ID</th>
            <th onClick={() => requestSort("username")} className={sortConfig.key === "username" ? styles[sortConfig.direction] : ""}>Username</th>
            <th onClick={() => requestSort("email")} className={sortConfig.key === "email" ? styles[sortConfig.direction] : ""}>Email</th>
            <th onClick={() => requestSort("first_name")} className={sortConfig.key === "first_name" ? styles[sortConfig.direction] : ""}>Имя</th>
            <th onClick={() => requestSort("surname")} className={sortConfig.key === "surname" ? styles[sortConfig.direction] : ""}>Фамилия</th>
            <th onClick={() => requestSort("established_post")} className={sortConfig.key === "established_post" ? styles[sortConfig.direction] : ""}>Должность</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {getSortedAdmins().map((admin, rowIndex) => (
            <tr key={admin.id_admin}>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 0)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 0 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 0 ? styles.hoveredCell : ""}`}
              >
                <div>{admin.id_admin}</div>
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 1)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 1 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 1 ? styles.hoveredCell : ""}`}
              >
                <div>{admin.username}</div>
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 2)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 2 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 2 ? styles.hoveredCell : ""}`}
              >
                <div>{admin.email}</div>
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 3)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 3 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 3 ? styles.hoveredCell : ""}`}
              >
                <input
                  type="text"
                  value={admin.first_name}
                  onChange={(e) => handleChange(admin.id_admin, "first_name", e.target.value)}
                  spellCheck="false"
                  className={styles.cellInput}
                />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 4)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 4 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 4 ? styles.hoveredCell : ""}`}
              >
                <input
                  type="text"
                  value={admin.surname}
                  onChange={(e) => handleChange(admin.id_admin, "surname", e.target.value)}
                  spellCheck="false"
                  className={styles.cellInput}
                />
              </td>
              <td
                onMouseEnter={() => handleMouseEnter(rowIndex, 5)}
                onMouseLeave={handleMouseLeave}
                className={`${styles.cell} ${hoveredCell.row === rowIndex ? styles.hoveredRow : ""} ${hoveredCell.col === 5 ? styles.hoveredCol : ""} ${hoveredCell.row === rowIndex && hoveredCell.col === 5 ? styles.hoveredCell : ""}`}
              >
                <input
                  type="text"
                  value={admin.established_post}
                  onChange={(e) => handleChange(admin.id_admin, "established_post", e.target.value)}
                  spellCheck="false"
                  className={styles.cellInput}
                />
              </td>
              <td className={styles.border_none}>
                <div className={styles.iconContainer} onClick={() => handleDelete(admin.id_admin)}>
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

export default Admins;