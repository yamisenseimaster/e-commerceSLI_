import { precioVigente } from '../../utilidades/precioVigente';
import React, { useState } from 'react';
import ModalPrincipal from './ModalPrincipal';
import {
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTruck,
} from 'react-icons/fi';
import { usarCarrito } from '../../Contextos/ContextoCarrito';
import { usarFavoritos } from '../../Contextos/ContextoFavoritos';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { traducirCategoria } from '../../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const ModalProducto = ({
  modalOpen: modalAbierto,
  setModalOpen: establecerModalAbierto,
  product: producto,
}) => {
  const [elemento, establecerElemento] = useState(1);
  const { addToCart: agregarAlCarrito } = usarCarrito();
  const { isFavorite, toggleFavorite } = usarFavoritos();
  const { user: usuario } = usarAutenticacion();
  const idProducto = producto?.id || producto?._id;
  const favorite = isFavorite(idProducto);

  const handleAddToCart = async () => {
    if (!(await agregarAlCarrito(idProducto, elemento))) return;
    establecerModalAbierto(false);
    establecerElemento(1);
  };

  const precio =
    precioVigente(producto);
  const stock = Number(producto?.quantity || 0);
  const estado =
    stock <= 0 ? 'Sin stock' : stock < 20 ? 'Stock bajo' : 'Disponible';

  return (
    <ModalPrincipal
      modalOpen={modalAbierto}
      setModalOpen={establecerModalAbierto}>
      <div className="inline-block w-full max-w-[980px] py-10 align-middle transition-all">
        <div className="scrollbar-invisible max-h-[86vh] overflow-y-auto rounded-[20px] border border-[#d9e0ea] bg-white text-left shadow-2xl shadow-slate-900/20 dark:border-[#303030] dark:bg-[#171717]">
          <div className="grid gap-6 p-5 md:grid-cols-[minmax(280px,0.9fr)_1.1fr] md:p-7">
            <div className="flex min-h-[320px] items-center justify-center rounded-[16px] bg-[#f4f7fb] p-6 dark:bg-[#222222]">
              <img
                src={obtenerImagenProducto(producto)}
                className="w-full h-full object-contain"
                alt={producto?.title}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex w-full flex-col text-[#172033] dark:text-[#f4f4f5]">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-[6px] bg-[#e7fff8] px-2.5 py-1 text-[11px] font-black text-main dark:bg-[#0f2f28]">
                  {estado}
                </span>
                <span className="rounded-[6px] bg-[#edf4ff] px-2.5 py-1 text-[11px] font-black text-[#306fd6] dark:bg-[#17243d]">
                  {traducirCategoria(producto?.type) || 'Producto'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!usuario) establecerModalAbierto(false);
                    toggleFavorite(producto);
                  }}
                  className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    favorite
                      ? 'border-flash bg-[#fff0f5] text-flash dark:bg-[#351421]'
                      : 'border-[#d9e0ea] text-[#64748b] hover:border-flash hover:text-flash dark:border-[#303030]'
                  }`}
                  title={
                    favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }>
                  <FiHeart className={favorite ? 'fill-current' : ''} />
                </button>
              </div>
              <h1 className="text-[28px] font-black leading-tight dark:text-[#f4f4f5]">
                {producto?.title}
              </h1>
              <p className="mt-3 text-[12px] font-semibold text-[#7b8798]">
                {stock} unidades disponibles
              </p>
              <h2 className="mt-5 text-[30px] font-black dark:text-white">
                ${precio.toFixed(2)}
                {producto?.flashSale && (
                  <del className="ml-3 text-[15px] font-semibold text-[#9aa6b8]">
                    ${Number(producto.price || 0).toFixed(2)}
                  </del>
                )}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-main">
                <FiTruck /> Envio disponible para ordenes confirmadas
              </p>
              <p className="mt-5 text-[14px] leading-7 text-gray-500 dark:text-[#aeb7c5]">
                {producto?.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-[160px_1fr]">
                <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-[#d9e0ea] dark:border-[#303030] dark:bg-[#101010]">
                  <button
                    onClick={() => establecerElemento(elemento - 1)}
                    disabled={elemento === 1}
                    className="flex-colo h-12 border-none transition hover:bg-[#f4f7fb] disabled:opacity-40 dark:hover:bg-[#222]">
                    <FiMinus />
                  </button>
                  <p className="flex-colo h-12 font-black">{elemento}</p>
                  <button
                    onClick={() => establecerElemento(elemento + 1)}
                    disabled={
                      producto?.quantity < elemento ||
                      producto?.quantity === elemento
                    }
                    className="flex-colo h-12 border-none transition hover:bg-[#f4f7fb] disabled:opacity-40 dark:hover:bg-[#222]">
                    <FiPlus />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={producto?.quantity < 1}
                  className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-main px-4 font-black text-white transition hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#cbd5e1]">
                  <FiShoppingCart /> Agregar al carrito - $
                  {(precio * elemento).toFixed(2)}
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {producto?.tag?.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-full bg-[#f4f7fb] px-3 py-1.5 text-[12px] font-bold text-[#526176] dark:bg-[#222] dark:text-[#cbd5e1]">
                    #{t}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-2 rounded-[14px] border border-[#d9e0ea] p-4 text-[13px] dark:border-[#303030]">
                <Especificacion
                  label="Categoría"
                  value={traducirCategoria(producto?.type) || 'General'}
                />
                <Especificacion
                  label="SKU"
                  value={producto?._id?.slice(0, 8) || producto?.id || 'N/A'}
                />
                <Especificacion
                  label="Inventario"
                  value={`${stock} unidades`}
                />
                <Especificacion label="Entrega" value="Disponible segun zona" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPrincipal>
  );
};

function Especificacion({ label: etiqueta, value: valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eef2f7] py-1.5 last:border-0 dark:border-[#303030]">
      <span className="flex items-center gap-2 font-bold text-[#7b8798]">
        <FiCheck className="text-main" /> {etiqueta}
      </span>
      <span className="text-right font-black text-[#172033] dark:text-white">
        {valor}
      </span>
    </div>
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

export default React.memo(ModalProducto);
