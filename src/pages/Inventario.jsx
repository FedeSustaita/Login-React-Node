import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { traerDatos, calcularCantidadTotal,crearProductoConVariantes,actualizarProducto,actualizarVariante } from "../functions/funcionesComunes";
const Inventario = () => {
    const { isLoggedIn } = useContext(AuthContext);

    // 🔑 listadoId desde sesión
    const listadoId = JSON.parse(localStorage.getItem("idDeListado"));

    // 📦 productos (SIEMPRE desde backend)
    const [productos, setProductos] = useState([]);

    // 📜 historial (local)
    const [historial, setHistorial] = useState([]);
    const [variantes, setVariantes] = useState([]);

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
    const [loading, setLoading] = useState(false)


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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { productos, historial, variantes } = await traerDatos(listadoId);
      setProductos(productos);
      setHistorial(historial);
      setVariantes(variantes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  cargarDatos();
}, [listadoId]);




  // 📜 historial
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


  // ➕ CARGA
  const carga = async (e) => {
    e.preventDefault();

    try {
      const cantidadTotal = calcularCantidadTotal(check, atributos, cantidad);

      const productoCreado = await crearProductoConVariantes({
        listadoId,
        nombre,
        cantidad: cantidadTotal,
        precio: Number(precio),
        stockEst: Number(stockEst),
        descripcion,
        costo: Number(costo),
        check,
        atributos
      });

      setProductos(prev => [...prev, productoCreado]);

      await registrarMovimiento(
        "CARGA",
        nombre,
        cantidadTotal,
        precio
      );

      // reset
      setNombre("");
      setCantidad("");
      setPrecio("");
      setStockEst("");
      setDescripcion("");
      setCosto("");
      setAtributos([]);
      setCheck(false);

    } catch (error) {
      console.error("Error al cargar producto:", error);
    }
  };

const refrescarDatos = async () => {
  const { productos, historial, variantes } = await traerDatos(listadoId);
  setProductos(productos);
  setHistorial(historial);
  setVariantes(variantes);
};





const venta = async (e) => {
  e.preventDefault();
  if (!idVenta) return;

  const producto = productos.find(p => p._id === idVenta);
  if (!producto) return;

  try {
    let varianteTexto = "";

    if (idVarianteVenta) {
      const variante = varianteSeleccionadas.find(v => v._id === idVarianteVenta);

      await actualizarVariante(idVarianteVenta, {
        cantidad: Math.max(0, variante.cantidad - Number(cantidadVenta))
      });

      // 🔑 armar texto de variante
      varianteTexto = Object.entries(variante.atributos)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" / ");
    } else {
      await actualizarProducto(idVenta, {
        cantidad: Math.max(0, producto.cantidad - Number(cantidadVenta))
      });
    }

    await refrescarDatos();

    await registrarMovimiento(
      "VENTA",
      producto.nombre,
      cantidadVenta,
      producto.precio,
      varianteTexto
    );

    setIdVenta("");
    setIdVarianteVenta("");
    setCantidadVenta("");
  } catch (error) {
    console.error(error);
  }
};




const compra = async (e) => {
  e.preventDefault();
  if (!idCompra) return;

  const producto = productos.find(p => p._id === idCompra);
  if (!producto) return;

  try {
    let varianteTexto = "";

    if (idVarianteVenta) {
      const variante = varianteSeleccionadas.find(v => v._id === idVarianteVenta);

      await actualizarVariante(idVarianteVenta, {
        cantidad: variante.cantidad + Number(cantidadCompra)
      });

      // 🔑 guardar texto de variante
      varianteTexto = Object.entries(variante.atributos)
        .map(([k, val]) => `${k}: ${val}`)
        .join(" / ");
    } else {
      await actualizarProducto(idCompra, {
        cantidad: producto.cantidad + Number(cantidadCompra)
      });
    }

    await refrescarDatos();

    await registrarMovimiento(
      "COMPRA",
      producto.nombre,
      cantidadCompra,
      producto.costo,
      varianteTexto
    );

    // reset
    setIdCompra("");
    setIdVarianteVenta("");
    setCantidadCompra("");
  } catch (error) {
    console.error("Error en la compra:", error);
  }
};



// Variantes
const [varianteMod, setVarianteMod] = useState([]);

// Cambiar valor de variante
const cambiarVariante = (index, campo, valor) => {
  const copia = [...varianteMod];
  copia[index][campo] = campo === "cantidad" ? Number(valor) : valor;
  setVarianteMod(copia);
};

// Agregar nueva variante
const agregarVariante = () => {
  setVarianteMod([...varianteMod, { _id: null, nombre: "", valor: "", cantidad: 0 }]);
};

