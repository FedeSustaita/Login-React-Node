import { BrowserRouter, Routes, Route, Link, NavLink  } from "react-router-dom";
import Home from "./pages/Home";
import Graficos from "./pages/Graficos";
import Inventario from "./pages/Inventario";
import Log from "./pages/Log";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
function App() {
  const nombre = localStorage.getItem("usuario")
  return (
    <BrowserRouter>
      <nav>
  <div className="usuario">
    <h4>Inventory System</h4>
    <h4>Bienvenido, {nombre}</h4>
  </div>

  <div className="links">
    <NavLink
      to="/inicio"
      className={({ isActive }) =>
        isActive ? "link active" : "link"
      }
    >
      Inicio
    </NavLink>

    <NavLink
      to="/inventario"
      className={({ isActive }) =>
        isActive ? "link active" : "link"
      }
    >
      Movimientos
    </NavLink>

    <NavLink
      to="/productos"
      className={({ isActive }) =>
        isActive ? "link active" : "link"
      }
    >
      Productos
    </NavLink>

    <NavLink
      to="/graficos"
      className={({ isActive }) =>
        isActive ? "link active" : "link"
      }
    >
      Gráficos
    </NavLink>
  </div>
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
