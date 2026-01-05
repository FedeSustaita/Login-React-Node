import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useContext(AuthContext);

  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const recibir = async () => {
      try {
        const resultado = await axios.get("http://localhost:3000/usuarios");
        setDatos(resultado.data);
      } catch (error) {
        console.error("Error al traer usuarios", error);
      }
    };

    recibir();
  }, []);

  const enviar = (e) => {
    e.preventDefault();

    const encontrado = datos.find(
      u => u.username === usuario && u.password === contra
    );

    if (!encontrado) {
        alert("Usuario o contraseña incorrectos");
        return;
    }

    // 👉 SOLO guardamos sesión + listadoId
    localStorage.setItem("idDeListado",JSON.stringify(encontrado.idDeListado));

    login(encontrado.idDeListado);
    navigate("/inicio");
};

return (
    <>
        {isLoggedIn ? (
            <h1>Ingreso</h1>
        ) : (
        <>
        <h1>Iniciar sesión</h1>

        <div className="content-form">
            <form onSubmit={enviar}>
                <label>User:</label>
                <input
                    type="text"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    required
                />

              <br />

                <label>Password:</label>
                <input
                    type="password"
                    value={contra}
                    onChange={e => setContra(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Enviar</button>
            </form>
          </div>

          <Link to="/log" className="crear">
            Crear cuenta
          </Link>
        </>
      )}
    </>
  );
};

export default Home;