// Eliminar variante
const eliminarVariante = async (index) => {
  const v = varianteMod[index];

  // Si ya existe en la DB, borrarla
  if (v._id) {
    try {
      await axios.delete(`https://login-backend-v24z.onrender.com/variantes/${v._id}`);
    } catch (error) {
      console.error("Error al eliminar variante:", error);
      return;
    }
  }

  // Eliminar del estado local
  const copia = [...varianteMod];
  copia.splice(index, 1);
  setVarianteMod(copia);
};

// Modificar producto + variantes
const modificarProducto = async (e) => {
  e.preventDefault();
  if (!idMod) return;

  try {
    // 1️⃣ Modificar producto
    const resProd = await axios.put(`https://login-backend-v24z.onrender.com/productos/${idMod}`, {
      nombre: nombreMod,
      cantidad: Number(cantidadMod),
      precio: Number(precioMod),
      costo: Number(costoMod),
      descripcion: descripcionMod,
      stockEst: Number(stockEstMod)
    });

    // 2️⃣ Modificar variantes existentes o crear nuevas
    const peticiones = varianteMod.map(v => {
      // Validar que tenga nombre
      if (!v.nombre) return null;

      if (v._id) {
        // Modificar existente
        return axios.put(`https://login-backend-v24z.onrender.com/variantes/${v._id}`, {
          cantidad: Number(v.cantidad || 0),
          atributos: { [v.nombre]: v.valor || "" }
        });
      } else {
        // Crear nueva
        return axios.post(`https://login-backend-v24z.onrender.com/variantes`, {
          productoId: idMod,
          cantidad: Number(v.cantidad || 0),
          atributos: { [v.nombre]: v.valor || "" }
        });
      }
    }).filter(p => p !== null);

    await Promise.all(peticiones);

    // 3️⃣ Refrescar productos y variantes de ese listado
    const resProductos = await axios.get(`https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`);

    // Para variantes, traer por producto
    const variantesObj = {};
    for (const p of resProductos.data) {
      const resVar = await axios.get(`https://login-backend-v24z.onrender.com/variantes/producto/${p._id}`);
      variantesObj[p._id] = resVar.data;
    }

    setProductos(resProductos.data);
    setVariantes(variantesObj);

    // 4️⃣ Registrar movimiento
    await registrarMovimiento("MODIFICACIÓN", resProd.data.nombre, cantidadMod, resProd.data.precio);

    // 5️⃣ Reset formulario
    setIdMod("");
    setNombreMod("");
    setCantidadMod("");
    setPrecioMod("");
    setCostoMod("");
    setDescripcionMod("");
    setStockEstMod("");
    setVarianteMod([]);

  } catch (error) {
    console.error("Error al modificar producto y variantes", error);
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






const [check, setCheck] = useState(false)
const [atributos, setAtributos] = useState([
  { nombre: "", valor: "", cantidad: 0 }
])

const agregarAtributo = (e) => {
  e.preventDefault()
  setAtributos([...atributos, { nombre: "", valor: "", cantidad: 0 }])
}

const cambiarAtributo = (index, campo, value) => {
  const copia = [...atributos]
  copia[index][campo] = value
  setAtributos(copia)
}

const canti = atributos.reduce(
  (acc, a) => acc + Number(a.cantidad || 0),
  0
)


// Para manejar el producto seleccionado en la venta


// Para manejar la variante seleccionada (si el producto tiene variantes)
const [idVarianteVenta, setIdVarianteVenta] = useState(""); 

// Para guardar las variantes del producto seleccionado y mostrarlas en el select
const [varianteSeleccionadas, setVarianteSeleccionadas] = useState([]);














  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    <>
      <h1>Inventario</h1>
      <div className="contenedor-supremo">
        <div className="aside">
          <h2>Agregar productos</h2>
          <form onSubmit={carga}>
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
            <br />

            <label>Cantidad</label>
            {check ? (
              <input type="number" value={canti} disabled />
            ) : (
              <input
                type="number"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                required
              />
            )}
            <br />

            <label>Precio Unitario</label>
            <input
              type="number"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              required
            />
            <br />

            <label>Costo Unitario</label>
            <input
              type="number"
              value={costo}
              onChange={e => setCosto(e.target.value)}
              required
            />
            <br />

            <label>Descripcion</label>
            <input
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              required
            />
            <br />

            <label>Stock Estándar</label>
            <input
              type="number"
              value={stockEst}
              onChange={e => setStockEst(e.target.value)}
              required
            />
            <br />

            <label>Este producto tiene variantes</label>
            <input
              type="checkbox"
              checked={check}
              onChange={() => setCheck(!check)}
            />
            <br />

            {check && (
              <>
                <label>Variantes</label>
                <br />

                {atributos.map((attr, index) => (
                  <div key={index}>
                    <label>Atributo</label>
                    <input
                      type="text"
                      placeholder="Ej: Talle"
                      value={attr.nombre}
                      onChange={e =>
                        cambiarAtributo(index, "nombre", e.target.value)
                      }
                    />
                    <br />

                    <label>Valor</label>
                    <input
                      type="text"
                      placeholder="Ej: L"
                      value={attr.valor}
                      onChange={e =>
                        cambiarAtributo(index, "valor", e.target.value)
                      }
                    />
                    <br />

                    <label>Cantidad</label>
                    <input
                      type="number"
                      value={attr.cantidad}
                      onChange={e =>
                        cambiarAtributo(index, "cantidad", e.target.value)
                      }
                    />
                    <br />
                  </div>
                ))}

                <button onClick={agregarAtributo} style={{ width: "auto" }}>
                  Agregar atributo
                </button>
                <br />
              </>
            )}

            <button type="submit">Agregar</button>
          </form>



<h3>Venta</h3>
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



<h3>Compra</h3>
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



<h3>Modificar Producto</h3>
<form onSubmit={modificarProducto}>
  {/* Select de producto */}
  <label>Producto</label>
  <select
    value={idMod}
    onChange={e => {
      setIdMod(e.target.value);

      // Traer datos del producto seleccionado
      const producto = productos.find(p => p._id === e.target.value);
      if (producto) {
        setNombreMod(producto.nombre);
        setCantidadMod(producto.cantidad);
        setPrecioMod(producto.precio);
        setCostoMod(producto.costo);
        setDescripcionMod(producto.descripcion);
        setStockEstMod(producto.stockEst);

        // Traer variantes asociadas
        const vars = variantes[producto._id] || [];
        setVarianteMod(vars.map(v => ({
          _id: v._id,
          nombre: Object.keys(v.atributos)[0] || "",
          valor: Object.values(v.atributos)[0] || "",
          cantidad: v.cantidad
        })));
      } else {
        // Reset si no hay producto
        setNombreMod("");
        setCantidadMod("");
        setPrecioMod("");
        setCostoMod("");
        setDescripcionMod("");
        setStockEstMod("");
        setVarianteMod([]);
      }
    }}
    required
  >
    <option value="">Seleccionar producto</option>
    {productos.map(p => (
      <option key={p._id} value={p._id}>{p.nombre}</option>
    ))}
  </select>

  <br />
  <label>Nombre</label>
  <input type="text" value={nombreMod} onChange={e => setNombreMod(e.target.value)} required />
  <br />

  <label>Cantidad total</label>
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

  <label>Stock Estándar</label>
  <input type="number" value={stockEstMod} onChange={e => setStockEstMod(e.target.value)} required />
  <br />

  {/* VARIANTES */}
  <h4>Variantes</h4>
  {varianteMod.map((v, index) => (
    <div key={index} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}>
      <label>Atributo</label>
      <input
        type="text"
        value={v.nombre}
        onChange={e => cambiarVariante(index, "nombre", e.target.value)}
        required
      />
      <br />

      <label>Valor</label>
      <input
        type="text"
        value={v.valor}
        onChange={e => cambiarVariante(index, "valor", e.target.value)}
        required
      />
      <br />

      <label>Cantidad</label>
      <input
        type="number"
        value={v.cantidad}
        onChange={e => cambiarVariante(index, "cantidad", e.target.value)}
        min={0}
        required
      />
      <br />

      <button type="button" onClick={() => eliminarVariante(index)}>Eliminar Variante</button>
    </div>
  ))}

  <button type="button" onClick={agregarVariante}>Agregar Variante</button>
  <br /><br />

  <button type="submit">Modificar Producto</button>
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
                    {h.precio} | {h.variante && h.variante}
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
              const porcentaje =
                p.stockEst > 0 ? p.cantidad / p.stockEst : 0

              const estado =
                porcentaje < 0.5 ? "bajo"
                : porcentaje < 1 ? "medio"
                : "ok"

              const vars = variantes[p._id] || []

              return (
                <div className={`card-prod ${estado}`} key={p._id}>
                  <div className="titulo">
                    <h3>{p.nombre}</h3>
                  </div>

                  <hr />

                  <div className="main">
                    <h4>{p.cantidad} / {p.stockEst}</h4>

                    <div className="stock-bar">
                      <div
                        className={`fill ${estado}`}
                        style={{ width: `${Math.min(porcentaje * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="descr">
                    {p.descripcion || "Sin descripción"}
                  </div>

                  {/* 🔽 VARIANTES */}
                  {vars.length > 0 && (
                    <div className="variantes">
                      <h5>Variantes</h5>

                      <ul>
                        {vars.map(v => (
                          <li key={v._id}>
                            <span className="attrs">
                              {Object.entries(v.atributos)
                                .map(([k, val]) => `${k} ${val} `)
                                .join(" · ")}
                            </span>

                            <strong>: {v.cantidad}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}


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
