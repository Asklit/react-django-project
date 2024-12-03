import Main from "./Components/ Main"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./Components/Nav";
import Footer from "./Components/Footer";


function App() {
  return (
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Main />} />
          {/* <Route path="/login" element={<Main />} /> */}
          {/* <Route path="/login" element={<Footer />} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
  );
}

export default App;
