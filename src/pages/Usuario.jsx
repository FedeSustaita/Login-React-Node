    import axios from "axios"
    import { useState, useEffect, useContext } from "react"
    import { AuthContext } from "../AuthContext"
    import { useNavigate } from "react-router-dom"

    const Usuario = () => {
    const { isLoggedIn } = useContext(AuthContext)
    const navigate = useNavigate()

    const [usuario, setUsuario] = useState([])
    const [bandera, setBandera] = useState(false)

    // 🚫 Si no está logueado, redirige
    useEffect(() => {
        if (!isLoggedIn) {
        navigate("/")
        }
    }, [isLoggedIn])

    // ⏳ Simulación de carga
    useEffect(() => {
        const timer = setTimeout(() => setBandera(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    // 📡 Request
    useEffect(() => {
        if (!bandera || !isLoggedIn) return

        const recibir = async () => {
            try {
                const resultado = await axios.get("https://backend-nodejs-expressjs-fce4.onrender.com/users")
                console.log("DATA:", resultado.data)
                setUsuario(resultado.data)
            } catch (error) {
                console.log("Error", error)
            }
        }

        recibir()
    }, [bandera, isLoggedIn])

    if (!isLoggedIn) return null

    return (
        <>
        <h2>Usuarios</h2>

        {!bandera ? (
            <h3>Cargando...</h3>
        ) : (
            <ul>
            {usuario.map((i) => (
                <li key={i.id}>
                Usuario: {i.user}
                <br />
                Contraseña: {i.password}
                </li>
            ))}
            </ul>
        )}
        </>
    )
    }

    export default Usuario
