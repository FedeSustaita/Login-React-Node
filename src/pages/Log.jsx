import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, Navigate } from "react-router-dom";
const Log = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contra, setContra] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [mensaje, setMensaje] = useState('');
  const enviar = (e) => {
    e.preventDefault();

    const Crear = async () => {
      try {
        const respuesta = await axios.post('https://login-backend-v24z.onrender.com/usuarios', {
            username: usuario,
            password: contra,
            empresa:empresa
        });

        console.log('Datos enviados:', respuesta.data);
        setMensaje("✅ Cuenta creada correctamente. Ahora podés iniciar sesión.");
        setUsuario('');
        setContra('');
        setEmpresa('');
          setTimeout(() => {
            navigate("/");
          }, 1500);

      } catch (err) {
        console.error('Error al enviar los datos:', err.response?.data || err.message);
      }
    };

    Crear();
  };

  return (
    <div className="contenedor-log">
      <h1>Crear Cuenta</h1>
      <form onSubmit={enviar}>
        <label htmlFor="usuario">User: </label>
        <input 
          type="text" 
          name="usuario" 
          id="usuario" 
          value={usuario}
          onChange={(e)=> setUsuario(e.target.value)}
          required
        />
        <br />
        <label htmlFor="contra">Password: </label>
        <input 
          type="password" 
          name="contra" 
          id="contra" 
          value={contra}
          onChange={(e)=> setContra(e.target.value)}
          required
        />
        <br />
        <label htmlFor="empresa">Nombre de la Empresa: </label>
        <input 
          type="text" 
          name="empresa" 
          id="empresa" 
          value={empresa}
          onChange={(e)=> setEmpresa(e.target.value)}
          required
        />
        <br />
        <button type="submit">Crear Cuenta</button>
      </form>
      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      <Link to="/" className="crear">
        Iniciar Sesion
      </Link>
    </div>
  );
};

export default Log;
