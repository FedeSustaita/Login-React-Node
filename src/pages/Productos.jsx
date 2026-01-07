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
  const nombre = isLoggedIn
    ? JSON.parse(localStorage.getItem("usuario"))
    : null;
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

  // 📌 ENCABEZADO
  doc.setFontSize(18)
  doc.text("Reporte de Stock Completo", 14, 20)

  doc.setFontSize(11)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 28)
  doc.text("Sistema: Inventory & Sales System", 14, 34)
  doc.text(`Generado por: ${nombre}`, 14, 40)

  // 📊 DATOS CALCULADOS
  const totalProductos = productosOrdenados.length
  const productosBajoStock = productosOrdenados.filter(
    p => p.cantidad < p.stockEst
  )

  const valorTotal = productosOrdenados.reduce(
    (acc, p) => acc + p.cantidad * p.precio,
    0
  )

  // 📊 RESUMEN
  doc.setFontSize(14)
  doc.text("Resumen", 14, 52)

  doc.setFontSize(11)
  doc.text(`Total de productos: ${totalProductos}`, 14, 60)
  doc.text(`Productos con stock bajo: ${productosBajoStock.length}`, 14, 66)
  doc.text(`Valor total del inventario: $${valorTotal}`, 14, 72)

  // 📋 TABLA PRINCIPAL
  const tableColumn = [
    "Producto",
    "Stock",
    "Punto de Reposición",
    "Precio",
    "Valor",
    "Estado"
  ]

  const tableRows = productosOrdenados.map(p => {
    const valor = p.cantidad * p.precio
    let estado = "OK"

    if (p.cantidad < p.stockEst) estado = "MEDIO"
    if (p.cantidad/p.stockEst < 0.5) estado = "CRÍTICO"

    return [
      p.nombre,
      p.cantidad,
      p.stockEst,
      `$${p.precio}`,
      `$${valor}`,
      estado
    ]
  })

  autoTable(doc, {
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 30, 30] }
  })

  // ⚠️ STOCK BAJO
  if (productosBajoStock.length > 0) {
    doc.addPage()

    doc.setFontSize(16)
    doc.text("Productos con Stock Medio/Bajo", 14, 20)

    const lowStockRows = productosBajoStock.map(p => [
      p.nombre,
      p.cantidad,
      p.stockEst,
      p.stockEst - p.cantidad
    ])

    autoTable(doc, {
      startY: 30,
      head: [["Producto", "Stock", "Ideal", "Faltante"]],
      body: lowStockRows,
      styles: { fontSize: 10 }
    })
  }

  // 🧾 PIE
  doc.setFontSize(10)
  doc.text(
    "Reporte generado automáticamente por el sistema",
    14,
    doc.internal.pageSize.height - 10
  )

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
