import Main from "./Components/Main";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Nav from "./Components/Nav";
import Footer from "./Components/Footer";
import AdminPanel from "./Components/Admin/AdminPanel";
import Register from "./Components/Authorization/Register";
import Login from "./Components/Authorization/Login";
import styles from "./styles/main.module.css";

function App() {
  return (
    <Router>
      <div className={styles.main_wrapper}>
        <Nav />
        <div className={styles.content}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
        </div>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;