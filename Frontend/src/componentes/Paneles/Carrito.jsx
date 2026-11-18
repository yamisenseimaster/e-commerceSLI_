import { motion } from 'framer-motion';
import { IoBagCheckOutline, IoClose } from 'react-icons/io5';
import { FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';
import PanelPrincipal from './PanelPrincipal';
import { traducirCategoria } from '../../utilidades/localizacion';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { usarCarrito } from '../../Contextos/ContextoCarrito';

function Carrito({ cartDrawerOpen, closeCartDrawer }) {
  const { isAuthenticated: estaAutenticado } = usarAutenticacion();
  const {
    cart: carrito,
    itemCount: cantidadArticulos,
    updateQuantity: actualizarCantidad,
    removeFromCart: quitarDelCarrito,
  } = usarCarrito();
  const shipping = estaAutenticado && carrito.items.length > 0 ? 20 : 0;
  const total = Number(carrito.total || 0);

  return (
    <PanelPrincipal
      DrawerOpen={cartDrawerOpen}
      closeDrawer={closeCartDrawer}
      className="cart-drawer">
      <motion.aside
        className="flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-white/70 bg-[#f7f4ef] text-[#111827] shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-white/[0.08] dark:bg-[#111111] dark:text-[#f4f4f5] dark:shadow-black/45"
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}>
        <header className="relative overflow-hidden border-b border-[#dce4ee] bg-white/78 px-5 py-5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#191919]/86">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-main/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-main/10 text-main">
                <IoBagCheckOutline />
              </p>
              <h2 className="font-display mt-3 text-[22px] font-black leading-tight">
                Carrito
              </h2>
              <p className="mt-1 text-[12px] font-semibold text-[#667085] dark:text-[#aeb7c5]">
                {cantidadArticulos > 0
                  ? `${cantidadArticulos} producto${cantidadArticulos === 1 ? '' : 's'} en tu pedido`
                  : 'Tu pedido esta esperando productos'}
              </p>
            </div>
            <button
              onClick={closeCartDrawer}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#667085] shadow-sm transition hover:bg-main hover:text-white dark:bg-white/10 dark:text-white"
              aria-label="Cerrar carrito">
              <IoClose />
            </button>
          </div>
        </header>

        <div className="cart-scroll flex-1 overflow-y-auto px-4 py-4">
          {!estaAutenticado && (
            <EmptyCart
              title="Inicia sesión"
              text="Entra a tu cuenta para guardar productos y terminar tu compra."
              actionLabel="Entrar o registrarme"
              actionTo="/profile"
              onAction={closeCartDrawer}
            />
          )}

          {estaAutenticado && carrito.items.length === 0 && (
            <EmptyCart
              title="Tu carrito esta vacio"
              text="Explora la tienda y agrega productos para verlos aqui."
              actionLabel="Ir a la tienda"
              actionTo="/shop"
              onAction={closeCartDrawer}
            />
          )}

          {carrito.items.length > 0 && (
            <div className="space-y-3">
              {carrito.items.map((elemento, indice) => {
                const producto = elemento.product;
                if (!producto) return null;
                const idProducto = producto.id || producto._id;

                return (
                  <motion.article
                    key={idProducto}
                    className="grid grid-cols-[82px_minmax(0,1fr)] gap-3 rounded-[18px] bg-white p-3 shadow-sm ring-1 ring-[#edf1f6] dark:bg-[#191919] dark:ring-white/[0.06]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: indice * 0.04,
                      ease: 'easeOut',
                    }}
                    whileHover={{ y: -2, scale: 1.01 }}>
                    <div className="flex h-24 items-center justify-center rounded-[15px] bg-[#eef5f2] p-2 dark:bg-white/[0.06]">
                      <img
                        alt={producto.title}
                        src={`/images/${producto.image}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-black text-[#172033] dark:text-white">
                            {producto.title}
                          </h3>
                          <p className="mt-1 text-[11px] font-semibold text-[#8b96a8]">
                            {traducirCategoria(producto.type) || 'Producto'}
                          </p>
                        </div>
                        <button
                          onClick={() => quitarDelCarrito(idProducto)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0f5] text-flash transition hover:bg-flash hover:text-white dark:bg-[#2a171f]"
                          aria-label={`Eliminar ${producto.title}`}>
                          <MdDelete />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex h-9 items-center overflow-hidden rounded-full bg-[#f3f7ff] ring-1 ring-[#e1e8f2] dark:bg-white/[0.06] dark:ring-white/[0.08]">
                          <button
                            onClick={() =>
                              actualizarCantidad(
                                idProducto,
                                elemento.quantity - 1,
                              )
                            }
                            disabled={elemento.quantity === 1}
                            className="flex h-full w-9 items-center justify-center text-[#64748b] transition hover:bg-main hover:text-white disabled:opacity-35"
                            aria-label="Restar cantidad">
                            <FiMinus />
                          </button>
                          <span className="flex h-full min-w-9 items-center justify-center text-[13px] font-black">
                            {elemento.quantity}
                          </span>
                          <button
                            onClick={() =>
                              actualizarCantidad(
                                idProducto,
                                elemento.quantity + 1,
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-[#64748b] transition hover:bg-main hover:text-white"
                            aria-label="Sumar cantidad">
                            <FiPlus />
                          </button>
                        </div>
                        <p className="text-[15px] font-black text-main">
                          ${Number(elemento.lineTotal || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#dce4ee] bg-white/86 p-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#191919]/90">
          <div className="mb-3 space-y-2 text-[13px] font-semibold text-[#667085] dark:text-[#aeb7c5]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-black text-[#172033] dark:text-white">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Envio</span>
              <span className="font-black text-[#172033] dark:text-white">
                ${shipping.toFixed(2)}
              </span>
            </div>
          </div>
          <Link
            to="/checkout"
            onClick={closeCartDrawer}
            className={`flex h-12 items-center justify-between rounded-[14px] px-4 text-sm font-black text-white transition ${
              estaAutenticado && carrito.items.length > 0
                ? 'bg-main hover:bg-subMain'
                : 'pointer-events-none bg-[#cbd5e1] dark:bg-[#333]'
            }`}>
            <span className="inline-flex items-center gap-2">
              <FiShoppingBag /> Ir a pagar
            </span>
            <span className="rounded-full bg-white/95 px-3 py-1 text-[#111827]">
              ${(total + shipping).toFixed(2)}
            </span>
          </Link>
        </div>
      </motion.aside>
    </PanelPrincipal>
  );
}

function EmptyCart({
  actionLabel,
  actionTo,
  onAction,
  text: texto,
  title: titulo,
}) {
  return (
    <motion.div
      className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] bg-white p-7 text-center shadow-sm ring-1 ring-[#edf1f6] dark:bg-[#191919] dark:ring-white/[0.06]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-main/10 text-[26px] text-main">
        <IoBagCheckOutline />
      </div>
      <h3 className="font-display mt-5 text-[20px] font-black text-[#172033] dark:text-white">
        {titulo}
      </h3>
      <p className="mt-2 max-w-[260px] text-[13px] font-medium leading-6 text-[#667085] dark:text-[#aeb7c5]">
        {texto}
      </p>
      <Link
        to={actionTo}
        onClick={onAction}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-main px-5 text-[12px] font-black text-white transition hover:bg-subMain">
        {actionLabel}
      </Link>
    </motion.div>
  );
}

export default Carrito;
