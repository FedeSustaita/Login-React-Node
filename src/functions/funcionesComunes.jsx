import axios from "axios";

const API = "https://login-backend-v24z.onrender.com";

export const traerDatos = async (listadoId) => {
  const [resProductos, resHistorial] = await Promise.all([
    axios.get(`${API}/productos/listado/${listadoId}`),
    axios.get(`${API}/movimientos/listado/${listadoId}`)
  ]);

  const variantesArray = await Promise.all(
    resProductos.data.map(p =>
      axios.get(`${API}/variantes/producto/${p._id}`).then(res => ({
        productoId: p._id,
        variantes: res.data
      }))
    )
  );

  const variantesObj = {};
  variantesArray.forEach(v => {
    variantesObj[v.productoId] = v.variantes;
  });

  return {
    productos: resProductos.data,
    historial: resHistorial.data,
    variantes: variantesObj
  };
};


export const calcularCantidadTotal = (check, atributos, cantidad) => {
  return check
    ? atributos.reduce((acc, a) => acc + Number(a.cantidad || 0), 0)
    : Number(cantidad);
};


export const crearProductoConVariantes = async ({listadoId,nombre,cantidad,precio,stockEst,descripcion,costo,check,
  atributos}) => {
  // crear producto
  const resProducto = await axios.post(`${API}/productos`, {
    listadoId,
    nombre,
    cantidad,
    precio,
    stockEst,
    descripcion,
    costo
  });

  const productoCreado = resProducto.data;

  // crear variantes
  if (check) {
    const peticiones = atributos.map(attr =>
      axios.post(`${API}/variantes`, {
        productoId: productoCreado._id,
        cantidad: Number(attr.cantidad || 0),
        atributos: {
          [attr.nombre]: attr.valor
        }
      })
    );

    await Promise.all(peticiones);
  }

  return productoCreado;
};

export const getProductos = (listadoId) =>
  axios.get(`${API}/productos/listado/${listadoId}`);

export const crearProducto = (data) =>
  axios.post(`${API}/productos`, data);

export const actualizarProducto = (id, data) =>
  axios.put(`${API}/productos/${id}`, data);

export const getVariantesPorProducto = (productoId) =>
  axios.get(`${API}/variantes/producto/${productoId}`);

export const actualizarVariante = (id, data) =>
  axios.put(`${API}/variantes/${id}`, data);

export const crearVariante = (data) =>
  axios.post(`${API}/variantes`, data);

export const getMovimientos = (listadoId) =>
  axios.get(`${API}/movimientos/listado/${listadoId}`);


