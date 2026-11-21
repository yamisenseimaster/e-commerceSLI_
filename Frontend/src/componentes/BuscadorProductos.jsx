import { precioVigente } from '../utilidades/precioVigente';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiArrowRight, FiSearch, FiTag, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usarProductos } from '../Contextos/ContextoProductos';
import {
  normalizarBusqueda,
  buscarProductos,
} from '../utilidades/busquedaProductos';
import { traducirCategoria } from '../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

function BuscadorProductos({
  buttonLabel = 'Buscar',
  className = '',
  inputClassName = '',
  maxSuggestions = 6,
  onChange: alCambiar,
  onSubmit: alEnviar,
  panelAmplio = false,
  placeholder = 'Buscar productos…',
  searchScope: categoriaActual = null,
  showButton = true,
  value: valor,
  variant = 'light',
}) {
  const navegar = useNavigate();
  const { products: productos } = usarProductos();
  const [valorInterno, establecerValorInterno] = useState('');
  const [panelAbierto, establecerPanelAbierto] = useState(false);
  const formulario = useRef(null);
  const campo = useRef(null);
  const idPanel = useId();
  const consulta = valor ?? valorInterno;
  const texto = consulta.trim();
  const textoNormalizado = normalizarBusqueda(texto);
  const mostrarPanel = panelAbierto && Boolean(texto);

  const productosDelBuscador = useMemo(
    () =>
      categoriaActual
        ? productos.filter((producto) => producto.type === categoriaActual)
        : productos,
    [productos, categoriaActual],
  );

  const { hallados, categorias } = useMemo(() => {
    if (!textoNormalizado) return { hallados: [], categorias: [] };
    const ordenados = buscarProductos(productosDelBuscador, textoNormalizado);
    const categoriasRelacionadas = categoriaActual
      ? []
      : [
          ...new Set(
            ordenados.map((producto) => producto.type).filter(Boolean),
          ),
        ].slice(0, 5);
    return { hallados: ordenados, categorias: categoriasRelacionadas };
  }, [productosDelBuscador, categoriaActual, textoNormalizado]);

  useEffect(() => {
    if (!mostrarPanel) return;
    const cerrarAlPulsarFuera = (evento) => {
      if (!formulario.current?.contains(evento.target))
        establecerPanelAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarAlPulsarFuera);
    return () =>
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera);
  }, [mostrarPanel]);

  const actualizarConsulta = (siguiente) => {
    if (valor === undefined) establecerValorInterno(siguiente);
    alCambiar?.(siguiente);
  };

  const abrirResultados = () => {
    establecerPanelAbierto(false);
    if (alEnviar) alEnviar(texto);
    else navegar(texto ? `/shop?search=${encodeURIComponent(texto)}` : '/shop');
  };

  const enviarBusqueda = (evento) => {
    evento.preventDefault();
    const exacto =
      textoNormalizado &&
      !alEnviar &&
      productosDelBuscador.find((producto) =>
        [producto.title, producto.slug, producto.id, producto._id].some(
          (dato) => dato && normalizarBusqueda(dato) === textoNormalizado,
        ),
      );
    if (exacto) abrirProducto(exacto);
    else abrirResultados();
  };

  const abrirProducto = (producto) => {
    actualizarConsulta(producto.title || '');
    establecerPanelAbierto(false);
    if (alEnviar) alEnviar(producto.title);
    else
      navegar(
        `/products/${encodeURIComponent(obtenerClaveProducto(producto))}`,
      );
  };

  return (
    <form
      ref={formulario}
      role="search"
      aria-label={
        categoriaActual ? 'Buscar en esta categoría' : 'Buscar en la tienda'
      }
      className={`${panelAmplio ? '' : 'relative'} ${className}`}
      onSubmit={enviarBusqueda}
      onBlur={(evento) => {
        if (
          evento.relatedTarget &&
          !evento.currentTarget.contains(evento.relatedTarget)
        ) {
          establecerPanelAbierto(false);
        }
      }}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape' && mostrarPanel) {
          evento.preventDefault();
          campo.current?.focus();
          establecerPanelAbierto(false);
        }
      }}>
      <div
        className={`flex h-full min-h-11 w-full items-center gap-2 rounded-md border px-3 transition focus-within:border-main ${
          variant === 'dark'
            ? 'border-white/15 bg-white/10 text-white'
            : 'border-[#dce5e3] bg-white text-[#172033] dark:border-[#353b38] dark:bg-[#181818] dark:text-white'
        }`}>
        <FiSearch
          aria-hidden="true"
          className="shrink-0 text-[#526461] dark:text-[#b1c7c1]"
        />
        <input
          ref={campo}
          value={consulta}
          onChange={(evento) => {
            actualizarConsulta(evento.target.value);
            establecerPanelAbierto(true);
          }}
          onFocus={() => establecerPanelAbierto(true)}
          className={`hero-search-input h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none [&::-webkit-search-cancel-button]:hidden ${inputClassName}`}
          placeholder={placeholder}
          aria-label="Buscar productos"
          aria-controls={mostrarPanel ? idPanel : undefined}
          autoComplete="off"
          type="search"
        />
        {consulta && (
          <button
            type="button"
            onClick={() => {
              actualizarConsulta('');
              campo.current?.focus();
            }}
            className="grid size-8 shrink-0 place-items-center rounded-sm text-[#526461] hover:bg-main/10 dark:text-[#b1c7c1]"
            aria-label="Limpiar búsqueda">
            <FiX aria-hidden="true" />
          </button>
        )}
        {showButton && (
          <button
            type="submit"
            className="h-8 shrink-0 rounded-sm bg-main px-3 text-xs font-bold text-[#102d26] hover:bg-subMain">
            {buttonLabel}
          </button>
        )}
      </div>

      {mostrarPanel && (
        <section
          id={idPanel}
          aria-label="Vista previa de búsqueda"
          className={`absolute z-50 max-h-[65vh] overflow-y-auto rounded-md border border-[#dce5e3] bg-white text-[#172033] shadow-lg dark:border-[#353b38] dark:bg-[#181818] dark:text-white ${
            panelAmplio
              ? 'inset-x-3 top-[calc(100%+6px)] sm:inset-x-4'
              : 'inset-x-0 top-[calc(100%+6px)]'
          }`}>
          <div
            className={`grid gap-4 p-4 ${panelAmplio ? 'md:grid-cols-[175px_minmax(0,1fr)] md:gap-5 md:p-5' : ''}`}>
            <div
              className={
                panelAmplio
                  ? 'md:border-r md:border-[#dce5e3] md:pr-4 dark:md:border-[#353b38]'
                  : ''
              }>
              <h2 className="mb-2 text-sm font-black">Sugerencias</h2>
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    onClick={abrirResultados}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-main/10">
                    <FiSearch
                      aria-hidden="true"
                      className="shrink-0 text-main"
                    />
                    <span className="truncate">{texto}</span>
                  </button>
                </li>
                {categorias.map((categoria) => (
                  <li key={categoria}>
                    <button
                      type="button"
                      onClick={() => {
                        actualizarConsulta(traducirCategoria(categoria));
                        establecerPanelAbierto(false);
                        navegar(`/category/${encodeURIComponent(categoria)}`);
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-main/10">
                      <FiTag
                        aria-hidden="true"
                        className="shrink-0 text-main"
                      />
                      <span className="truncate">
                        {traducirCategoria(categoria)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <h2 className="mb-2 break-words text-sm font-black">
                Productos para «{texto}»
              </h2>
              {hallados.length ? (
                <ul
                  className={`grid grid-cols-2 gap-2.5 ${panelAmplio ? 'lg:grid-cols-4' : ''}`}>
                  {hallados
                    .slice(0, Math.min(maxSuggestions, 4))
                    .map((producto) => (
                      <li
                        key={obtenerClaveProducto(producto)}
                        className="min-w-0">
                        <button
                          type="button"
                          onClick={() => abrirProducto(producto)}
                          className="flex h-full w-full flex-col overflow-hidden rounded-sm border border-[#dce5e3] text-left hover:border-main focus-visible:outline-main dark:border-[#353b38]">
                          <img
                            src={obtenerImagenProducto(producto)}
                            alt=""
                            decoding="async"
                            className="h-24 w-full bg-[#f8faf8] object-contain p-2 dark:bg-[#222522] sm:h-28"
                          />
                          <span className="flex flex-1 flex-col gap-2 p-2.5">
                            <span className="line-clamp-2 text-xs font-semibold">
                              {producto.title}
                            </span>
                            <span className="mt-auto text-sm font-black text-[#086650] dark:text-[#9ff2df]">
                              {formatoPrecio.format(
                                precioVigente(producto),
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p
                  role="status"
                  className="text-sm text-[#526461] dark:text-[#b1c7c1]">
                  No encontramos productos para esa búsqueda.
                </p>
              )}
            </div>
          </div>
          {hallados.length > 0 && (
            <div className="border-t border-[#dce5e3] px-4 py-2.5 text-center dark:border-[#353b38]">
              <button
                type="button"
                onClick={abrirResultados}
                className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-bold text-[#086650] hover:bg-main/10 dark:text-[#9ff2df]">
                {hallados.length === 1
                  ? 'Ver 1 resultado'
                  : `Ver los ${hallados.length} resultados`}
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      )}
    </form>
  );
}

function obtenerImagenProducto(producto) {
  const imagen = producto?.image || '/images/products/11.png';
  if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
  if (imagen.startsWith('/media/')) return `${ORIGEN_API}${imagen}`;
  if (imagen.startsWith('/products/')) return `/images${imagen}`;
  if (imagen.startsWith('/')) return imagen;
  return `/images/${imagen}`;
}

function obtenerClaveProducto(producto) {
  return producto?.id || producto?._id || producto?.slug;
}

export default BuscadorProductos;
