import { useState } from "react";
import axios from "axios";

const Log = () => {
  const [usuario, setUsuario] = useState('');
  const [contra, setContra] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    console.log('Usuario:', usuario);
    console.log('Contraseña:', contra);

    const Crear = async () => {
      try {
        const respuesta = await axios.post('https://login-backend-v24z.onrender.com/usuarios', {
            username: usuario,
            password: contra
        });
        console.log('Datos enviados:', respuesta.data);
        setUsuario('');
        setContra('');
      } catch (err) {
        console.error('Error al enviar los datos:', err.response?.data || err.message);
      }
    };

    Crear();
  };

  return (
    <>
      <h1>Crear Cuenta</h1>
      <form onSubmit={enviar}>
        <label htmlFor="usuario">User: </label>
        <input 
          type="text" 
          name="usuario" 
          id="usuario" 
          value={usuario}
          onChange={(e)=> setUsuario(e.target.value)}
        />
        <br />
        <label htmlFor="contra">Password: </label>
        <input 
          type="password" 
          name="contra" 
          id="contra" 
          value={contra}
          onChange={(e)=> setContra(e.target.value)}
        />
        <br />
        <button type="submit">Enviar</button>
      </form>
    </>
  );
};

export default Log;
