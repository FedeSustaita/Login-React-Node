import { useContext, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../AuthContext"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {} from "@fortawesome/free-regular-svg-icons"
import {faMagnifyingGlass, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons"

const Productos = () => {
    const { isLoggedIn } = useContext(AuthContext)

    const listadoId = JSON.parse(localStorage.getItem("idDeListado"));
    const [productos, setProductos] = useState([])
    const [historial, setHistorial] = useState([]);
    const [busquedaProdu, setBusquedaProdu] = useState('')
    const [productosFiltrados, setProductosFiltrados]=useState([])
    console.log('productos ', productos);
    

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

        console.log("Productos:", resProductos.data);
        console.log("Historial:", resHistorial.data);

        } catch (error) {
        console.error(error);
        }
    };

    traerDatos();
    }, [listadoId]);

    useEffect(() => {
      if (!busquedaProdu) {
        setProductosFiltrados([]); // input vacío → lista filtrada vacía
        return;
      }
      const elementos = productos.filter(prod =>
        prod.nombre.toLowerCase().includes(busquedaProdu.toLowerCase())
      )
      setProductosFiltrados(elementos)
      console.log(productosFiltrados);
      
    }, [busquedaProdu,productos])

    const registrarMovimiento = async (tipo, producto, cantidad) => {
    try {
        const nuevoMovimiento = {
          listadoId,
          tipo,
          producto,
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
      const eliminar = async (id) => {
        const productoLista = productos.find(p => p._id === id);
        if (!productoLista) return;
        const { nombre, cantidad } = productoLista;
        const confirmado = window.confirm(`¿Estás seguro que querés eliminar "${nombre}"?`);
        if (!confirmado) return; // si el usuario hace "Cancelar", no sigue
        setProductosFiltrados([])
        await axios.delete(`https://login-backend-v24z.onrender.com/productos/${id}`);
        setProductos(prev => prev.filter(p => p._id !== id));
        await registrarMovimiento("ELIMINAR", nombre, cantidad);
    };


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
      
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type="text" name="busqueda" id="busqueda" placeholder="Producto..." onChange={(e) => setBusquedaProdu(e.target.value)} style={{ paddingLeft: "30px" }} // deja espacio para el ícono
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

      {productosFiltrados.length > 0 ? (
        <>
            <h2>
              Producto Buscado
            </h2>
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
                      <span>
                        Stock: {p.cantidad} / {p.stockEst}
                      </span>
                    </div>

                    <div className="stock-extra">
                      <span className="precio">${p.precio}</span>
                      <div className="iconosMod">
                        <button onClick={() => eliminar(p._id)}><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      ): (
        <></>
      )}

      <h2>
        Productos
      </h2>
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
                    Stock: {p.cantidad} / {p.stockEst} | 
                    Rentabilidad: {( (p.precio - p.costo) / p.costo ).toFixed(2)}%
                  </span>
                </div>

                    <div className="stock-extra">
                      <span className="precio">${p.precio}</span>
                      <div className="iconosMod">
                        <button onClick={() => eliminar(p._id)}><FontAwesomeIcon icon={faTrash} /></button>
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
