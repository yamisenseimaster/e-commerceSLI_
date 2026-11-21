import { precioVigente } from '../utilidades/precioVigente';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiHeart, FiShoppingCart } from 'react-icons/fi';
import ModalProducto from './Modales/ModalProducto';
import { usarCarrito } from '../Contextos/ContextoCarrito';
import { usarFavoritos } from '../Contextos/ContextoFavoritos';
import { traducirCategoria } from '../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Productos({ product: producto }) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const { addToCart: agregarAlCarrito } = usarCarrito();
  const { isFavorite: esFavorito, toggleFavorite: alternarFavorito } =
    usarFavoritos();
  const idProducto = producto?.id || producto?._id;
  const favorito = esFavorito(idProducto);
  const abrirVistaRapida = () => establecerModalAbierto(true);

  const precioHabitual = Number(producto?.price) || 0;
  const enOferta = Boolean(producto?.flashSale);
  const precio = precioVigente(producto);
  const stock = Number(producto?.quantity || 0);
  const etiqueta = producto?.tags?.[0] || producto?.tag?.[0];
  const estado =
    stock <= 0 ? 'Sin stock' : stock < 20 ? 'Stock bajo' : 'Disponible';
  const estiloEstado =
    stock <= 0
      ? 'bg-[#fff0f5] text-[#be185d] dark:bg-[#3a1521] dark:text-[#f9a8d4]'
      : stock < 20
        ? 'bg-[#fff3c4] text-[#755b00] dark:bg-[#352d12] dark:text-[#f4df70]'
        : 'bg-[#dcfce7] text-[#15803d] dark:bg-[#0f2f28] dark:text-[#9ff2df]';

  return (
    <>
      <ModalProducto
        modalOpen={modalAbierto}
        setModalOpen={establecerModalAbierto}
        product={producto}
      />

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-[#fffef9] via-[#fdf3c7] to-[#fae69e]/85 p-3.5 shadow-[0_14px_34px_-4px_rgba(212,163,43,0.22)] ring-1 ring-[#f7df94]/35 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-4px_rgba(212,163,43,0.30)] dark:from-[#242016] dark:via-[#1e1b13] dark:to-[#17150f] dark:ring-white/10">
        {/* 1. Imagen encuadrada con el verde del Mercadito */}
        <button
          type="button"
          onClick={abrirVistaRapida}
          aria-label={`Vista rápida de ${producto?.title ?? 'producto'}`}
          className="group relative flex h-44 w-full items-center justify-center overflow-hidden rounded-[20px] border-2 border-main/70 bg-gradient-to-b from-[#e7fff8] to-[#f4fdf9] p-3 shadow-inner focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-main dark:border-main/50 dark:from-[#122b25] dark:to-[#0f211c] sm:h-48">
          <img
            alt=""
            src={obtenerImagenProducto(producto)}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full rounded-xl object-contain transition-transform duration-200 motion-safe:group-hover:scale-[1.05]"
          />
          {enOferta && Number(producto.discount) > 0 && (
            <span className="absolute right-2.5 top-2.5 rounded-full border border-white/80 bg-flash px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
              -{producto.discount}%
            </span>
          )}
        </button>

        <div className="mt-3 flex flex-1 flex-col">
          {/* Fila de estado + 2. Precio encuadrado */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${estiloEstado}`}>
              {estado}
            </span>

            <div className="flex flex-wrap items-baseline gap-x-1.5 rounded-xl border-[1.5px] border-[#f0b469] bg-[#ffefd6] px-2.5 py-1 shadow-2xs dark:border-[#855c28] dark:bg-[#332412]">
              <p
                className={`text-lg font-black leading-none ${
                  enOferta
                    ? 'text-flash'
                    : 'text-[#6e3d0a] dark:text-[#ffd9a6]'
                }`}>
                {'$'}
                {formatoPrecio.format(precio)}
              </p>
              {enOferta && precio < precioHabitual && (
                <del className="text-[11px] font-semibold text-[#9c6f3e] dark:text-[#c99e6b]">
                  {'$'}
                  {formatoPrecio.format(precioHabitual)}
                </del>
              )}
            </div>
          </div>

          {/* Nombre y categoría libres */}
          <h3 className="mt-2.5 line-clamp-2 text-[15px] font-extrabold leading-5 text-[#1e293b] dark:text-[#f4f4f5]">
            <Link
              to={`/products/${encodeURIComponent(idProducto)}`}
              className="hover:text-main focus-visible:underline">
              {producto?.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-[#64748b] dark:text-[#a3aca8]">
            {traducirCategoria(producto?.type) || 'Producto'}
            {etiqueta ? ` • ${etiqueta}` : ''}
          </p>

          {/* Barra inferior de acciones */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <button
              type="button"
              onClick={() => alternarFavorito(producto)}
              aria-pressed={favorito}
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-lg transition hover:bg-[#fff0f5] hover:text-flash dark:hover:bg-[#351421] ${
                favorito
                  ? 'text-flash'
                  : 'text-[#526461] dark:text-[#b1c7c1]'
              }`}
              aria-label="Favorito">
              <FiHeart className={favorito ? 'fill-current' : ''} />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={abrirVistaRapida}
                className="flex size-9 items-center justify-center rounded-xl text-lg text-[#526461] transition hover:bg-[#e7fff8] hover:text-main dark:text-[#b1c7c1] dark:hover:bg-[#24342e]"
                aria-label="Vista rápida">
                <FiEye />
              </button>
              <button
                type="button"
                onClick={() => agregarAlCarrito(idProducto, 1)}
                disabled={stock <= 0}
                className="flex size-9 items-center justify-center rounded-xl bg-main text-lg text-white shadow-xs transition hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#66756f]"
                aria-label="Agregar al carrito">
                <FiShoppingCart />
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}

function obtenerImagenProducto(producto) {
  const imagen = producto?.image || '';
  if (imagen.startsWith('http') || imagen.startsWith('data:')) return imagen;
  if (imagen.startsWith('/media/')) return `${ORIGEN_API}${imagen}`;
  if (imagen.startsWith('/products/')) return `/images${imagen}`;
  if (imagen.startsWith('/images/')) return imagen;
  if (imagen.startsWith('/')) return imagen;
  return `/images/${imagen}`;
}

export default Productos;
