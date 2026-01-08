    import axios from "axios"
    import { useState, useEffect, useContext } from "react"
    import { AuthContext } from "../AuthContext"
    import { useNavigate } from "react-router-dom"
    import VentasVsCompras from "../functions/grafic.jsx";

    const Graficos = () => {
        const { isLoggedIn } = useContext(AuthContext)
        const navigate = useNavigate()
        const listadoId = JSON.parse(localStorage.getItem("idDeListado"));
        const [productos, setProductos] = useState([])
        const [historial, setHistorial] = useState([]);
        

    // 🚫 Si no está logueado, redirige
    useEffect(() => {
        if (!isLoggedIn) {
        navigate("/")
        }
    }, [isLoggedIn])

    useEffect(() => {
    if (!listadoId) return;

    const traerDatos = async () => {
        try {
        const [resProductos, resHistorial] = await Promise.all([
            axios.get(`https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`),
            axios.get(`https://login-backend-v24z.onrender.com/movimientos/listado/${listadoId}`)
        ]);

        setProductos(resProductos.data);
        setHistorial(resHistorial.data);
        
        } catch (error) {
        console.error(error);
        }

    };

    traerDatos();
    }, [listadoId]);

    

    if (!isLoggedIn) return null

    return (
        <div className="grafico-general">
            <h1>Ventas Vs Compras</h1>
            <div className="contenedor-grafico">
                <VentasVsCompras historial={historial} />
            </div>
                <h3>📊 Interpretación del gráfico: Ventas vs Compras</h3>

                    <p>
                        Este gráfico compara la <strong>cantidad de unidades compradas</strong> con la
                        <strong> cantidad de unidades vendidas</strong> para cada producto.
                    </p>

                    <ul>
                        <li>
                        <strong>Barras:</strong> representan las <strong>compras</strong> realizadas.
                        </li>
                        <li>
                        <strong>Línea:</strong> representa las <strong>ventas</strong> realizadas.
                        </li>
                    </ul>

                    <p>
                        <strong>Cómo interpretarlo:</strong>
                    </p>

                    <ul>
                        <li>
                        Si la línea de ventas está por encima de la barra de compras, el producto
                        tiene <strong>alta salida</strong> y puede generar faltante de stock.
                        </li>
                        <li>
                        Si la barra de compras supera a la línea de ventas, hay
                        <strong> mayor ingreso de stock</strong> que ventas.
                        </li>
                        <li>
                        Cuando ambos valores son similares, el producto presenta una
                        <strong> rotación equilibrada</strong>.
                        </li>
                    </ul>

                    <p>
                        Este análisis permite tomar mejores decisiones sobre
                        <strong> reposición de mercadería</strong> y planificación de compras.
                    </p>
        </div>
    )
    }

    export default Graficos
