import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Nav from "./Components/Nav";
import Footer from "./Components/Footer";
import Main from "./Components/Main";
import AdminPanel from "./Components/Admin/AdminPanel";
import Register from "./Components/Authorization/Register";
import Login from "./Components/Authorization/Login";
import Profile from "./Components/Profile";
import Settings from "./Components/Settings";

import styles from "./styles/main.module.css";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <div className={styles.main_wrapper}>
        <Nav />
        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/register" element={<div className={styles.auth_page}><Register /></div>} />
            <Route path="/login" element={<div className={styles.auth_page}><Login /></div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;