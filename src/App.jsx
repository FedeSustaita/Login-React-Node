import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Graficos from "./pages/Graficos";
import Inventario from "./pages/Inventario";
import Log from "./pages/Log";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
function App() {
  return (
    <BrowserRouter>
      <nav>
          <Link to="/inicio">Inicio</Link> |
          <Link to="/inventario">Movimientos</Link> |
          <Link to="/productos">Productos</Link>  |
          <Link to="/graficos">Graficos</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graficos" element={<Graficos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/log" element={<Log />} />
        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
