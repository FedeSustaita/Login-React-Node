import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuario";
import About from "./pages/About";
import Log from "./pages/Log";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Inicio</Link> |
        <Link to="/usuarios">Usuarios</Link> |
        <Link to="/about">Acerca</Link> |
        <Link to="/log">Log</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/about" element={<About />} />
        <Route path="/log" element={<Log />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
