import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axios from "axios";

const Inventario = () => {
    const { isLoggedIn } = useContext(AuthContext);

    // 🔑 listadoId desde sesión
    const listadoId = JSON.parse(localStorage.getItem("idDeListado"));

    // 📦 productos (SIEMPRE desde backend)
    const [productos, setProductos] = useState([]);

    // 📜 historial (local)
    const [historial, setHistorial] = useState([]);

    // formularios
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precio, setPrecio] = useState("");
    const [stockEst, setStockEst] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [costo, setCosto] = useState("");

    const [idVenta, setIdVenta] = useState("");
    const [cantidadVenta, setCantidadVenta] = useState("");
    const [idCompra, setIdCompra] = useState("");
    const [cantidadCompra, setCantidadCompra] = useState("");


    const [idMod, setIdMod] = useState("")
    const [nombreMod, setNombreMod] = useState("")
    const [cantidadMod, setCantidadMod] = useState("")
    const [precioMod, setPrecioMod] = useState("")
    const [descripcionMod, setDescripcionMod] = useState("")
    const [stockEstMod, setStockEstMod] = useState("")
    const [costoMod, setCostoMod] = useState("")
    const [limiteHistorial, setLimiteHistorial] = useState(5)
    const [mostrarTodo, setMostrarTodo] = useState(false)
    const [ordenHistorial, setOrdenHistorial] = useState("fecha") // fecha | tipo


    const historialOrdenado = [...historial].sort((a, b) => {
  if (ordenHistorial === "fecha") {
    return new Date(b.fecha) - new Date(a.fecha) // más reciente primero
  }
  if (ordenHistorial === "tipo") {
    return a.tipo.localeCompare(b.tipo)
  }
  return 0
})

