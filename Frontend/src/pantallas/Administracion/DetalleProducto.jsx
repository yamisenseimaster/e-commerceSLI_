import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArchive, FiBox, FiChevronLeft, FiChevronRight, FiEye, FiHeart, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import BarraLateral from './BarraLateral';
import { traducirCategoria } from '../../utilidades/localizacion';
import { usarProductos } from '../../Contextos/ContextoProductos';
const ORIGEN_API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
function DetalleProducto() {
  const {
    productId: idProducto
  } = useParams();
  const {
    products: productos,
    loading: cargando
  } = usarProductos();
  const [cantidad, establecerCantidad] = useState(1);
  const producto = useMemo(() => productos.find(elemento => [elemento.id, elemento._id, elemento.slug].filter(Boolean).includes(idProducto)), [productos, idProducto]);
  const relacionadoProductos = useMemo(() => {
    if (!producto) return productos.slice(0, 10);
    const coincidente = productos.filter(elemento => obtenerClaveProducto(elemento) !== obtenerClaveProducto(producto)).filter(elemento => elemento.type === producto.type || elemento.tags?.some(etiqueta => producto.tags?.includes(etiqueta)));
    return (coincidente.length >= 5 ? coincidente : productos.filter(elemento => obtenerClaveProducto(elemento) !== obtenerClaveProducto(producto))).slice(0, 10);
  }, [producto, productos]);
  if (cargando) {
    return <BarraLateral title="Detalles de producto" eyebrow="Tienda">
        <div className="rounded-[6px] border border-[#d9e0ea] bg-white p-10 text-center font-bold text-[#7b8798]">
          Cargando producto...
        </div>
      </BarraLateral>;
  }
  if (!producto) {
    return <BarraLateral title="Detalles de producto" eyebrow="Tienda">
        <div className="rounded-[6px] border border-[#d9e0ea] bg-white p-10 text-center">
          <p className="font-black text-[#162033]">No se encontro este producto.</p>
          <Link className="mt-4 inline-flex h-10 items-center rounded-[5px] bg-main px-4 text-sm font-black text-white" to="/admin/products">
            Volver a productos
          </Link>
        </div>
      </BarraLateral>;
  }
  const precio = Number(producto.salePrice || producto.price || 0);
  const inventario = Number(producto.quantity || 0);
  const estado = obtenerEstadoInventario(inventario);
  return <BarraLateral title="Detalles de producto" eyebrow="Tienda">
      <div className="space-y-5">
        <section className="rounded-[6px] border border-[#d9e0ea] bg-white p-5 shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
          <Link to="/admin/products" className="mb-5 inline-flex items-center gap-2 text-[13px] font-bold text-main">
            <FiChevronLeft /> Volver a productos
          </Link>

          <div className="grid gap-8 lg:grid-cols-[430px_minmax(0,1fr)]">
            <div className="flex min-h-[430px] items-center justify-center rounded-[6px] bg-[#f7f8fb] p-8 dark:bg-slate-950">
              <img src={normalizarImagen(producto.image)} alt={producto.title} loading="lazy" decoding="async" className="max-h-[360px] w-full object-contain" onError={evento => {
              evento.currentTarget.src = '/images/products/11.png';
            }} />
              
            </div>

            <div className="relative py-2">
              <button type="button" className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[20px] text-[#64748b] transition hover:bg-[#f3f7ff] hover:text-main" title="Agregar a favoritos">
                
                <FiHeart />
              </button>

              <div className="flex flex-wrap gap-2 pr-12">
                <InventarioInsignia status={estado} />
                <InsigniaCategoria category={producto.type} />
              </div>

              <h2 className="mt-4 text-[30px] font-black leading-tight text-[#162033] dark:text-white">{producto.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-[14px] font-medium text-[#7b8798]">
                <FiArchive /> {traducirCategoria(producto.type) || 'General'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="text-[13px] font-bold text-[#27c8c2]">{inventario > 0 ? 'En stock' : 'Sin stock'}</span>
              </div>

              <p className="mt-5 text-[28px] font-black text-[#162033] dark:text-white">{formatearDinero(precio)}</p>
              <p className="mt-1 text-[13px] font-bold text-[#27c8c2]">Envio gratis en pedidos sobre $50</p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="text-[14px] font-black text-[#64748b]">Cantidad</span>
                <div className="flex overflow-hidden rounded-[5px] border border-[#cfd9e8]">
                  <button type="button" className="flex h-10 w-12 items-center justify-center text-main" onClick={() => establecerCantidad(actual => Math.max(1, actual - 1))}>
                    
                    <FiMinus />
                  </button>
                  <span className="flex h-10 w-16 items-center justify-center border-x border-[#cfd9e8] font-bold text-[#26344a]">
                    {cantidad}
                  </span>
                  <button type="button" className="flex h-10 w-12 items-center justify-center text-main" onClick={() => establecerCantidad(actual => Math.min(Math.max(inventario, 1), actual + 1))}>
                    
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="flex h-11 items-center gap-2 rounded-[5px] bg-main px-5 text-sm font-black text-white transition hover:bg-subMain">
                  <FiShoppingCart /> Agregar al carrito - {formatearDinero(precio * cantidad)}
                </button>
                <button type="button" className="h-11 rounded-[5px] border border-main px-5 text-sm font-black text-main transition hover:bg-blue-50">
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Panel title="Puntos de venta disponibles" icon={<FiBox />}>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#eef2f7] text-[12px] font-black uppercase text-[#64748b]">
                <tr>
                  <th className="px-4 py-3">Punto de venta</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e7f0]">
                {construirSucursales(producto).map(sucursal => <tr key={sucursal.name}>
                    <td className="px-4 py-3 font-medium text-[#26344a]">{sucursal.name}</td>
                    <td className="px-4 py-3">{formatearDinero(sucursal.price)}</td>
                    <td className="px-4 py-3">
                      <span className="mr-2 inline-block h-1.5 w-8 rounded-full" style={{
                    backgroundColor: sucursal.color
                  }} />
                      {sucursal.stock}
                    </td>
                    <td className="px-4 py-3">{formatearDinero(sucursal.revenue)}</td>
                  </tr>)}
              </tbody>
            </table>
          </Panel>

          <Panel title="Especificaciones del producto" icon={<FiArchive />}>
            <dl className="grid gap-4 p-4 text-[14px]">
              <Spec label="Marca" value={(producto.tags || producto.tag || [])[0] || 'EcommerSio'} />
              <Spec label="Modelo" value={producto.title} />
              <Spec label="Categoría" value={traducirCategoria(producto.type) || 'General'} />
              <Spec label="Slug" value={producto.slug || 'sin-slug'} />
              <Spec label="Stock total" value={`${inventario} unidades`} />
            </dl>
          </Panel>
        </section>

        <Panel title="Productos relacionados" icon={<FiArchive />} actionNode={<div className="flex items-center gap-2">
              <button type="button" className="related-products-prev flex h-8 w-9 items-center justify-center rounded-[5px] border border-[#bcd0f7] bg-white text-main shadow-sm transition hover:bg-blue-50">
                <FiChevronLeft />
              </button>
              <button type="button" className="related-products-next flex h-8 w-9 items-center justify-center rounded-[5px] border border-[#bcd0f7] bg-white text-main shadow-sm transition hover:bg-blue-50">
                <FiChevronRight />
              </button>
            </div>}>
          
          <div className="related-products-carousel p-5">
            <Swiper autoplay={{
            delay: 2400,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }} loop={relacionadoProductos.length > 4} modules={[Autoplay, Navigation]} navigation={{
            nextEl: '.related-products-next',
            prevEl: '.related-products-prev'
          }} spaceBetween={18} slidesPerView={1} breakpoints={{
            640: {
              slidesPerView: 2
            },
            1024: {
              slidesPerView: 3
            },
            1280: {
              slidesPerView: 4
            }
          }}>
              
              {relacionadoProductos.map(elemento => <SwiperSlide key={obtenerClaveProducto(elemento)} className="h-auto">
                  <RelacionadoProducto product={elemento} />
                </SwiperSlide>)}
            </Swiper>
            <style>{`
              .related-products-carousel .swiper {
                padding: 0 6px 4px;
              }

              .related-products-carousel .swiper-slide {
                height: auto;
              }
            `}</style>
          </div>
        </Panel>
      </div>
    </BarraLateral>;
}
function Panel({
  action: accion,
  actionNode: accionNodo,
  children: hijos,
  icon: icono,
  title: titulo
}) {
  return <section className="overflow-hidden rounded-[6px] border border-[#d9e0ea] bg-white shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex min-h-[48px] items-center justify-between border-b border-[#e1e7f0] px-5 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#293d63] dark:text-white">
          {icono} {titulo}
        </h3>
        {accionNodo}
        {accion && <button type="button" className="h-8 rounded-[4px] border border-main px-4 text-[12px] font-black text-main">
            + {accion}
          </button>}
      </header>
      {hijos}
    </section>;
}
function RelacionadoProducto({
  product: producto
}) {
  const inventario = obtenerEstadoInventario(Number(producto.quantity || 0));
  return <article className="h-full overflow-hidden rounded-[6px] border border-[#d9e0ea] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="relative flex h-[260px] items-center justify-center bg-[#f7f8fb] p-5">
        <InventarioInsignia className="absolute right-3 top-3 z-10" status={inventario} />
        <img src={normalizarImagen(producto.image)} alt={producto.title} loading="lazy" decoding="async" className="max-h-full w-full object-contain" />
      </div>
      <div className="p-4">
        <h4 className="mt-3 truncate text-[15px] font-black text-[#26344a]">{producto.title}</h4>
        <p className="mt-1 text-[13px] font-medium text-[#7b8798]">{traducirCategoria(producto.type) || 'General'}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[18px] font-black text-[#162033]">{formatearDinero(producto.salePrice || producto.price)}</p>
          <Link to={`/admin/products/${obtenerClaveProducto(producto)}`} className="flex h-9 w-11 items-center justify-center rounded-[5px] border border-main text-main">
            <FiEye />
          </Link>
        </div>
      </div>
    </article>;
}
function InventarioInsignia({
  className: nombreClase = '',
  status: estado
}) {
  return <span className={`inline-flex rounded-[3px] border px-2 py-1 text-[12px] font-bold ${estado.className} ${nombreClase}`}>
      {estado.label}
    </span>;
}
function InsigniaCategoria({
  category: categoria
}) {
  return <span className="inline-flex rounded-[3px] border border-blue-200 bg-blue-50 px-2 py-1 text-[12px] font-bold text-blue-600">
      {traducirCategoria(categoria) || 'General'}
    </span>;
}
function Spec({
  label: etiqueta,
  value: valor
}) {
  return <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4">
      <dt className="font-medium text-[#7b8798]">{etiqueta}</dt>
      <dd className="font-semibold text-[#26344a] dark:text-white">{valor}</dd>
    </div>;
}
function obtenerEstadoInventario(inventario) {
  if (inventario <= 0) return {
    label: 'Sin stock',
    className: 'border-pink-200 bg-pink-50 text-pink-600'
  };
  if (inventario <= 15) return {
    label: 'Stock bajo',
    className: 'border-yellow-200 bg-yellow-50 text-yellow-700'
  };
  return {
    label: 'Disponible',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-600'
  };
}
function construirSucursales(producto) {
  const precio = Number(producto.salePrice || producto.price || 0);
  const inventario = Number(producto.quantity || 0);
  const nombres = ['Sucursal Centro', 'Sucursal Norte', 'Tienda Online', 'Deposito Principal'];
  return nombres.map((nombre, indice) => {
    const sucursalInventario = Math.max(0, Math.round(inventario * ([0.32, 0.18, 0.27, 0.23][indice] || 0.2)));
    return {
      name: nombre,
      price: precio + indice * 2,
      stock: sucursalInventario,
      revenue: sucursalInventario * precio,
      color: ['#00b894', '#087c67', '#14b8a6', '#64748b'][indice]
    };
  });
}
function normalizarImagen(imagen) {
  if (!imagen) return '/images/products/11.png';
  if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
  if (imagen.startsWith('/media/')) return `${ORIGEN_API}${imagen}`;
  if (imagen.startsWith('/products/')) return imagen.replace('/products/', '/images/products/');
  return imagen;
}
function obtenerClaveProducto(producto) {
  return producto?.id || producto?._id || producto?.slug;
}
function formatearDinero(valor) {
  return `$${Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
export default DetalleProducto;
