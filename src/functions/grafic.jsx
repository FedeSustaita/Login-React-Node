import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const VentasVsCompras = ({ historial }) => {
  const datosProcesados = useMemo(() => {
    const productos = {};

    historial.forEach(item => {
      if (!productos[item.producto]) {
        productos[item.producto] = { ventas: 0, compras: 0 };
      }

      if (item.tipo === "VENTA") {
        productos[item.producto].ventas += item.cantidad;
      }

      if (item.tipo === "COMPRA") {
        productos[item.producto].compras += item.cantidad;
      }
    });

    // Convertimos a array y ordenamos por ventas
    return Object.entries(productos)
      .map(([producto, valores]) => ({
        producto,
        ventas: valores.ventas,
        compras: valores.compras
      }))
      .sort((a, b) => b.ventas - a.ventas);
  }, [historial]);

  const labels = datosProcesados.map(i => i.producto);
  const datosVentas = datosProcesados.map(i => i.ventas);
  const datosCompras = datosProcesados.map(i => i.compras);

  const data = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Compras",
        data: datosCompras,
        backgroundColor: "rgba(34, 197, 94, 0.7)" // 🟢 verde
      },
      {
        type: "line",
        label: "Ventas",
        data: datosVentas,
        borderColor: "rgba(239, 68, 68, 1)", // 🔴 rojo
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Ventas vs Compras por Producto"
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw} unidades`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return <Chart data={data} options={options} />;
};

export default VentasVsCompras;
