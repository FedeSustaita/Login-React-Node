import { useState } from "react"
import axios from "axios"
const Log=()=>{
        const [usuario,setUsuario]=useState('')
        const [contra,setContra]=useState('')
        const enviar =(e)=>{
            e.preventDefault()
            console.log('Usuario',usuario);
            console.log('Contraseña',contra);
            const Crear = async()=>{
                await axios.post('http://localhost:3000/create',{nombre:usuario,contrase:contra})
                console.log('Datos enviados');
            }
            Crear()
        }
    return(
        <>
            <h1>
                Crear Cuenta
            </h1>
            <form onSubmit={enviar}>
                <label htmlFor="usuario">User: </label>
                <input type="text" name="usuario" id="usuario" onChange={(e)=> setUsuario(e.target.value)}/>
                <br />
                <label htmlFor="contra">Password: </label>
                <input type="password" name="contra" id="contra" onChange={(e)=> setContra(e.target.value)}/>
                <br />
                <button type="submit">Enviar</button>
            </form>
        </>
    )
}
export default Log