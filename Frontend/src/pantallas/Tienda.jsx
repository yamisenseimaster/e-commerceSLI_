import { precioVigente } from '../utilidades/precioVigente';
import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Productos from '../componentes/Productos';
import Estructura from '../estructura/Estructura';
import { usarProductos } from '../Contextos/ContextoProductos';
import { traducirCategoria } from '../utilidades/localizacion';
import { buscarProductos } from '../utilidades/busquedaProductos';

const PRODUCTOS_POR_PAGINA = 12;
const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});
const estiloCampo =
  'rounded-sm border border-[#dce5e3] bg-white px-2.5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-main dark:border-[#353b38] dark:bg-[#202020]';
const estiloDeslizador =
  'deslizador-precio pointer-events-none absolute inset-0 m-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-main [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-main [&::-moz-range-thumb]:bg-white';

function obtenerRutaImagen(imagen) {
  const ruta = Array.isArray(imagen) ? imagen[0] : imagen;
  if (!ruta) return '';
  if (/^(?:https?:|data:|\/api\/|\/images\/)/.test(ruta)) return ruta;
  return `/images${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

function Tienda() {
  const [parametros, establecerParametros] = useSearchParams();
  const consulta = parametros.get('search') || '';
  const categoriaUrl =
    parametros.get('category') ||
    parametros.get('categoria') ||
    parametros.get('type') ||
    '';
  const { products: productos, loading: cargando, error } = usarProductos();

  return (
    <Estructura>
      <div className="min-h-screen bg-[#faf9f7] lg:bg-[radial-gradient(rgba(16,133,98,0.22)_1.4px,transparent_1.4px),linear-gradient(165deg,#eefaf5_0%,#dff5ec_48%,#f3fbf8_100%)] [background-size:32px_32px,100%_100%] pb-28 text-[#111827] dark:bg-[radial-gradient(circle_at_top,_#162622_0%,_#101113_46%,_#0a0a0b_100%)] dark:[background-size:auto] dark:text-[#f4f4f5] sm:pb-10">
        <div className="container mx-auto px-4">
          <header className="pb-4 pt-5 lg:mb-6 lg:border-b lg:border-[#dce5e3] lg:pb-5 lg:pt-0 dark:border-[#353b38]">
            <h1 className="font-display text-3xl font-black sm:text-4xl">
              Tienda
            </h1>
          </header>
          <Catalogo
            key={`${consulta}-${categoriaUrl}`}
            productos={productos}
            consulta={consulta}
            categoriaInicial={categoriaUrl}
            cargando={cargando}
            error={error}
            limpiarBusqueda={() => establecerParametros({})}
          />
        </div>
      </div>
    </Estructura>
  );
}

function filtrarProductos(coincidencias, { categoria, enStock, precio }) {
  const categoriaNormalizada = categoria.trim().toLowerCase();
  return coincidencias.filter((producto) => {
    const importe = precioVigente(producto);
    const tipoProducto = (producto.type || '').trim().toLowerCase();
    return (
      (!categoriaNormalizada || tipoProducto === categoriaNormalizada) &&
      (!enStock || Number(producto.quantity) > 0) &&
      (!precio ||
        (importe >= precio[0] && importe <= precio[1]))
    );
  });
}

const filtrosVacios = { categoria: '', enStock: false, precio: null };
const cantidadProductos = (cantidad) => `${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`;

function Catalogo({
  productos,
  consulta,
  categoriaInicial = '',
  cargando,
  error,
  limpiarBusqueda,
}) {
  const [filtros, establecerFiltros] = useState({ categoria: categoriaInicial, enStock: false, precio: null });
  const [borrador, establecerBorrador] = useState(null);
  const [rangoElegido, establecerRangoElegido] = useState(null);
  const [esMovil, establecerEsMovil] = useState(() => window.matchMedia('(width < 64rem)').matches);
  useEffect(() => {
    const pantalla = window.matchMedia('(width < 64rem)');
    const alRedimensionar = () => {
      establecerEsMovil(pantalla.matches);
      establecerBorrador(null);
      establecerRangoElegido(null);
    };
    pantalla.addEventListener('change', alRedimensionar);
    return () => pantalla.removeEventListener('change', alRedimensionar);
  }, []);
  const [orden, establecerOrden] = useState('relevancia');
  const [visibles, establecerVisibles] = useState(PRODUCTOS_POR_PAGINA);
  const [productoSeleccionado, establecerProductoSeleccionado] = useState(null);

  const coincidencias = useMemo(
    () => buscarProductos(productos, consulta),
    [productos, consulta],
  );

  const { categorias, limites } = useMemo(() => {
    const cantidades = new Map();
    let desde = Infinity;
    let hasta = -Infinity;
    for (const producto of coincidencias) {
      if (producto.type)
        cantidades.set(producto.type, (cantidades.get(producto.type) || 0) + 1);
      const precio = precioVigente(producto);
      desde = Math.min(desde, precio);
      hasta = Math.max(hasta, precio);
    }
    return {
      categorias: [...cantidades].sort(([primera], [segunda]) =>
        traducirCategoria(primera).localeCompare(
          traducirCategoria(segunda),
          'es-AR',
        ),
      ),
      limites: coincidencias.length ? [desde, hasta] : [0, 0],
    };
  }, [coincidencias]);

  const filtrados = useMemo(() => {
    const lista = filtrarProductos(coincidencias, filtros);
    if (orden === 'menor-precio')
      lista.sort((a, b) => precioVigente(a) - precioVigente(b));
    if (orden === 'mayor-precio')
      lista.sort((a, b) => precioVigente(b) - precioVigente(a));
    if (orden === 'nombre')
      lista.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'es-AR'),
      );
    return lista;
  }, [coincidencias, filtros, orden]);

  const detalleActivo = productoSeleccionado || filtrados[0] || null;

  const editados = borrador || filtros;
  const { categoria, enStock, precio: precioAplicado } = editados;
  const [desde, hasta] = limites;
  const [minimo, maximo] = ((borrador ? borrador.precio : rangoElegido) || precioAplicado || limites).map((valor) =>
    Math.max(desde, Math.min(hasta, valor)),
  );
  const [aplicadoDesde, aplicadoHasta] = precioAplicado || limites;
  const cambioPrecio = minimo !== aplicadoDesde || maximo !== aplicadoHasta;
  const hayFiltros = Boolean(
    categoria ||
      enStock ||
      precioAplicado ||
      rangoElegido ||
      consulta ||
      orden !== 'relevancia',
  );

  const volverAlInicio = () => {
    establecerVisibles(PRODUCTOS_POR_PAGINA);
    establecerProductoSeleccionado(null);
  };

  function cambiarFiltros(cambios) {
    if (borrador) establecerBorrador({ ...borrador, ...cambios });
    else {
      establecerFiltros({ ...filtros, ...cambios });
      volverAlInicio();
    }
  }
  function cambiarPrecio(rango) {
    if (borrador) cambiarFiltros({ precio: rango[0] === desde && rango[1] === hasta ? null : rango });
    else establecerRangoElegido(rango);
  }
  function limpiar() {
    establecerFiltros(filtrosVacios);
    establecerRangoElegido(null);
    establecerOrden('relevancia');
    volverAlInicio();
    if (consulta || categoriaInicial) limpiarBusqueda();
  }

  const controles = (
    <>
      <GrupoFiltro titulo="Categoría" abierto>
        <div className="max-h-36 overflow-y-auto pr-2 lg:max-h-52">
          {[['', coincidencias.length], ...categorias].map(
            ([valor, cantidad]) => (
              <label
                key={valor}
                className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
                <input
                  name="categoria-tienda"
                  type="radio"
                  checked={
                    categoria.trim().toLowerCase() ===
                    valor.trim().toLowerCase()
                  }
                  className="accent-main checked:text-[#087b68]"
                  onChange={() => cambiarFiltros({ categoria: valor })}
                />
                <span>{valor ? traducirCategoria(valor) : 'Todas'}</span>
                <span className="ml-auto text-xs text-[#526176] dark:text-[#b1c7c1]">
                  {cantidad}
                </span>
              </label>
            ),
          )}
        </div>
      </GrupoFiltro>
      <GrupoFiltro titulo="Disponibilidad">
        <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={enStock}
            className="accent-main checked:text-[#087b68]"
            onChange={(evento) => cambiarFiltros({ enStock: evento.target.checked })}
          />
          Solo con stock
        </label>
      </GrupoFiltro>
      <GrupoFiltro titulo="Rango de precios" abierto>
        {desde < hasta && (
          <div className="relative my-3 h-6">
            <div className="absolute inset-x-1.5 top-1/2 h-1 -translate-y-1/2 rounded bg-[#dce5e3] dark:bg-[#353b38]">
              <div
                className="absolute h-full bg-main"
                style={{
                  left: ((minimo - desde) / (hasta - desde)) * 100 + '%',
                  right: ((hasta - maximo) / (hasta - desde)) * 100 + '%',
                }}
              />
            </div>
            <input
              type="range"
              aria-label="Precio mínimo"
              aria-valuetext={moneda.format(minimo)}
              min={desde}
              max={hasta}
              step="0.01"
              value={minimo}
              className={estiloDeslizador}
              onChange={(evento) =>
                cambiarPrecio([
                  Math.min(maximo, Number(evento.target.value)),
                  maximo,
                ])
              }
            />
            <input
              type="range"
              aria-label="Precio máximo"
              aria-valuetext={moneda.format(maximo)}
              min={desde}
              max={hasta}
              step="0.01"
              value={maximo}
              className={estiloDeslizador}
              onChange={(evento) =>
                cambiarPrecio([
                  minimo,
                  Math.max(minimo, Number(evento.target.value)),
                ])
              }
            />
          </div>
        )}
        <div className="mb-2 flex justify-between gap-2 text-sm tabular-nums">
          {[minimo, maximo].map((importe, indice) => (
            <span key={indice} className="rounded border border-stone-200 px-2 py-1 dark:border-stone-700">{moneda.format(importe)}</span>
          ))}
        </div>
        {!esMovil && (
          <button type="button" disabled={!cambioPrecio}
            onClick={() => cambiarFiltros({ precio: minimo === desde && maximo === hasta ? null : [minimo, maximo] })}
            className="w-full rounded bg-[#087b68] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
            Aplicar precio
          </button>
        )}
      </GrupoFiltro>
    </>
  );

  const etiquetas = [
    filtros.categoria && [traducirCategoria(filtros.categoria), { categoria: '' }],
    filtros.enStock && ['Solo con stock', { enStock: false }],
    filtros.precio && [filtros.precio.map((valor) => moneda.format(valor)).join(' – '), { precio: null }],
  ].filter(Boolean);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)_320px] xl:grid-cols-[248px_minmax(0,1fr)_350px]">
      {esMovil ? (
        <Dialog open={Boolean(borrador)} onClose={() => establecerBorrador(null)} className="relative z-[100]">
          <DialogBackdrop className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-end justify-center">
            <DialogPanel transition className="flex max-h-[88dvh] w-full max-w-xl flex-col rounded-t-2xl bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#202521] transition-transform duration-200 data-closed:translate-y-full motion-reduce:transition-none dark:bg-[#1c201e] dark:text-white">
              <div aria-hidden="true" className="mx-auto my-3 h-1 w-10 shrink-0 rounded-full bg-stone-300" />
              <div className="flex items-center gap-3 pb-2">
                <DialogTitle className="mr-auto font-display text-2xl font-black">Filtros</DialogTitle>
                <button type="button" onClick={() => establecerBorrador(filtrosVacios)} className="p-2 text-sm font-bold text-[#087b68] dark:text-[#79ddc5]">Limpiar</button>
                <button type="button" aria-label="Cerrar filtros" className="p-2" onClick={() => establecerBorrador(null)}><FiX /></button>
              </div>
              <div className="min-h-0 overflow-y-auto overscroll-contain">{controles}</div>
              <button type="button" className="mt-2 min-h-12 shrink-0 rounded-md bg-[#087b68] font-bold text-white hover:bg-[#076455]"
                onClick={() => { establecerFiltros(borrador); establecerBorrador(null); volverAlInicio(); }}>
                Ver {cantidadProductos(filtrarProductos(coincidencias, editados).length)}
              </button>
            </DialogPanel>
          </div>
        </Dialog>
      ) : (
        <aside aria-label="Filtros de productos" className="rounded-md border border-[#dce5e3] bg-white p-4 dark:border-[#353b38] dark:bg-[#181818]">
          <div className="flex items-center justify-between pb-3">
            <h2 className="font-display text-lg font-black">Filtros</h2>
            {hayFiltros && <button type="button" onClick={limpiar} className="text-sm font-bold text-[#087b68] underline dark:text-[#79ddc5]">Limpiar</button>}
          </div>
          {controles}
        </aside>
      )}

      <section aria-label="Catálogo de productos" className="min-w-0">
        <div className="mb-3 grid grid-cols-2 items-center gap-3 lg:flex lg:justify-between lg:border-b lg:border-[#dce5e3] lg:pb-3">
          {esMovil && (
            <button type="button" aria-haspopup="dialog" aria-expanded={Boolean(borrador)} onClick={() => establecerBorrador(filtros)}
              className="flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold dark:border-stone-700 dark:bg-[#202020]">
              <FiFilter /> Filtros <FiChevronDown className="ml-auto" />
            </button>
          )}
          <p role="status" className="col-span-2 row-start-2 flex flex-wrap items-center justify-end gap-2 text-xs text-stone-600 lg:text-sm dark:text-stone-300">
            {esMovil && etiquetas.length > 0 && (
              <span className="mr-auto flex flex-wrap gap-1">
                {etiquetas.map(([texto, cambios]) => (
                  <button type="button" key={texto} aria-label={`Quitar filtro ${texto}`} onClick={() => cambiarFiltros(cambios)}
                    className="inline-flex items-center gap-2 rounded bg-[#e5ede7] px-2.5 py-1.5 font-semibold text-[#25473b] dark:bg-[#293c35] dark:text-[#cef3e5]">
                    {texto} <FiX />
                  </button>
                ))}
              </span>
            )}
            {cargando ? 'Cargando productos…' : cantidadProductos(filtrados.length)}
            {consulta && <> para «{consulta}»</>}
          </p>
          <label className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm">
            <span className="sr-only lg:not-sr-only">Ordenar por</span>
            <select value={orden}
              onChange={(evento) => { establecerOrden(evento.target.value); volverAlInicio(); }}
              className={`${estiloCampo} min-h-11 w-full min-w-0 rounded-md lg:w-auto`}>
              <option value="relevancia">Relevancia</option>
              <option value="menor-precio">Menor precio</option>
              <option value="mayor-precio">Mayor precio</option>
              <option value="nombre">Nombre de A a Z</option>
            </select>
          </label>
        </div>
        {error && (
          <p
            role="status"
            className="mb-4 text-sm text-[#765721] dark:text-[#e8c180]">
            No se pudo actualizar el catálogo.
          </p>
        )}
        {!cargando && (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtrados.slice(0, visibles).map((producto) => {
              const idActual = producto.id ?? producto._id ?? producto.slug;
              const idSeleccionado =
                detalleActivo?.id ?? detalleActivo?._id ?? detalleActivo?.slug;
              const esActivo = idActual === idSeleccionado;

              return (
                <div
                  key={idActual}
                  onMouseEnter={() => establecerProductoSeleccionado(producto)}
                  onClick={() => establecerProductoSeleccionado(producto)}
                  className={`cursor-pointer rounded-md transition-all ${
                    esActivo ? 'lg:ring-2 lg:ring-main' : ''
                  }`}>
                  <Productos product={producto} />
                </div>
              );
            })}
            {filtrados.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-[#dce5e3] bg-white p-6 text-center dark:border-[#353b38] dark:bg-[#181818]">
                <p className="font-bold">No hay productos para esos filtros.</p>
                {hayFiltros && (
                  <button
                    type="button"
                    onClick={limpiar}
                    className="mt-3 text-sm font-bold text-[#086650] underline dark:text-[#9ff2df]">
                    Mostrar todo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {!cargando && visibles < filtrados.length && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() =>
                establecerVisibles((actual) => actual + PRODUCTOS_POR_PAGINA)
              }
              className="rounded-sm border border-main bg-white px-5 py-2 text-sm font-bold text-[#086650] hover:bg-[#e7fff8] dark:bg-[#181818] dark:text-[#9ff2df]">
              Cargar más
            </button>
          </div>
        )}
      </section>

      <aside
        aria-label="Detalle del producto"
        className="sticky top-6 hidden rounded-md lg:block border border-[#dce5e3] bg-white p-4 dark:border-[#353b38] dark:bg-[#181818]">
        {detalleActivo ? (
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-[#dce5e3] pb-2 dark:border-[#353b38]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#086650] dark:text-[#9ff2df]">
                {detalleActivo.type
                  ? traducirCategoria(detalleActivo.type)
                  : 'Detalle'}
              </span>
              {productoSeleccionado && (
                <button
                  type="button"
                  onClick={() => establecerProductoSeleccionado(null)}
                  title="Restablecer vista previa"
                  className="text-xs text-[#526176] hover:text-main dark:text-[#b1c7c1]">
                  <FiX className="size-4" />
                </button>
              )}
            </div>

            <div className="mb-4 overflow-hidden rounded-md bg-[#f7f4ef] dark:bg-[#202020]">
              <img
                src={obtenerRutaImagen(detalleActivo.image)}
                alt={detalleActivo.title}
                className="h-56 w-full object-contain p-3"
              />
            </div>

            <h3 className="font-display text-xl font-black leading-snug">
              {detalleActivo.title}
            </h3>

            <p className="mt-2 text-2xl font-black text-[#086650] dark:text-[#9ff2df]">
              {moneda.format(precioVigente(detalleActivo))}
            </p>

            <p className="mt-1 text-xs font-semibold text-[#526176] dark:text-[#b1c7c1]">
              {Number(detalleActivo.quantity) > 0
                ? `Stock disponible: ${detalleActivo.quantity} unidades`
                : 'Sin stock disponible'}
            </p>

            {detalleActivo.description && (
              <p className="mt-3 border-t border-[#dce5e3] pt-3 text-sm leading-relaxed text-[#526176] dark:border-[#353b38] dark:text-[#b1c7c1]">
                {detalleActivo.description}
              </p>
            )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[#526176] dark:text-[#b1c7c1]">
            Selecciona una categoría o un producto para ver su imagen y detalle.
          </p>
        )}
      </aside>
    </div>
  );
}

function GrupoFiltro({ titulo, abierto = false, children: contenido }) {
  return (
    <details
      open={abierto}
      className="group border-t border-[#dce5e3] dark:border-[#353b38]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
        {titulo}
        <FiChevronDown
          aria-hidden="true"
          className="text-main transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-3">{contenido}</div>
    </details>
  );
}

export default Tienda;
