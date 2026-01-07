import { useContext, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {} from "@fortawesome/free-regular-svg-icons"
import { faMagnifyingGlass, faTrash, faPenToSquare, faArrowUpWideShort, faArrowDownWideShort } from "@fortawesome/free-solid-svg-icons"

const Productos = () => {
  const { isLoggedIn } = useContext(AuthContext)

  const listadoId = JSON.parse(localStorage.getItem("idDeListado"))
  const [productos, setProductos] = useState([])
  const [historial, setHistorial] = useState([])
  const [busquedaProdu, setBusquedaProdu] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState([])

  // 🔽🔼 ORDEN
  const [orden, setOrden] = useState("--")
  const [direccion, setDireccion] = useState("asc") // asc | desc

  console.log("productos ", productos)

  useEffect(() => {
    if (!listadoId) return

    const traerDatos = async () => {
      try {
        const [resProductos, resHistorial] = await Promise.all([
          axios.get(`https://login-backend-v24z.onrender.com/productos/listado/${listadoId}`),
          axios.get(`https://login-backend-v24z.onrender.com/movimientos/listado/${listadoId}`)
        ])

        setProductos(resProductos.data)
        setHistorial(resHistorial.data)
      } catch (error) {
        console.error(error)
      }
    }

    traerDatos()
  }, [listadoId])

  useEffect(() => {
    if (!busquedaProdu) {
      setProductosFiltrados([])
      return
    }

    const elementos = productos.filter(prod =>
      prod.nombre.toLowerCase().includes(busquedaProdu.toLowerCase())
    )
    setProductosFiltrados(elementos)
  }, [busquedaProdu, productos])

  const registrarMovimiento = async (tipo, producto, cantidad) => {
    try {
      const nuevoMovimiento = {
        listadoId,
        tipo,
        producto,
        cantidad: Number(cantidad),
        fecha: new Date()
      }

      const res = await axios.post(
        "https://login-backend-v24z.onrender.com/movimientos",
        nuevoMovimiento
      )

      setHistorial(prev => [res.data, ...prev])
    } catch (error) {
      console.error("Error al registrar movimiento", error)
    }
  }

  const eliminar = async (id) => {
    const productoLista = productos.find(p => p._id === id)
    if (!productoLista) return

    const { nombre, cantidad } = productoLista
    const confirmado = window.confirm(`¿Estás seguro que querés eliminar "${nombre}"?`)
    if (!confirmado) return

    setProductosFiltrados([])
    await axios.delete(`https://login-backend-v24z.onrender.com/productos/${id}`)
    setProductos(prev => prev.filter(p => p._id !== id))
    await registrarMovimiento("ELIMINAR", nombre, cantidad)
  }

  // 🔁 ORDENAMIENTO (con dirección)
  const productosOrdenados = [...productos].sort((a, b) => {
    let resultado = 0

    if (orden === "uno") resultado = a.stockEst - b.stockEst
    if (orden === "dos") resultado = a.cantidad - b.cantidad
    if (orden === "tres") resultado = a.precio - b.precio

    return direccion === "asc" ? resultado : -resultado
  })

  // PDF
  const descargarPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Stock Completo", 14, 20)
    doc.setFontSize(11)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 28)

    const tableColumn = ["Producto", "Cantidad", "Stock Ideal", "Precio"]

    const tableRows = productosOrdenados.map(p => [
      p.nombre,
      p.cantidad,
      p.stockEst,
      `$${p.precio}`
    ])

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 }
    })

    doc.save("stock-completo.pdf")
  }

  if (!isLoggedIn) return <Navigate to="/" replace />

  return (
    <div className="contenedor-stock">
      <h1>Stock Completo</h1>

      {/* BUSCADOR */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type="text" id="busqueda"
          placeholder="Producto..."
          onChange={e => setBusquedaProdu(e.target.value)}
          style={{ paddingLeft: "30px" }}
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888"
          }}
        />
      </div>

      {/* PRODUCTO BUSCADO */}
      {productosFiltrados.length > 0 && (
        <>
          <h2>Producto Buscado</h2>
          <div className="contenedor-main-stock">
            <ul>
              {productosFiltrados.map(p => {
                const ratio = p.cantidad / p.stockEst

                return (
                  <li
                    key={p._id}
                    className={`item-stock ${
                      ratio < 0.5 ? "bajo" : ratio < 1 ? "medio" : "ok"
                    }`}
                  >
                    <div className="stock-info">
                      <h3>{p.nombre}</h3>
                      <span>Stock: {p.cantidad} / {p.stockEst}</span>
                    </div>

                    <div className="stock-extra">
                      <span className="precio">${p.precio}</span>
                      <div className="iconosMod">
                        <button onClick={() => eliminar(p._id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

      {/* ORDEN */}
      <h2>Productos</h2>
      <div className="ordenar" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <select
          value={orden}
          onChange={e => {
            setOrden(e.target.value)
            setDireccion("asc")
          }}
        >
          <option value="--">Ordenar por...</option>
          <option value="uno">Ordenar por stock</option>
          <option value="dos">Ordenar por cantidad</option>
          <option value="tres">Ordenar por precio</option>
        </select>

        <button
          onClick={() => setDireccion(direccion === "asc" ? "desc" : "asc")}
          title={direccion === "asc" ? "Ascendente" : "Descendente"}
          className="btn-orden"
        >
          <FontAwesomeIcon
            icon={direccion === "asc" ? faArrowUpWideShort : faArrowDownWideShort}
          />
        </button>
      </div>

      {/* LISTADO */}
      <div className="contenedor-main-stock">
        <ul>
          {productosOrdenados.map(p => {
            const ratio = p.cantidad / p.stockEst

            return (
              <li
                key={p._id}
                className={`item-stock ${
                  ratio < 0.5 ? "bajo" : ratio < 1 ? "medio" : "ok"
                }`}
              >
                <div className="stock-info">
                  <h3>{p.nombre}</h3>
                  <span>
                    Stock: {p.cantidad} / {p.stockEst} | Rentabilidad:{" "}
                    {(((p.precio - p.costo) / p.costo) * 100).toFixed(2)}%
                  </span>
                </div>

                <div className="stock-extra">
                  <span className="precio">${p.precio}</span>
                  <div className="iconosMod">
                    <button onClick={() => eliminar(p._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <button onClick={descargarPDF} className="btn-pdf">
        📄 Descargar PDF
      </button>
    </div>
  )
}

export default Productos
