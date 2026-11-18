import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PanelPrincipal from './PanelPrincipal';
import { usarCarrito } from '../../Contextos/ContextoCarrito';
import { usarFavoritos } from '../../Contextos/ContextoFavoritos';
import { usarProductos } from '../../Contextos/ContextoProductos';
import { traducirCategoria } from '../../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

function PanelFavoritos({ closeFavoritesDrawer, favoritesDrawerOpen }) {
  const { products: productos } = usarProductos();
  const { addToCart: agregarAlCarrito } = usarCarrito();
  const {
    favoriteIds: idsFavoritos,
    removeFavorite,
    clearFavorites,
  } = usarFavoritos();
  const favoriteProducts = idsFavoritos
    .map((identificador) =>
      productos.find(
        (producto) =>
          String(producto.id || producto._id) === String(identificador),
      ),
    )
    .filter(Boolean);

  return (
    <PanelPrincipal
      DrawerOpen={favoritesDrawerOpen}
      closeDrawer={closeFavoritesDrawer}
      className="cart-drawer">
      <motion.aside
        className="flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-white/70 bg-[#f7f4ef] text-[#111827] shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-white/[0.08] dark:bg-[#111111] dark:text-[#f4f4f5] dark:shadow-black/45"
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}>
        <header className="relative overflow-hidden border-b border-[#dce4ee] bg-white/78 px-5 py-5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#191919]/86">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-flash/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-flash/10 text-flash">
                <FiHeart />
              </p>
              <h2 className="font-display mt-3 text-[22px] font-black leading-tight">
                Favoritos
              </h2>
              <p className="mt-1 text-[12px] font-semibold text-[#667085] dark:text-[#aeb7c5]">
                {favoriteProducts.length > 0
                  ? `${favoriteProducts.length} producto${favoriteProducts.length === 1 ? '' : 's'} guardado${favoriteProducts.length === 1 ? '' : 's'}`
                  : 'Guarda productos para verlos rapido'}
              </p>
            </div>
            <button
              onClick={closeFavoritesDrawer}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#667085] shadow-sm transition hover:bg-flash hover:text-white dark:bg-white/10 dark:text-white"
              aria-label="Cerrar favoritos">
              <FiX />
            </button>
          </div>
        </header>

        <div className="cart-scroll flex-1 overflow-y-auto px-4 py-4">
          {favoriteProducts.length === 0 ? (
            <motion.div
              className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] bg-white p-7 text-center shadow-sm ring-1 ring-[#edf1f6] dark:bg-[#191919] dark:ring-white/[0.06]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-flash/10 text-[26px] text-flash">
                <FiHeart />
              </div>
              <h3 className="font-display mt-5 text-[20px] font-black text-[#172033] dark:text-white">
                Sin favoritos
              </h3>
              <p className="mt-2 max-w-[260px] text-[13px] font-medium leading-6 text-[#667085] dark:text-[#aeb7c5]">
                Toca el corazon de un producto para guardarlo aca.
              </p>
              <Link
                to="/shop"
                onClick={closeFavoritesDrawer}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-main px-5 text-[12px] font-black text-white transition hover:bg-subMain">
                Ir a la tienda
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {favoriteProducts.map((producto, indice) => {
                const idProducto = String(producto.id || producto._id);
                const precio =
                  Number(
                    producto.flashSale ? producto.salePrice : producto.price,
                  ) || 0;

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
                        src={obtenerImagenProducto(producto)}
                        alt={producto.title}
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
                          type="button"
                          onClick={() => removeFavorite(idProducto)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0f5] text-flash transition hover:bg-flash hover:text-white dark:bg-[#2a171f]"
                          aria-label={`Quitar ${producto.title} de favoritos`}>
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-[16px] font-black text-main">
                          ${precio.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => agregarAlCarrito(idProducto, 1)}
                          disabled={Number(producto.quantity || 0) <= 0}
                          className="inline-flex h-9 items-center gap-2 rounded-full bg-main px-3 text-[11px] font-black text-white transition hover:bg-subMain disabled:bg-[#cbd5e1]">
                          <FiShoppingBag /> Agregar
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>

        {favoriteProducts.length > 0 && (
          <div className="border-t border-[#dce4ee] bg-white/86 p-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#191919]/90">
            <button
              type="button"
              onClick={clearFavorites}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#dce4ee] text-[12px] font-black text-[#667085] transition hover:border-flash hover:text-flash dark:border-white/[0.08] dark:text-[#aeb7c5]">
              Limpiar favoritos
            </button>
          </div>
        )}
      </motion.aside>
    </PanelPrincipal>
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

export default PanelFavoritos;