const historialVisible = mostrarTodo
  ? historialOrdenado
  : historialOrdenado.slice(0, limiteHistorial)



  // 🚀 cargar productos
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


  // 📜 historial
    const registrarMovimiento = async (tipo, producto, cantidad,precio) => {
    try {
        const nuevoMovimiento = {
          listadoId,
          tipo,
          producto,
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


  // ➕ CARGA
  const carga = async (e) => {
    e.preventDefault();

    const nuevo = {
      listadoId,
      nombre,
      cantidad: Number(cantidad),
      precio: Number(precio),
      stockEst: Number(stockEst),
      descripcion,
      costo: Number(costo)
    };

    const res = await axios.post(
      "https://login-backend-v24z.onrender.com/productos",
      nuevo
    );

    setProductos(prev => [...prev, res.data]);
    await registrarMovimiento("CARGA", nombre, cantidad, precio);


    setNombre("");
    setCantidad("");
    setPrecio("");
    setStockEst("");
    setDescripcion("");
    setCosto("");
  };

  // 💸 VENTA
  const venta = async (e) => {
    e.preventDefault();

    const producto = productos.find(p => p._id === idVenta);
    if (!producto) return;

    const nuevaCantidad = Math.max(
      0,
      producto.cantidad - Number(cantidadVenta)
    );

    const res = await axios.put(
      `https://login-backend-v24z.onrender.com/productos/${producto._id}`,
      { cantidad: nuevaCantidad }
    );

    setProductos(prev =>
      prev.map(p => (p._id === producto._id ? res.data : p))
    );

    await registrarMovimiento("VENTA", producto.nombre, cantidadVenta, producto.precio);
    setIdVenta("");
    setCantidadVenta("");
  };
  const compra = async (e) => {
    e.preventDefault();

    const producto = productos.find(p => p._id === idCompra);
    if (!producto) return;

    const nuevaCantidad = Math.max(
      0,
      producto.cantidad + Number(cantidadCompra)
    );

    const res = await axios.put(
      `https://login-backend-v24z.onrender.com/productos/${producto._id}`,
      { cantidad: nuevaCantidad }
    );

    setProductos(prev =>
      prev.map(p => (p._id === producto._id ? res.data : p))
    );

    await registrarMovimiento("COMPRA", producto.nombre, cantidadCompra, producto.costo);
    setIdVenta("");
    setCantidadVenta("");
  };
  const modificar = async (e) => {
    e.preventDefault();

    if (!idMod) return;

    try {
        const res = await axios.put(
        `https://login-backend-v24z.onrender.com/productos/${idMod}`,
        {
            nombre: nombreMod,
            cantidad: Number(cantidadMod),
            precio: Number(precioMod),
            stockEst: Number(stockEstMod),
            descripcion: descripcionMod,
            costo: Number(costo),
        }
        );

        setProductos(prev =>
        prev.map(p => (p._id === idMod ? res.data : p))
        );

        await registrarMovimiento(
            "MODIFICACIÓN",
            res.data.nombre,
            cantidadMod,
            res.data.precio 
        );


        setIdMod("");
        setNombreMod("");
        setCantidadMod("");
        setPrecioMod("");
        setStockEstMod("");
        setDescripcionMod("");
        setCostoMod("");
    } catch (error) {
        console.error("Error al modificar producto", error);
    }
  };

  // 🗑 ELIMINAR
    const eliminar = async (id) => {
        const productoLista = productos.find(p => p._id === id);
        if (!productoLista) return;
        const { nombre, cantidad, precio } = productoLista;
        await axios.delete(`https://login-backend-v24z.onrender.com/productos/${id}`);
        setProductos(prev => prev.filter(p => p._id !== id));
        await registrarMovimiento("ELIMINAR", nombre, cantidad, precio);
    };

  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    <>
      <h1>Inventario</h1>
      <div className="contenedor-supremo">
        <div className="aside">

          <h2>Agregar productos</h2>
          <form onSubmit={carga}>
            <label>Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <br />
            <label>Cantidad</label>
            <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} required />
            <br />
            <label>Precio Unitario</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />
            <br />
            <label>Costo Unitario</label>
            <input type="number" value={costo} onChange={e => setCosto(e.target.value)} required />
            <br />
            <label>Descripcion</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
            <br />
            <label>Stock Estadar</label>
            <input type="number" value={stockEst} onChange={e => setStockEst(e.target.value)} required />
            <br />
            <button type="submit">Agregar</button>
          </form>

            <h3>Venta</h3>
            <form onSubmit={venta}>
                <select value={idVenta} onChange={e => setIdVenta(e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {productos.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
                </select>
                <label>Cantidad</label>
                <input type="number" value={cantidadVenta} onChange={e => setCantidadVenta(e.target.value)} required />
                <button type="submit">Vender</button>
            </form>

            <h3>Compra</h3>
            <form onSubmit={compra}>
                <select value={idCompra} onChange={e => setIdCompra(e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {productos.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
                </select>
                <label>Cantidad</label>
                <input type="number" value={cantidadCompra} onChange={e => setCantidadCompra(e.target.value)} required />
                <button type="submit">Comprar</button>
            </form>


            <h3>Modificar</h3>
            <form onSubmit={modificar}>
                <select value={idMod} onChange={e => setIdMod(e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {productos.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
                </select>
                <br />
                <label>Nombre</label>
                <input type="text" value={nombreMod} onChange={e => setNombreMod(e.target.value)} required />
                <br />
                <label>Cantidad</label>
                <input type="number" value={cantidadMod} onChange={e => setCantidadMod(e.target.value)} required />
                <br />
                <label>Precio Unitario</label>
                <input type="number" value={precioMod} onChange={e => setPrecioMod(e.target.value)} required />
                <br />
                <label>Costo Unitario</label>
                <input type="number" value={costoMod} onChange={e => setCostoMod(e.target.value)} required />
                <br />
                <label>Descripcion</label>
                <input type="text" value={descripcionMod} onChange={e => setDescripcionMod(e.target.value)} required />
                <br />
                <label>Stock Estadar</label>
                <input type="number" value={stockEstMod} onChange={e => setStockEstMod(e.target.value)} required />
                <br />
                <button type="submit">Modificar</button>
            </form>

            <div className="historial">
              <h3>Historial de movimientos</h3>

              {/* 🔧 CONTROLES */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <select
                  value={ordenHistorial}
                  onChange={e => setOrdenHistorial(e.target.value)}
                >
                  <option value="fecha">Ordenar por fecha</option>
                  <option value="tipo">Ordenar por tipo</option>
                </select>

                {!mostrarTodo && (
                  <>
                    <button onClick={() => setLimiteHistorial(5)}>Últimos 5</button>
                    <button onClick={() => setLimiteHistorial(10)}>Últimos 10</button>
                  </>
                )}

                <button onClick={() => setMostrarTodo(prev => !prev)}>
                  {mostrarTodo ? "Mostrar menos" : "Mostrar todo"}
                </button>
              </div>

              {/* 📜 LISTA */}
              <ul>
                {historialVisible.map((h, i) => (
                  <li key={i} className={`mov ${h.tipo.toLowerCase()}`}>
                    <strong>{h.tipo}</strong> {h.producto} | Cant: {h.cantidad} | $
                    {h.precio}
                    <br />
                    <small>{new Date(h.fecha).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </div>
        </div>

        <div className="Right">
            <h3>Productos</h3>
            <ol>
                {productos.map(p => {
                const estado = (p.cantidad / p.stockEst) < 0.5 ? "bajo" : (p.cantidad / p.stockEst) < 1 ? "medio" : "ok"
                return (
                    <div className={`card-prod ${estado}`} key={p._id}>
                    <div className="titulo"><h3>{p.nombre}</h3></div>
                    <hr />
                    <div className="main">
                        <h4>{p.cantidad} / {p.stockEst}</h4>
                        <div className="stock-bar">
                        <div className={`fill ${estado}`} style={{ width: `${(p.cantidad / p.stockEst) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="descr">{p.descripcion}</div>
                    <div className="footer">
                        <h4>Precio: ${p.precio}</h4>
                        <button onClick={() => eliminar(p._id)}>🗑</button>
                    </div>
                    <div className="color"></div>
                    </div>
                )
                })}
            </ol>
        </div>
    </div>
    </>
  );
};

export default Inventario;
