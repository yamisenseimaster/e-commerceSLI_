import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
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

function obtenerPrecio(producto) {
  return (
    Number(
      producto.flashSale
        ? (producto.salePrice ?? producto.price)
        : producto.price,
    ) || 0
  );
}

function obtenerRutaImagen(imagen) {
  const ruta = Array.isArray(imagen) ? imagen[0] : imagen;
  if (!ruta) return '';
  if (ruta.startsWith('/images') || ruta.startsWith('http')) return ruta;
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
      <div className="min-h-screen bg-[radial-gradient(rgba(16,133,98,0.22)_1.4px,transparent_1.4px),linear-gradient(165deg,#eefaf5_0%,#dff5ec_48%,#f3fbf8_100%)] [background-size:32px_32px,100%_100%] pb-28 text-[#111827] dark:bg-[radial-gradient(circle_at_top,_#162622_0%,_#101113_46%,_#0a0a0b_100%)] dark:[background-size:auto] dark:text-[#f4f4f5] sm:pb-10">
        <div className="container mx-auto px-4">
          <header className="mb-6 border-b border-[#dce5e3] pb-5 dark:border-[#353b38]">
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

function Catalogo({
  productos,
  consulta,
  categoriaInicial = '',
  cargando,
  error,
  limpiarBusqueda,
}) {
  const [categoria, establecerCategoria] = useState(categoriaInicial);
  const [enStock, establecerEnStock] = useState(false);
  const [precioAplicado, establecerPrecioAplicado] = useState(null);
  const [rangoElegido, establecerRangoElegido] = useState(null);
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
      const precio = obtenerPrecio(producto);
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
    const categoriaNormalizada = categoria.trim().toLowerCase();
    const lista = coincidencias.filter((producto) => {
      const precio = obtenerPrecio(producto);
      const tipoProducto = (producto.type || '').trim().toLowerCase();
      return (
        (!categoriaNormalizada || tipoProducto === categoriaNormalizada) &&
        (!enStock || Number(producto.quantity) > 0) &&
        (!precioAplicado ||
          (precio >= precioAplicado[0] && precio <= precioAplicado[1]))
      );
    });
    if (orden === 'menor-precio')
      lista.sort((a, b) => obtenerPrecio(a) - obtenerPrecio(b));
    if (orden === 'mayor-precio')
      lista.sort((a, b) => obtenerPrecio(b) - obtenerPrecio(a));
    if (orden === 'nombre')
      lista.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'es-AR'),
      );
    return lista;
  }, [coincidencias, categoria, enStock, precioAplicado, orden]);

  const detalleActivo = productoSeleccionado || filtrados[0] || null;

  const [desde, hasta] = limites;
  const [minimo, maximo] = (rangoElegido || limites).map((valor) =>
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

  const limpiar = () => {
    establecerCategoria('');
    establecerEnStock(false);
    establecerRangoElegido(null);
    establecerPrecioAplicado(null);
    establecerOrden('relevancia');
    volverAlInicio();
    if (consulta || categoriaInicial) limpiarBusqueda();
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)_320px] xl:grid-cols-[248px_minmax(0,1fr)_350px]">
      <aside
        aria-label="Filtros de productos"
        className="rounded-md border border-[#dce5e3] bg-white p-4 dark:border-[#353b38] dark:bg-[#181818]">
        <div className="flex items-center justify-between gap-2 pb-3">
          <h2 className="font-display text-lg font-black">Filtros</h2>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="text-xs font-bold text-[#086650] underline underline-offset-4 dark:text-[#9ff2df]">
              Limpiar
            </button>
          )}
        </div>
        <GrupoFiltro titulo="Categoría" abierto>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {[['', coincidencias.length], ...categorias].map(
              ([valor, cantidad]) => (
                <label
                  key={valor}
                  className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    name="categoria-tienda"
                    type="radio"
                    checked={
                      categoria.trim().toLowerCase() ===
                      valor.trim().toLowerCase()
                    }
                    className="accent-main"
                    onChange={() => {
                      establecerCategoria(valor);
                      volverAlInicio();
                    }}
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
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enStock}
              className="accent-main"
              onChange={(evento) => {
                establecerEnStock(evento.target.checked);
                volverAlInicio();
              }}
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
                  establecerRangoElegido([
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
                  establecerRangoElegido([
                    minimo,
                    Math.max(minimo, Number(evento.target.value)),
                  ])
                }
              />
            </div>
          )}
          <p className="mb-3 text-xs text-[#526176] dark:text-[#b1c7c1]">
            {moneda.format(minimo)} – {moneda.format(maximo)}
          </p>
          <button
            type="button"
            disabled={!cambioPrecio}
            onClick={() => {
              establecerPrecioAplicado(
                minimo === desde && maximo === hasta ? null : [minimo, maximo],
              );
              volverAlInicio();
            }}
            className="w-full rounded-sm bg-main px-3 py-2 text-sm font-bold text-white hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#dce5e3] disabled:text-[#526176] dark:disabled:bg-[#353b38] dark:disabled:text-[#b1c7c1]">
            Aplicar precio
          </button>
        </GrupoFiltro>
      </aside>

      <section aria-label="Catálogo de productos" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e3] pb-3 dark:border-[#353b38]">
          <p role="status" className="text-sm font-semibold">
            {cargando
              ? 'Cargando productos…'
              : `${filtrados.length} ${filtrados.length === 1 ? 'producto' : 'productos'}`}
            {consulta && <> para «{consulta}»</>}
          </p>
          <label className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            Ordenar por
            <select
              value={orden}
              onChange={(evento) => {
                establecerOrden(evento.target.value);
                volverAlInicio();
              }}
              className={estiloCampo}>
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
          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 xl:grid-cols-3">
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
                    esActivo ? 'ring-2 ring-main' : ''
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
        className="sticky top-6 rounded-md border border-[#dce5e3] bg-white p-4 dark:border-[#353b38] dark:bg-[#181818]">
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
              {moneda.format(obtenerPrecio(detalleActivo))}
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















/* import React, { useMemo, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
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

function obtenerPrecio(producto) {
  return (
    Number(
      producto.flashSale
        ? (producto.salePrice ?? producto.price)
        : producto.price,
    ) || 0
  );
}

function Tienda() {
  const [parametros, establecerParametros] = useSearchParams();
  const consulta = parametros.get('search') || '';
  const { products: productos, loading: cargando, error } = usarProductos();

  return (
    <Estructura>
      <div className="min-h-screen bg-[#f7f4ef] py-6 text-[#172033] dark:bg-[#111111] dark:text-[#f4f4f5]">
        <div className="container mx-auto px-4">
          <header className="mb-6 border-b border-[#dce5e3] pb-5 dark:border-[#353b38]">
            <h1 className="font-display text-3xl font-black sm:text-4xl">
              Tienda
            </h1>
          </header>
          <Catalogo
            key={consulta}
            productos={productos}
            consulta={consulta}
            cargando={cargando}
            error={error}
            limpiarBusqueda={() => establecerParametros({})}
          />
        </div>
      </div>
    </Estructura>
  );
}

function Catalogo({ productos, consulta, cargando, error, limpiarBusqueda }) {
  const [categoria, establecerCategoria] = useState('');
  const [enStock, establecerEnStock] = useState(false);
  const [precioAplicado, establecerPrecioAplicado] = useState(null);
  const [rangoElegido, establecerRangoElegido] = useState(null);
  const [orden, establecerOrden] = useState('relevancia');
  const [visibles, establecerVisibles] = useState(PRODUCTOS_POR_PAGINA);
  // Agrego
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
      const precio = obtenerPrecio(producto);
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
    const lista = coincidencias.filter((producto) => {
      const precio = obtenerPrecio(producto);
      return (
        (!categoria || producto.type === categoria) &&
        (!enStock || Number(producto.quantity) > 0) &&
        (!precioAplicado ||
          (precio >= precioAplicado[0] && precio <= precioAplicado[1]))
      );
    });
    if (orden === 'menor-precio')
      lista.sort((a, b) => obtenerPrecio(a) - obtenerPrecio(b));
    if (orden === 'mayor-precio')
      lista.sort((a, b) => obtenerPrecio(b) - obtenerPrecio(a));
    if (orden === 'nombre')
      lista.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'es-AR'),
      );
    return lista;
  }, [coincidencias, categoria, enStock, precioAplicado, orden]);

  const [desde, hasta] = limites;
  const [minimo, maximo] = (rangoElegido || limites).map((valor) =>
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

  const volverAlInicio = () => establecerVisibles(PRODUCTOS_POR_PAGINA);
  const limpiar = () => {
    establecerCategoria('');
    establecerEnStock(false);
    establecerRangoElegido(null);
    establecerPrecioAplicado(null);
    establecerOrden('relevancia');
    volverAlInicio();
    if (consulta) limpiarBusqueda();
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]">
      <aside
        aria-label="Filtros de productos"
        className="rounded-md border border-[#dce5e3] bg-white p-4 dark:border-[#353b38] dark:bg-[#181818]">
        <div className="flex items-center justify-between gap-2 pb-3">
          <h2 className="font-display text-lg font-black">Filtros</h2>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="text-xs font-bold text-[#086650] underline underline-offset-4 dark:text-[#9ff2df]">
              Limpiar
            </button>
          )}
        </div>
        <GrupoFiltro titulo="Categoría" abierto>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {[['', coincidencias.length], ...categorias].map(
              ([valor, cantidad]) => (
                <label
                  key={valor}
                  className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    name="categoria-tienda"
                    type="radio"
                    checked={categoria === valor}
                    className="accent-main"
                    onChange={() => {
                      establecerCategoria(valor);
                      volverAlInicio();
                    }}
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
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enStock}
              className="accent-main"
              onChange={(evento) => {
                establecerEnStock(evento.target.checked);
                volverAlInicio();
              }}
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
                  establecerRangoElegido([
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
                  establecerRangoElegido([
                    minimo,
                    Math.max(minimo, Number(evento.target.value)),
                  ])
                }
              />
            </div>
          )}
          <p className="mb-3 text-xs text-[#526176] dark:text-[#b1c7c1]">
            {moneda.format(minimo)} – {moneda.format(maximo)}
          </p>
          <button
            type="button"
            disabled={!cambioPrecio}
            onClick={() => {
              establecerPrecioAplicado(
                minimo === desde && maximo === hasta ? null : [minimo, maximo],
              );
              volverAlInicio();
            }}
            className="w-full rounded-sm bg-main px-3 py-2 text-sm font-bold text-white hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#dce5e3] disabled:text-[#526176] dark:disabled:bg-[#353b38] dark:disabled:text-[#b1c7c1]">
            Aplicar precio
          </button>
        </GrupoFiltro>
      </aside>

      <section aria-label="Catálogo de productos" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e3] pb-3 dark:border-[#353b38]">
          <p role="status" className="text-sm font-semibold">
            {cargando
              ? 'Cargando productos…'
              : `${filtrados.length} ${filtrados.length === 1 ? 'producto' : 'productos'}`}
            {consulta && <> para «{consulta}»</>}
          </p>
          <label className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            Ordenar por
            <select
              value={orden}
              onChange={(evento) => {
                establecerOrden(evento.target.value);
                volverAlInicio();
              }}
              className={estiloCampo}>
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
          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filtrados.slice(0, visibles).map((producto) => (
              <Productos
                key={producto.id ?? producto._id ?? producto.slug}
                product={producto}
              />
            ))}
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

export default Tienda;*/
