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
  const precio = enOferta
    ? Number(producto?.salePrice ?? precioHabitual) || 0
    : precioHabitual;
  const stock = Number(producto?.quantity || 0);
  const etiqueta = producto?.tags?.[0] || producto?.tag?.[0];
  const estado =
    stock <= 0 ? 'Sin stock' : stock < 20 ? 'Stock bajo' : 'Disponible';
  const estiloEstado =
    stock <= 0
      ? 'bg-[#fff0f5] text-[#be185d] dark:bg-[#3a1521] dark:text-[#f9a8d4]'
      : stock < 20
        ? 'bg-[#fff8d7] text-[#755b00] dark:bg-[#352d12] dark:text-[#f4df70]'
        : 'bg-[#e7fff8] text-[#086650] dark:bg-[#0f2f28] dark:text-[#9ff2df]';

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
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-[#dce5e3] bg-white transition-colors hover:border-main/60 focus-within:border-main dark:border-[#303532] dark:bg-[#181818]">
        <button
          type="button"
          onClick={abrirVistaRapida}
          aria-label={`Vista rápida de ${producto?.title ?? 'producto'}`}
          className="group flex h-44 w-full items-center justify-center border-b border-[#edf2ef] bg-[#f8faf8] p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-main dark:border-[#303532] dark:bg-[#222522] sm:h-48">
          <img
            alt=""
            src={obtenerImagenProducto(producto)}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain transition-transform duration-200 motion-safe:group-hover:scale-[1.04]"
          />
        </button>

        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${estiloEstado}`}>
              {estado}
            </span>
            {enOferta && Number(producto.discount) > 0 && (
              <span className="rounded-sm bg-flash px-1.5 py-0.5 text-[10px] font-bold text-white">
                -{producto.discount}%
              </span>
            )}
          </div>
          <div className="mt-2 flex min-h-7 flex-wrap items-baseline gap-x-2">
            <p className={`text-xl font-black ${enOferta ? 'text-flash' : 'text-[#172033] dark:text-white'}`}>
              {'$'}{formatoPrecio.format(precio)}
            </p>
            {enOferta && precio < precioHabitual && (
              <del className="text-xs font-semibold text-[#667085] dark:text-[#a3aca8]">
                {'$'}{formatoPrecio.format(precioHabitual)}
              </del>
            )}
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#172033] dark:text-[#f4f4f5]">
            <Link
              to={`/products/${encodeURIComponent(idProducto)}`}
              className="hover:text-main focus-visible:underline">
              {producto?.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-[#667085] dark:text-[#a3aca8]">
            {traducirCategoria(producto?.type) || 'Producto'}
            {etiqueta ? ` • ${etiqueta}` : ''}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <button
              type="button"
              onClick={() => alternarFavorito(producto)}
              aria-pressed={favorito}
              className={`flex size-10 shrink-0 items-center justify-center rounded-sm text-lg transition hover:bg-[#fff0f5] hover:text-flash dark:hover:bg-[#351421] ${favorito ? 'text-flash' : 'text-[#526461] dark:text-[#b1c7c1]'}`}
              aria-label="Favorito">
              <FiHeart className={favorito ? 'fill-current' : ''} />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={abrirVistaRapida}
                className="flex size-10 items-center justify-center rounded-sm text-lg text-[#526461] transition hover:bg-[#eef8f4] hover:text-main dark:text-[#b1c7c1] dark:hover:bg-[#24342e]"
                aria-label="Vista rápida">
                <FiEye />
              </button>
              <button
                type="button"
                onClick={() => agregarAlCarrito(idProducto, 1)}
                disabled={stock <= 0}
                className="flex size-10 items-center justify-center rounded-sm bg-main text-lg text-white transition hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#66756f]"
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
