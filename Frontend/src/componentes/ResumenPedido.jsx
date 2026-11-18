import React, { useState } from 'react';
import { AiFillEye } from 'react-icons/ai';
import { FiPackage, FiTag, FiTrash2 } from 'react-icons/fi';
import ModalProducto from './Modales/ModalProducto';
import { usarCarrito } from '../Contextos/ContextoCarrito';
import { traducirCategoria } from '../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

function ResumenPedido({ order: pedido, shippingCost }) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const [producto, establecerProducto] = useState();
  const { cart: carrito, removeFromCart: quitarDelCarrito } = usarCarrito();
  const shipping = carrito.items.length > 0 ? Number(shippingCost ?? 20) : 0;
  const total = Number(carrito.total || 0);
  const totals = [
    { name: 'Subtotal', cost: total },
    { name: 'Envio', cost: shipping },
  ];

  return (
    <>
      <ModalProducto
        modalOpen={modalAbierto}
        setModalOpen={establecerModalAbierto}
        product={producto}
      />

      <div className="border-b border-[#e6ebf2] bg-[#f8fbff]/86 px-5 py-5 dark:border-white/[0.08] dark:bg-black/20">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-main/10 text-xl text-main">
            <FiPackage />
          </span>
          <div>
            <h2 className="text-[20px] font-black text-[#111827] dark:text-white">
              Resumen del pedido
            </h2>
            <p className="text-[12px] font-bold text-[#7b8798] dark:text-[#aeb7c5]">
              {carrito.items.length
                ? `${carrito.items.length} producto${carrito.items.length === 1 ? '' : 's'} en tu carrito`
                : 'Tu carrito esta vacio'}
            </p>
          </div>
        </div>
      </div>

      <div className="cart-scroll max-h-[360px] overflow-y-auto px-5 py-2">
        {carrito.items.length === 0 && (
          <div className="my-6 rounded-[18px] border border-dashed border-[#d9e0ea] bg-white/60 px-4 py-8 text-center dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[14px] font-black text-[#26344a] dark:text-white">
              No hay productos todavia.
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#7b8798] dark:text-[#aeb7c5]">
              Agrega productos para completar el pedido.
            </p>
          </div>
        )}

        {carrito.items.map((elemento) => {
          const p = elemento.product;
          if (!p) return null;

          return (
            <div
              key={p.id}
              className="grid grid-cols-[72px_minmax(0,1fr)_36px] items-center gap-3 border-b border-[#eef2f7] py-4 last:border-0 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  if (!pedido) return;
                  establecerProducto(p);
                  establecerModalAbierto(true);
                }}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-[#f3f7ff] p-2 ring-1 ring-[#e6ebf2] dark:bg-white/[0.07] dark:ring-white/[0.08]">
                <img
                  alt={p.title}
                  src={obtenerImagenProducto(p)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </button>
              <div className="min-w-0">
                <h3 className="truncate text-[14px] font-black text-[#172033] dark:text-white">
                  {p.title}
                </h3>
                <p className="mt-1 text-[12px] font-semibold text-[#7b8798] dark:text-[#aeb7c5]">
                  {traducirCategoria(p.type) || 'Producto'} ·{' '}
                  {elemento.quantity} unidad
                  {elemento.quantity === 1 ? '' : 'es'}
                </p>
                <h2 className="mt-2 text-[15px] font-black text-main">
                  {formatearDinero(elemento.lineTotal)}{' '}
                  <span className="text-[11px] text-[#9aa6b8]">
                    x {elemento.quantity}
                  </span>
                </h2>
              </div>
              {pedido ? (
                <button
                  type="button"
                  onClick={() => {
                    establecerProducto(p);
                    establecerModalAbierto(true);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-main text-white transition hover:bg-subMain"
                  title="Ver producto">
                  <AiFillEye />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => quitarDelCarrito(p.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0f5] text-flash transition hover:bg-flash hover:text-white dark:bg-[#351421]"
                  title="Quitar producto">
                  <FiTrash2 />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!pedido && (
        <div className="px-5 pb-4">
          <div className="rounded-[18px] border border-[#e6ebf2] bg-[#f8fbff]/80 p-3 shadow-inner shadow-white/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#667085] dark:text-[#aeb7c5]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-main/10 text-main">
                <FiTag />
              </span>
              Cupon de descuento
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_96px]">
              <input
                type="text"
                placeholder="Codigo"
                className="h-11 min-w-0 rounded-full border border-[#d9e0ea] bg-white px-4 text-[13px] font-bold text-[#26344a] outline-none transition placeholder:text-[#a9b4c4] focus:border-main focus:ring-4 focus:ring-main/10 dark:border-white/[0.08] dark:bg-[#141414] dark:text-white"
              />

              <button
                type="button"
                className="h-11 rounded-full bg-main px-4 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(0,200,147,0.18)] transition hover:bg-subMain">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 border-t border-[#e6ebf2] px-5 py-5 dark:border-white/[0.08]">
        {totals.map((elemento) => (
          <div
            key={elemento.name}
            className="flex items-center justify-between text-[14px] font-bold text-[#667085] dark:text-[#aeb7c5]">
            {elemento.name}
            <span className="font-black text-[#172033] dark:text-white">
              {formatearDinero(elemento.cost)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-[18px] bg-[#111827] p-4 text-white dark:bg-white dark:text-[#111827]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] opacity-70">
              Total
            </p>
            <h3 className="mt-1 text-[24px] font-black">
              {formatearDinero(total + shipping)}
            </h3>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-2 text-[12px] font-black dark:bg-[#111827]/10">
            Final
          </span>
        </div>
      </div>
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

function formatearDinero(valor) {
  return `$${Number(valor || 0).toFixed(2)}`;
}

export default ResumenPedido;
