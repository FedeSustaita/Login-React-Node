    import { useState, useEffect, useContext } from "react"
    import { Link, useNavigate } from "react-router-dom"
    import axios from "axios"
    import { AuthContext } from "../AuthContext"

    const Home = () => {
    const navigate = useNavigate()
    const { isLoggedIn, login } = useContext(AuthContext)

    const [usuario, setUsuario] = useState("")
    const [contra, setContra] = useState("")
    const [datos, setDatos] = useState([])

    useEffect(() => {
        const recibir = async () => {
        try {
            const resultado = await axios.get(
            "https://backend-nodejs-expressjs-fce4.onrender.com/users"
            )
            setDatos(resultado.data)
        } catch (error) {
            console.log("Error", error)
        }
        }
        recibir()
    }, [])

    const enviar = (e) => {
        e.preventDefault()

        const encontrado = datos.find(
        (i) => i.user === usuario && i.password === contra
        )

        if (encontrado) {
        login() // 🔐 guardamos sesión en context + localStorage
        navigate("/about")
        } else {
        alert("Usuario o contraseña incorrectos")
        }
    }

    return (
        <>
        {isLoggedIn ? (
            <h1>Ingreso</h1>
        ) : (
            <>
            <h1>Iniciar sesión</h1>

            <form onSubmit={enviar}>
                <label>User:</label>
                <input
                type="text"
                onChange={(e) => setUsuario(e.target.value)}
                />

                <br />

                <label>Password:</label>
                <input
                type="password"
                onChange={(e) => setContra(e.target.value)}
                />

                <br />

                <button type="submit">Enviar</button>
            </form>

            <Link to="/log">Crear cuenta</Link>
            </>
        )}
        </>
    )
    }

    export default Home
