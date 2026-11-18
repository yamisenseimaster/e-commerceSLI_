import React, { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { FiFilter, FiMoreVertical, FiShoppingBag } from 'react-icons/fi';
import { MdPaid } from 'react-icons/md';
import BarraLateral from './BarraLateral';
import { apiAdministracion, apiPedidos } from '../../servicios/api';
import { usarProductos } from '../../Contextos/ContextoProductos';
import { usarAjustesTema } from '../../Contextos/ContextoTema';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const estiloTarjeta =
  'rounded-[14px] border border-[#d9e0ea] bg-white shadow-sm shadow-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none dark:hover:border-[#383838]';

function formatearDinero(valor) {
  return `$${Number(valor || 0).toLocaleString('en-IN')}`;
}

function Administracion() {
  const { theme: tema } = usarAjustesTema();
  const { products: productos } = usarProductos();
  const [estadisticas, establecerEstadisticas] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completeOrders: 0,
    canceledOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenue: 0,
  });
  const [pedidos, establecerPedidos] = useState([]);
  const [activeMetricMenu, setActiveMetricMenu] = useState(null);
  const esOscuro = tema.mode === 'dark';

  useEffect(() => {
    Promise.all([apiAdministracion.estadisticas(), apiPedidos.listar()])
      .then(([nextStats, nextOrders]) => {
        establecerEstadisticas(nextStats);
        establecerPedidos(nextOrders);
      })
      .catch(() => {});
  }, []);

  const textColor = esOscuro ? '#9ca3af' : '#667085';
  const gridColor = esOscuro ? '#2b2b2b' : '#e8edf5';
  const chartTheme = esOscuro ? 'dark' : 'light';
  const productosInventario = productos.length ? productos : productosDeEjemplo;
  const resumenInventario = useMemo(() => {
    const totalUnidades = productosInventario.reduce(
      (suma, producto) => suma + obtenerCantidad(producto),
      0,
    );
    const stockBajo = productosInventario.filter((producto) => {
      const cantidad = obtenerCantidad(producto);
      return cantidad > 0 && cantidad <= 20;
    }).length;
    const sinStock = productosInventario.filter(
      (producto) => obtenerCantidad(producto) === 0,
    ).length;

    return {
      totalUnits: totalUnidades,
      lowStock: stockBajo,
      outOfStock: sinStock,
    };
  }, [productosInventario]);
  const ingresos = Number(estadisticas.revenue ?? estadisticas.totalSales ?? 0);
  const gastos = Number(estadisticas.expenses ?? 0);
  const ganancia = Number(
    estadisticas.profit ?? Math.max(ingresos - gastos, 0),
  );
  const totalClientes = Number(
    estadisticas.totalCustomers ?? estadisticas.customers ?? 0,
  );
  const totalProductos = Number(
    estadisticas.totalProducts ??
      estadisticas.products ??
      productosInventario.length,
  );
  const pedidosPendientes = Number(estadisticas.pendingOrders ?? 0);
  const recentOrdersDisplay = [...pedidos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const salesChart = useMemo(() => crearVentasMensuales(pedidos), [pedidos]);

  const miniCards = [
    {
      title: 'Ingresos totales',
      value: formatearDinero(ingresos),
      delta: `${pedidos.length} ped.`,
      color: tema.accent,
      data: salesChart.data,
    },
    {
      title: 'Clientes totales',
      value: totalClientes.toLocaleString('en-US'),
      delta: `${totalClientes} real`,
      color: '#22cdc6',
      data: [0, totalClientes, totalClientes, totalClientes],
    },
    {
      title: 'Ventas sin envio',
      value: formatearDinero(ganancia),
      delta: 'neto',
      color: '#1fc2fb',
      data: [0, ganancia, Math.max(ganancia - gastos, 0), ganancia],
    },
    {
      title: 'Productos totales',
      value: totalProductos.toLocaleString('es-ES'),
      delta: `${resumenInventario.lowStock} bajos`,
      color: '#6c5ce7',
      data: [0, totalProductos, resumenInventario.totalUnits, totalProductos],
    },
  ];

  const analyticsOptions = useMemo(
    () => ({
      chart: {
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif',
        foreColor: textColor,
      },
      theme: { mode: chartTheme },
      colors: [tema.accent],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 0 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.7,
          opacityFrom: 0.28,
          opacityTo: 0.02,
          stops: [0, 85, 100],
        },
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: salesChart.labels,
        axisBorder: { color: gridColor },
        axisTicks: { color: gridColor },
        labels: { style: { colors: textColor } },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        tickAmount: 4,
        labels: {
          formatter: (valor) => formatearDineroAbreviado(valor),
          style: { colors: [textColor] },
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: chartTheme,
        marker: { show: false },
        y: { formatter: (valor) => formatearDinero(valor) },
      },
    }),
    [chartTheme, gridColor, salesChart.labels, textColor, tema.accent],
  );

  return (
    <BarraLateral title="Tienda" eyebrow="Paneles">
      <div className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-12">
        <section className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5 xl:col-span-12 xl:grid-cols-4">
          {miniCards.map((card, indice) => (
            <div
              key={card.title}
              className={`${estiloTarjeta} relative h-[132px] overflow-hidden px-3.5 pb-3 pt-3.5 sm:h-[166px] sm:px-5 sm:pt-5`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <h3 className="truncate text-[21px] font-black leading-[25px] text-[#162033] dark:text-white xs:text-[24px] sm:text-[30px] sm:leading-[34px]">
                      {card.value}
                    </h3>
                    <span className="rounded-[4px] border border-[#b9dcff] bg-[#eef6ff] px-1.5 py-0.5 text-[9px] font-bold text-[var(--dash-accent)] dark:border-[#2f3f5f] dark:bg-[#202938] dark:text-[#7db7ff] sm:px-2 sm:text-[11px]">
                      {card.delta}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[12px] font-medium text-[#667085] dark:text-[#9ca3af] sm:text-[15px]">
                    {card.title}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[16px] text-[#162033] transition hover:bg-[#f3f7ff] dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() =>
                    setActiveMetricMenu((actual) =>
                      actual === indice ? null : indice,
                    )
                  }
                  aria-label="Opciones de metrica">
                  <FiMoreVertical />
                </button>
                {activeMetricMenu === indice && (
                  <div className="absolute right-5 top-12 z-10 w-32 rounded-[5px] border border-[#d9e0ea] bg-white py-2 text-[13px] shadow-lg shadow-slate-200/80 dark:border-[#303030] dark:bg-[#202020] dark:shadow-none">
                    {['Dia', 'Semana', 'Ano'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setActiveMetricMenu(null)}
                        className="block w-full px-5 py-2 text-left font-medium text-[#36445a] hover:bg-[#f3f7ff] dark:text-slate-200 dark:hover:bg-slate-800">
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2.5 left-3.5 right-3.5 h-[54px] sm:bottom-4 sm:left-5 sm:right-5 sm:h-[72px]">
                <MinigraficoIndicador
                  data={card.data}
                  color={card.color}
                  id={`kpi-${indice}`}
                />
              </div>
            </div>
          ))}
        </section>

        <section
          className={`${estiloTarjeta} min-w-0 p-5 sm:p-6 xl:col-span-9`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[20px] font-black text-[#162033] dark:text-white">
              Analiticas
            </h3>
            <div className="flex gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#b8c1ce] px-4 text-[14px] font-semibold text-[#596579] dark:border-[#303030] dark:bg-[#202020] dark:text-slate-300">
                <FiFilter className="text-[14px]" /> Filtro
              </button>
              <button className="h-9 rounded-[9px] border border-[#d9e0ea] px-4 text-[14px] font-semibold text-[#596579] dark:border-[#303030] dark:bg-[#202020] dark:text-slate-300">
                Este mes
              </button>
            </div>
          </div>
          <Chart
            type="area"
            height={304}
            series={[{ name: 'Ventas', data: salesChart.data }]}
            options={analyticsOptions}
          />
        </section>

        <section className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:col-span-3 xl:grid-cols-1">
          <TarjetaInformacion
            title="Ingresos"
            value={formatearDinero(ingresos)}
            detail="Total registrado en pedidos"
            badge="API"
            icon={<MdPaid />}
            color="#22cdc6"
          />

          <TarjetaInformacion
            title="Envio cobrado"
            value={formatearDinero(gastos)}
            detail="Costos de envio registrados"
            badge={`${pedidosPendientes} pend.`}
            icon={<FiShoppingBag />}
            color="#f34b7e"
          />
        </section>

        <section
          className={`${estiloTarjeta} min-w-0 h-full p-5 xl:col-span-4`}>
          <CabeceraTarjeta title="Pedidos recientes" />
          <div className="divide-y divide-[#e5eaf1] dark:divide-slate-800">
            {recentOrdersDisplay.map((pedido) => (
              <div
                key={pedido.id}
                className="flex min-h-[72px] items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-[52px] w-[52px] shrink-0 rounded-[10px] bg-[#eef5ff]">
                    <img
                      src={normalizarImagen(obtenerImagenPedido(pedido))}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full rounded-[9px] object-cover"
                    />
                  </div>
                  <div>
                    <p className="max-w-[190px] truncate text-[16px] font-bold text-[#26344a] dark:text-white sm:max-w-[240px]">
                      {obtenerTituloPedido(pedido)}
                    </p>
                    <p className="text-[13px] font-medium text-[#8b96a8]">
                      {pedido.date ||
                        new Date(pedido.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <p className="text-[16px] font-black text-[#162033] dark:text-white">
                  {formatearDinero(pedido.total || pedido.price)}
                </p>
              </div>
            ))}
            {recentOrdersDisplay.length === 0 && (
              <p className="py-8 text-center text-sm font-semibold text-[#8b96a8]">
                Todavia no hay pedidos registrados.
              </p>
            )}
          </div>
        </section>

        <section
          className={`${estiloTarjeta} min-w-0 h-full p-5 xl:col-span-8`}>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <CabeceraTarjeta title="Reporte de stock" compact />
            <div className="flex flex-wrap gap-2 text-[13px] font-bold">
              <span className="rounded-[8px] bg-blue-50 px-3 py-1.5 text-[var(--dash-accent)] dark:bg-[#202938] dark:text-[#7db7ff]">
                {productosInventario.length} productos
              </span>
              <span className="rounded-[8px] bg-green-50 px-3 py-1.5 text-[#11c5af] dark:bg-[#0f2b26]">
                {resumenInventario.totalUnits} unidades
              </span>
              <span className="rounded-[8px] bg-yellow-50 px-3 py-1.5 text-[#c3a900] dark:bg-[#302a12] dark:text-[#f0d858]">
                {resumenInventario.lowStock} bajos
              </span>
              <span className="rounded-[8px] bg-red-50 px-3 py-1.5 text-[#f34b7e] dark:bg-[#321823]">
                {resumenInventario.outOfStock} sin stock
              </span>
            </div>
          </div>
          <div className="scrollbar-invisible max-h-[360px] overflow-auto">
            <table className="min-w-[800px] text-[15px]">
              <thead className="sticky top-0 z-[1] bg-[#eef2f7] text-left text-[14px] font-black text-[#36445a] dark:bg-[#222222] dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eaf1] dark:divide-slate-800">
                {productosInventario.map((producto, indice) => (
                  <tr key={obtenerClaveProducto(producto, indice)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={normalizarImagen(producto.image)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-11 w-11 rounded-[9px] object-cover"
                        />
                        <span className="max-w-[280px] truncate font-semibold text-[#26344a] dark:text-white">
                          {producto.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#445267] dark:text-[#aab2c0]">
                      {obtenerIdProducto(producto, indice)}
                    </td>
                    <td className="px-4 py-3 text-[#445267] dark:text-[#aab2c0]">
                      {formatearDinero(producto.salePrice || producto.price)}
                    </td>
                    <td className="px-4 py-3">
                      <InsigniaExistencias
                        quantity={obtenerCantidad(producto)}
                      />
                    </td>
                    <td className="px-4 py-3 text-[#445267] dark:text-[#aab2c0]">
                      {formatearFecha(producto.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[#445267] dark:text-[#aab2c0]">
                      {obtenerCantidad(producto)} PCS
                    </td>
                  </tr>
                ))}
                {productosInventario.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-6 text-center font-semibold text-[#8b96a8]"
                      colSpan={6}>
                      No hay productos cargados en el inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </BarraLateral>
  );
}

function CabeceraTarjeta({ title: titulo, compact = false }) {
  return (
    <div
      className={`${compact ? '' : 'mb-2'} flex items-center justify-between`}>
      <h3 className="text-[20px] font-black text-[#162033] dark:text-white">
        {titulo}
      </h3>
      <FiMoreVertical className="text-[18px] text-[#8b96a8]" />
    </div>
  );
}

function TarjetaInformacion({
  title: titulo,
  value: valor,
  detail,
  badge,
  icon: icono,
  color,
}) {
  return (
    <div className={`${estiloTarjeta} min-h-[136px] p-5`}>
      <div className="flex items-start justify-between">
        <p className="text-[16px] font-bold text-[#26344a] dark:text-white">
          {titulo}
        </p>
        <span className="rounded-[7px] bg-[#f8fafc] px-2.5 py-1 text-[12px] font-bold text-[#5d6a7f] dark:bg-slate-800 dark:text-slate-300">
          Hoy
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] text-[27px] text-white"
          style={{ backgroundColor: color }}>
          {icono}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[31px] font-black leading-9 text-[#162033] dark:text-white">
              {valor}
            </h3>
            <span
              className="rounded-[6px] border border-current px-2 py-0.5 text-[12px] font-bold"
              style={{ color }}>
              {badge}
            </span>
          </div>
          <p className="mt-1 text-[14px] font-medium text-[#8b96a8]">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function MinigraficoIndicador({ data: datos, color, id: identificador }) {
  const width = 260;
  const height = 70;
  const paddingX = 4;
  const top = 8;
  const bottom = 58;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const range = max - min || 1;
  const points = datos.map((valor, indice) => {
    const x = paddingX + (indice * (width - paddingX * 2)) / (datos.length - 1);
    const y = bottom - ((valor - min) / range) * (bottom - top);
    return { x, y };
  });

  const stepPath = points.reduce((ruta, point, indice) => {
    if (indice === 0) return `M ${point.x} ${point.y}`;
    const anterior = points[indice - 1];
    return `${ruta} H ${point.x} V ${point.y}`;
  }, '');
  const areaPath = `${stepPath} V ${height} H ${points[0].x} Z`;

  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true">
      <defs>
        <linearGradient
          id={`${identificador}-fill`}
          x1="0"
          x2="0"
          y1="0"
          y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${identificador}-fill)`} />
      <path
        d={stepPath}
        fill="none"
        stroke={color}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function InsigniaExistencias({ quantity: cantidad }) {
  if (cantidad > 20) {
    return (
      <span className="rounded-[7px] bg-[#11c5af] px-3 py-1.5 text-[12px] font-bold text-white">
        Disponible
      </span>
    );
  }

  if (cantidad > 0) {
    return (
      <span className="rounded-[7px] bg-[#e9ce1b] px-3 py-1.5 text-[12px] font-bold text-white">
        Stock bajo
      </span>
    );
  }

  return (
    <span className="rounded-[7px] bg-[#f34b7e] px-3 py-1.5 text-[12px] font-bold text-white">
      Sin stock
    </span>
  );
}

function normalizarImagen(imagen) {
  if (!imagen) return '/images/products/11.png';
  if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
  if (imagen.startsWith('/media/')) return `${ORIGEN_API}${imagen}`;
  if (imagen.startsWith('/products/'))
    return imagen.replace('/products/', '/images/products/');
  return imagen;
}

function obtenerIdProducto(producto, indice) {
  const identificador = String(
    producto.id || producto._id || `STK-${indice + 1}`,
  );
  return identificador.length > 8 ? identificador.slice(-8) : identificador;
}

function obtenerClaveProducto(producto, indice) {
  return String(producto.id || producto._id || `product-${indice}`);
}

function obtenerCantidad(producto) {
  return Number(producto.quantity ?? producto.stock ?? 0);
}

function obtenerImagenPedido(pedido) {
  return pedido.image || pedido.items?.[0]?.image || '/images/products/11.png';
}

function obtenerTituloPedido(pedido) {
  const firstItem = pedido.items?.[0];
  if (!firstItem)
    return pedido.title || `Pedido #${String(pedido.id).slice(0, 8)}`;
  const extraItems = Math.max((pedido.items?.length || 1) - 1, 0);
  return extraItems ? `${firstItem.title} +${extraItems}` : firstItem.title;
}

function formatearFecha(valor) {
  if (!valor) return '01/08/2025';

  return new Date(valor).toLocaleDateString('es-ES');
}

function crearVentasMensuales(pedidos) {
  const months = [];
  const today = new Date();

  for (let indice = 5; indice >= 0; indice -= 1) {
    const fecha = new Date(today.getFullYear(), today.getMonth() - indice, 1);
    const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    months.push({
      key: clave,
      label: fecha.toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
      }),
      total: 0,
    });
  }

  pedidos.forEach((pedido) => {
    const fecha = new Date(pedido.createdAt);
    const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    const mes = months.find((elemento) => elemento.key === clave);
    if (mes) mes.total += Number(pedido.total || 0);
  });

  return {
    labels: months.map((elemento) => elemento.label),
    data: months.map((elemento) => elemento.total),
  };
}

function formatearDineroAbreviado(valor) {
  const amount = Number(valor || 0);
  if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
  return `$${amount}`;
}

const productosDeEjemplo = [
  {
    id: '00101',
    title: 'Apple AirPods Pro',
    salePrice: 249,
    quantity: 40,
    image: '/images/products/11.png',
  },
  {
    id: '00102',
    title: 'Samsung Galaxy Watch 6',
    salePrice: 349,
    quantity: 15,
    image: '/images/products/12.png',
  },
  {
    id: '00103',
    title: 'Sony WH-1000XM5 Headphones',
    salePrice: 399,
    quantity: 0,
    image: '/images/products/13.png',
  },
  {
    id: '00104',
    title: 'Dell XPS 13 Laptop',
    salePrice: 1199,
    quantity: 25,
    image: '/images/products/14.png',
  },
  {
    id: '00105',
    title: 'GoPro Hero 12 Black',
    salePrice: 429,
    quantity: 60,
    image: '/images/products/15.png',
  },
];

export default Administracion;
