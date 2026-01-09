import { useContext, useEffect, useState } from "react"
import { Navigate, Link } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {} from "@fortawesome/free-regular-svg-icons"
import { faArrowTrendUp,faBoxOpen,faShoppingCart } from "@fortawesome/free-solid-svg-icons"


import axios from "axios"

const Inicio = () => {
    const { isLoggedIn, logout} = useContext(AuthContext)

    const listadoId = JSON.parse(localStorage.getItem("idDeListado"));
    const [productos, setProductos] = useState([])
    const [historial, setHistorial] = useState([])
    const [variantes, setVariantes] = useState([]);

  /* =========================
     CARGAR PRODUCTOS
  ========================= */
useEffect(() => {
    if (!listadoId) return;

    const traerDatos = async () => {
        try {
        const [resProductos, resHistorial] = await Promise.all([
            axios.get(
            `https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`
            ),
            axios.get(
            `https://login-backend-v24z.onrender.com/movimientos/listado/${listadoId}`
            )
        ]);

        setProductos(resProductos.data);
        setHistorial(resHistorial.data);

        // traer variantes por producto
        const variantesObj = {};
        for (const p of resProductos.data) {
            const res = await axios.get(
            `https://login-backend-v24z.onrender.com/variantes/producto/${p._id}`
            );
            variantesObj[p._id] = res.data;
        }

        setVariantes(variantesObj);

        } catch (error) {
        console.error("Error al traer datos:", error);
        }
    };

    traerDatos();
}, [listadoId]);


    const productosStockBajo = productos.filter(m => (m.cantidad / m.stockEst) < 0.5)



    const [idVenta, setIdVenta] = useState("");
    const [cantidadVenta, setCantidadVenta] = useState("");
    const [idCompra, setIdCompra] = useState("");
    const [cantidadCompra, setCantidadCompra] = useState("");
    const [puerta, setPuerta] = useState("cerrado")
    const [puerta2, setPuerta2] = useState("cerrado")

    const abrir = () => {
        setPuerta("abierto")
        setPuerta2("cerrado")
    }
    const abrir2 = () => {
        setPuerta2("abierto")
        setPuerta("cerrado")
    }
    const cerrar = () => setPuerta("cerrado")
    const cerrar2 = () => setPuerta2("cerrado")

    const registrarMovimiento = async (tipo, producto, cantidad,precio, variante="") => {
    try {
        const nuevoMovimiento = {
            listadoId,
            tipo,
            producto,
            variante,
            precio:Number(precio),
            cantidad: Number(cantidad),
            fecha: new Date()
        };

        const res = await axios.post(
        "https://login-backend-v24z.onrender.com/movimientos",
        nuevoMovimiento
        );

        // actualiza el estado con lo que viene de la DB
        setHistorial(prev => [res.data, ...prev]);

    } catch (error) {
        console.error("Error al registrar movimiento", error);
    }
    };

// Para manejar la variante seleccionada (si el producto tiene variantes)
const [idVarianteVenta, setIdVarianteVenta] = useState(""); 

// Para guardar las variantes del producto seleccionado y mostrarlas en el select
const [varianteSeleccionadas, setVarianteSeleccionadas] = useState([]);







const venta = async (e) => {
  e.preventDefault();
  if (!idVenta) return;

  const producto = productos.find(p => p._id === idVenta);
  if (!producto) return;

  try {
    if (varianteSeleccionadas.length > 0 && idVarianteVenta) {
      // restar cantidad de la variante seleccionada
      const variante = varianteSeleccionadas.find(v => v._id === idVarianteVenta);
      const nuevaCantidad = Math.max(0, variante.cantidad - Number(cantidadVenta));

      await axios.put(`https://login-backend-v24z.onrender.com/variantes/${idVarianteVenta}`, {
        cantidad: nuevaCantidad
      });
    } else {
      // Producto sin variantes
      const nuevaCantidad = Math.max(0, producto.cantidad - Number(cantidadVenta));
      await axios.put(`https://login-backend-v24z.onrender.com/productos/${idVenta}`, {
        cantidad: nuevaCantidad
      });
    }

    // 🔄 Refrescar productos y variantes
    const resProductos = await axios.get(`https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`);

    const variantesObj = {};
    for (const p of resProductos.data) {
      const res = await axios.get(`https://login-backend-v24z.onrender.com/variantes/producto/${p._id}`);
      variantesObj[p._id] = res.data;
    }

    const productosConVariantes = resProductos.data.map(p => ({
      ...p,
      variantes: variantesObj[p._id] || []
    }));
    const varianteSeleccionadaTexto = idVarianteVenta
    ? Object.entries(varianteSeleccionadas.find(v => v._id === idVarianteVenta).atributos)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" / ")
    : "";


    setProductos(productosConVariantes);
    setVariantes(variantesObj);

    // registrar movimiento
    await registrarMovimiento("VENTA", producto.nombre, cantidadVenta, producto.precio,varianteSeleccionadaTexto);

    // reset
    setIdVenta("");
    setIdVarianteVenta("");
    setCantidadVenta("");

  } catch (error) {
    console.error("Error en la venta:", error);
  }
};



