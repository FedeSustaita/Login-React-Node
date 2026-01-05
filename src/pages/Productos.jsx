import { useContext, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const Productos = () => {
    const { isLoggedIn } = useContext(AuthContext)

    const listadoId = JSON.parse(localStorage.getItem("idDeListado"));
    const [productos, setProductos] = useState([])

  useEffect(() => {
    if (!listadoId) return

    const traerDatos = async () => {
      try {
        const [resProductos] = await Promise.all([
            axios.get(`http://localhost:3000/productos/listado/${listadoId}`)
        ])
        setProductos(resProductos.data)
      } catch (error) {
        console.error("Error al traer datos", error)
      }
    }

    traerDatos()
  }, [listadoId])

  // Ordenar productos por cantidad
  const productosOrdenados = [...productos].sort(
    (a, b) => a.cantidad - b.cantidad
  )

  // Generar PDF
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

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="contenedor-stock">
      <h1>Stock Completo</h1>

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
                    Stock: {p.cantidad} / {p.stockEst}
                  </span>
                </div>

                <div className="stock-extra">
                  <span className="precio">${p.precio}</span>
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