const compra = async (e) => {
  e.preventDefault();
  if (!idCompra) return;

  const producto = productos.find(p => p._id === idCompra);
  if (!producto) return;

  try {
    if (varianteSeleccionadas.length > 0 && idVarianteVenta) {
      // Sumar cantidad a la variante seleccionada
      const variante = varianteSeleccionadas.find(v => v._id === idVarianteVenta);
      const nuevaCantidad = variante.cantidad + Number(cantidadCompra);

      await axios.put(`https://login-backend-v24z.onrender.com/variantes/${idVarianteVenta}`, {
        cantidad: nuevaCantidad
      });
    } else {
      // Producto sin variantes
      const nuevaCantidad = producto.cantidad + Number(cantidadCompra);
      await axios.put(`https://login-backend-v24z.onrender.com/productos/${idCompra}`, {
        cantidad: nuevaCantidad
      });
    }

    // 🔄 Refrescar productos y variantes
    const resProductos = await axios.get(`https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`);

    const variantesObj = {};
    for (const p of resProductos.data) {
      const res = await axios.get(`https://login-backend-v24z.onrender.com/variantes/producto/${p._id}`);
      variantesObj[p._id] = res.data;
    }

    const productosConVariantes = resProductos.data.map(p => ({
      ...p,
      variantes: variantesObj[p._id] || []
    }));
    const varianteSeleccionadaTexto = idVarianteVenta
    ? Object.entries(varianteSeleccionadas.find(v => v._id === idVarianteVenta).atributos)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" / ")
    : "";

    setProductos(productosConVariantes);
    setVariantes(variantesObj);

    // registrar movimiento
    await registrarMovimiento("COMPRA", producto.nombre, cantidadCompra, producto.costo, varianteSeleccionadaTexto);

    // reset
    setIdCompra("");
    setIdVarianteVenta("");
    setCantidadCompra("");

  } catch (error) {
    console.error("Error en la compra:", error);
  }
};




    /* =========================
        CARGAR HISTORIAL
        (si todavía lo tenés local)
    ========================= */


    /* =========================
        MÉTRICAS
    ========================= */

    let totalGeneral = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0)
    totalGeneral = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0
    }).format(totalGeneral)
    
  const totalProductos = productos.length
    const haceUnaSemana = new Date()
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7)
    const ventasUltimaSemana = historial.filter(m => m.tipo === "VENTA" && new Date(m.fecha) >= haceUnaSemana)
    const totalVentas = historial
    .filter(m => m.tipo === "VENTA")
    .reduce((total, m) => total + Number(m.cantidad), 0)

    const ventas = historial.filter(m => m.tipo === "VENTA")
    const ventasPorProducto = ventas.reduce((acc, item) => {
        if (!acc[item.producto]) acc[item.producto] = { producto: item.producto, totalVendidos: Number(item.cantidad) }
        else acc[item.producto].totalVendidos += Number(item.cantidad)
        return acc
    }, {})
    const masVendidos = Object.values(ventasPorProducto).sort((a, b) => b.totalVendidos - a.totalVendidos)

    const ultimas5Ventas = historial
        .filter(m => m.tipo === "VENTA")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }



return (
    <>
    <h1 className="bienvenida">PANEL GENERAL</h1>
    <h3 className="bienvenida-baja">Inventario y ventas</h3>
    <button onClick={logout}  className="cerrar-sesion">🔒 Cerrar Sesion</button>
    <div className="contenedor">
        <div className="cards">
            <h3>{totalVentas}</h3>
            <h4>Ventas</h4>
            <Link to="/graficos"><FontAwesomeIcon icon={faArrowTrendUp} /> GRAFICO</Link>
        </div>

        <div className="cards">
            <h3>{ventasUltimaSemana.length}</h3>
            <h4>Ventas de la semana</h4>
            <Link to="/inventario"><FontAwesomeIcon icon={faArrowTrendUp} /> MOVIMIENTOS</Link>
        </div>

        <div className="cards">
            <h3>{totalProductos}</h3>
            <h4>Productos</h4>
            <Link to="/productos"><FontAwesomeIcon icon={faArrowTrendUp} /> PRODUCTOS</Link>
        </div>

        <div className="ValoInventario">
            <h3>Valores de inventario</h3>

            <div className="venta">
            <div className="venta-palabra">Venta</div>
            <div className="venta-numero">{totalGeneral}</div>
        </div>
        </div>
    </div>
        <div className="contenedor-main">
            <div className="contenedor-chico">
            <h3>Stock Bajo</h3>
            <hr />
            <ul>
                {productosStockBajo.map(p => (
                <li key={p._id}>
                    <div className="nombre">{p.nombre}</div>
                    <div className="cantidad">{p.cantidad}</div>
                </li>
                ))}
            </ul>
            </div>
            <div className="contenedor-chico">
            <h3>Más Vendidos</h3>
            <hr />
            <ul>
                {masVendidos.map((p, index) => (
                <li key={index}>
                    <div className="nombre">{p.producto}</div>
                    <div className="cantidad">{p.totalVendidos}</div>
                </li>
                ))}
            </ul>
            </div>
        </div>
        <div className="conten">
            <div className="conten-interno">
            <h3>Acciones Rapidas</h3>
            <div className="conten-botones">
                <button onClick={abrir} className="venta"><FontAwesomeIcon icon={faShoppingCart} /> Venta Rapida</button>
                <button onClick={abrir2} className="compra"><FontAwesomeIcon icon={faBoxOpen} /> Compra Rapida</button>
            </div>
            </div>

            <div className={`pantalla ${puerta}`}>
            <h3>Venta</h3>
            <div className="formulario">
                <form onSubmit={venta}>
                {/* Select de producto */}
                <label>Producto</label>
                <select
                    value={idVenta}
                    onChange={e => {
                    const prodId = e.target.value;
                    setIdVenta(prodId);
                    setIdVarianteVenta("");

                    // Usar el estado variantes para obtener las variantes del producto
                    setVarianteSeleccionadas(variantes[prodId] || []);
                    }}
                    required
                >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                    <option key={p._id} value={p._id}>
                        {p.nombre}
                    </option>
                    ))}
                </select>

                {/* Select de variante solo si existen */}
                {varianteSeleccionadas && varianteSeleccionadas.length > 0 && (
                    <>
                    <label>Variante</label>
                    <select
                        value={idVarianteVenta}
                        onChange={e => setIdVarianteVenta(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar variante</option>
                        {varianteSeleccionadas.map(v => (
                        <option key={v._id} value={v._id}>
                            {Object.entries(v.atributos)
                            .map(([k, val]) => `${k}: ${val}`)
                            .join(" / ")}
                        </option>
                        ))}
                    </select>
                    </>
                )}

                {/* Cantidad a vender */}
                <label>Cantidad</label>
                <input
                    type="number"
                    value={cantidadVenta}
                    onChange={e => setCantidadVenta(e.target.value)}
                    min={1}
                    required
                />

                <button type="submit">Vender</button>
                </form>
            </div>
            <button onClick={cerrar}>Cerrar</button>
            </div>

            <div className={`pantalla2 ${puerta2}`}>
            <h3>Compra</h3>
            <div className="formulario">
                <form onSubmit={compra}>
                {/* Select de producto */}
                <label>Producto</label>
                <select
                    value={idCompra}
                    onChange={e => {
                    setIdCompra(e.target.value);
                    // resetear variante seleccionada
                    setIdVarianteVenta("");
                    // buscar variantes desde el objeto variantes
                    setVarianteSeleccionadas(variantes[e.target.value] || []);
                    }}
                    required
                >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                    <option key={p._id} value={p._id}>
                        {p.nombre}
                    </option>
                    ))}
                </select>

                {/* Select de variante solo si existen */}
                {varianteSeleccionadas && varianteSeleccionadas.length > 0 && (
                    <>
                    <label>Variante</label>
                    <select
                        value={idVarianteVenta}
                        onChange={e => setIdVarianteVenta(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar variante</option>
                        {varianteSeleccionadas.map(v => (
                        <option key={v._id} value={v._id}>
                            {Object.entries(v.atributos)
                            .map(([k, val]) => `${k}: ${val}`)
                            .join(" / ")}
                        </option>
                        ))}
                    </select>
                    </>
                )}

                {/* Cantidad a comprar */}
                <label>Cantidad</label>
                <input
                    type="number"
                    value={cantidadCompra}
                    onChange={e => setCantidadCompra(e.target.value)}
                    min={1}
                    required
                />

                <button type="submit">Comprar</button>
                </form>
            </div>
            <button onClick={cerrar2}>Cerrar</button>
            </div>
        </div>
        <div className="contenedor-ventas">
            <div className="contenedor-ventas-interno">
            <h3>Ultimas Ventas</h3>
            <div className="contenedor-ventas-interno-tabla">
                <ul>
                {ultimas5Ventas.map((v, i) => (
                    <li key={i} className="venta-item">
                    <div className="venta-info">
                        <span className="producto">{v.producto}</span>
                        {v.variante && <span className="variante"> ({v.variante})</span>}
                        <span className="fecha">
                        {new Date(v.fecha).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                        </span>
                    </div>
                    <span className="cantidad">x{v.cantidad}</span>
                    </li>
                ))}
                </ul>
            </div>
            </div>
        </div>
    </>
)
}

export default Inicio
