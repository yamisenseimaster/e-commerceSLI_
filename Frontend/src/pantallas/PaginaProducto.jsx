import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTag,
  FiTruck,
} from 'react-icons/fi';
import Estructura from '../estructura/Estructura';
import { usarCarrito } from '../Contextos/ContextoCarrito';
import { usarFavoritos } from '../Contextos/ContextoFavoritos';
import { usarProductos } from '../Contextos/ContextoProductos';
import Productos from '../componentes/Productos';
import { traducirCategoria } from '../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

function PaginaProducto() {
  const { productId: idProducto } = useParams();
  const { products: productos, loading: cargando } = usarProductos();
  const { addToCart: agregarAlCarrito } = usarCarrito();
  const { isFavorite, toggleFavorite } = usarFavoritos();
  const [cantidad, establecerCantidad] = useState(1);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    establecerCantidad(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [idProducto]);

  const producto = useMemo(
    () =>
      productos.find((elemento) =>
        [elemento.id, elemento._id, elemento.slug]
          .filter(Boolean)
          .map(String)
          .includes(String(idProducto)),
      ),
    [productos, idProducto],
  );

  const related = useMemo(() => {
    if (!producto) return [];
    return productos
      .filter(
        (elemento) =>
          obtenerClaveProducto(elemento) !== obtenerClaveProducto(producto),
      )
      .filter((elemento) => elemento.type === producto.type)
      .slice(0, 4);
  }, [producto, productos]);

  if (cargando) {
    return (
      <Estructura>
        <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f4ef] dark:bg-[#101010]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-main/20 border-t-main" />
        </div>
      </Estructura>
    );
  }

  if (!producto) {
    return (
      <Estructura>
        <div className="min-h-[70vh] bg-[#f7f4ef] px-4 py-12 dark:bg-[#101010]">
          <div className="container mx-auto rounded-[24px] bg-white p-8 text-center dark:bg-[#181818]">
            <h1 className="text-2xl font-black text-[#172033] dark:text-white">
              Producto no encontrado
            </h1>
            <Link
              to="/shop"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-main px-5 text-sm font-black text-white">
              Volver a tienda
            </Link>
          </div>
        </div>
      </Estructura>
    );
  }

  const productKey = obtenerClaveProducto(producto);
  const precio =
    Number(producto.flashSale ? producto.salePrice : producto.price) || 0;
  const oldPrice = Number(producto.price || 0);
  const stock = Number(producto.quantity || 0);
  const favorite = isFavorite(productKey);
  const selectedQuantity = Math.min(cantidad, Math.max(stock, 1));
  const discount =
    oldPrice > precio && producto.flashSale
      ? Math.round((1 - precio / oldPrice) * 100)
      : 0;
  const handleAdd = async () => {
    if (addingRef.current || stock <= 0) return;
    addingRef.current = true;
    setAdding(true);
    try {
      await agregarAlCarrito(productKey, selectedQuantity);
    } catch {
      toast.error('No pudimos agregar el producto. Intenta nuevamente.', {
        toastId: 'product-add-error',
      });
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  return (
    <Estructura>
      <main className="bg-[#f6f8fa] px-4 py-6 text-[#172033] dark:bg-[#101010] dark:text-white sm:px-6 lg:py-10">
        <div className="container mx-auto">
          <Link
            to="/shop"
            className="mb-5 inline-flex items-center gap-2 text-[13px] font-black text-main">
            <FiArrowLeft /> Volver a tienda
          </Link>

          <motion.section
            key={productKey}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="relative min-w-0">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] bg-white p-10 dark:bg-[#1c1e20] sm:p-14">
                {discount > 0 && (
                  <span className="absolute left-5 top-5 rounded-full bg-flash px-4 py-2 text-sm font-bold text-white">
                    -{discount}% de descuento
                  </span>
                )}
                <img
                  src={obtenerImagenProducto(producto)}
                  alt={producto.title}
                  className="h-full w-full object-contain drop-shadow-xl"
                />
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#667085] dark:text-[#b5bdc9]">
                <FiShoppingBag className="text-main" />{' '}
                {traducirCategoria(producto.type) || 'Selección de la tienda'}
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-main/10 px-3 py-1.5 text-[12px] font-black text-main">
                  <FiCheck /> {stock > 0 ? 'Disponible' : 'Sin stock'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f7ff] px-3 py-1.5 text-[12px] font-black text-[#526176] dark:bg-white/[0.08] dark:text-[#d7dde7]">
                  <FiTag /> {traducirCategoria(producto.type) || 'Producto'}
                </span>
              </div>

              <h1 className="break-words font-display text-[32px] font-black leading-tight text-[#111827] dark:text-white sm:text-[42px]">
                {producto.title}
              </h1>

              <p className="mt-4 text-[13px] font-bold text-[#667085] dark:text-[#aeb7c5]">
                {stock} unidades disponibles
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <p className="text-[36px] font-black text-main">
                  ${precio.toFixed(2)}
                </p>
                {producto.flashSale && (
                  <del className="pb-2 text-[16px] font-bold text-[#9aa6b8]">
                    ${oldPrice.toFixed(2)}
                  </del>
                )}
              </div>

              <p className="mt-4 max-w-2xl text-[14px] font-semibold leading-7 text-[#667085] dark:text-[#cbd5e1]">
                {producto.description ||
                  'Producto disponible para compra desde la tienda.'}
              </p>

              <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-black text-main">
                <FiTruck /> Envio disponible segun zona
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-[#d9e0ea] pt-5 text-sm dark:border-white/10">
                <span className="font-bold">Cantidad</span>
                <span className="text-[#667085] dark:text-[#b5bdc9]">
                  Subtotal{' '}
                  <strong className="ml-2 text-[#172033] dark:text-white">
                    ${(precio * (stock > 0 ? selectedQuantity : 0)).toFixed(2)}
                  </strong>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_52px] gap-3 sm:grid-cols-[130px_minmax(0,1fr)_52px]">
                <div className="grid grid-cols-3 overflow-hidden rounded-full border border-[#d9e0ea] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]">
                  <button
                    type="button"
                    aria-label="Reducir cantidad"
                    onClick={() =>
                      establecerCantidad(Math.max(1, selectedQuantity - 1))
                    }
                    className="flex h-12 items-center justify-center text-main disabled:opacity-40"
                    disabled={selectedQuantity === 1 || stock <= 0}>
                    <FiMinus />
                  </button>
                  <span
                    aria-live="polite"
                    className="flex h-12 items-center justify-center border-x border-[#d9e0ea] font-black dark:border-white/[0.08]">
                    {stock > 0 ? selectedQuantity : 0}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    onClick={() =>
                      establecerCantidad(Math.min(stock, selectedQuantity + 1))
                    }
                    className="flex h-12 items-center justify-center text-main disabled:opacity-40"
                    disabled={selectedQuantity >= stock}>
                    <FiPlus />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={stock <= 0 || adding}
                  className="col-span-2 row-start-2 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-main px-4 py-3 text-[14px] font-black text-white transition hover:bg-subMain disabled:opacity-50 sm:col-span-1 sm:row-start-auto">
                  <FiShoppingBag />{' '}
                  {adding
                    ? 'Agregando...'
                    : stock <= 0
                      ? 'Sin stock'
                      : 'Agregar al carrito'}
                </button>
                <button
                  type="button"
                  aria-pressed={favorite}
                  aria-label={
                    favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }
                  title={
                    favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }
                  onClick={() => toggleFavorite(producto)}
                  className={`flex h-12 items-center justify-center rounded-full border transition ${favorite ? 'border-flash bg-[#fff0f5] text-flash dark:bg-[#351421]' : 'border-[#d9e0ea] text-[#64748b] hover:border-flash hover:text-flash dark:border-white/[0.08] dark:text-[#d7dde7]'}`}>
                  <FiHeart className={favorite ? 'fill-current' : ''} />
                </button>
              </div>
              <div className="mt-7 divide-y divide-[#d9e0ea] border-y border-[#d9e0ea] dark:divide-white/10 dark:border-white/10">
                <details open className="py-4">
                  <summary className="cursor-pointer text-sm font-bold">
                    Detalles del producto
                  </summary>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <dt className="text-[#667085] dark:text-[#b5bdc9]">
                      Categoría
                    </dt>
                    <dd className="text-right">
                      {traducirCategoria(producto.type) || 'General'}
                    </dd>
                    <dt className="text-[#667085] dark:text-[#b5bdc9]">
                      Disponibilidad
                    </dt>
                    <dd className="text-right">
                      {stock > 0 ? `${stock} unidades` : 'Agotado'}
                    </dd>
                  </dl>
                </details>
                <details className="py-4">
                  <summary className="cursor-pointer text-sm font-bold">
                    Envio y pago
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[#667085] dark:text-[#b5bdc9]">
                    Elige el tipo de envio y el metodo de pago al finalizar tu
                    compra. Podras revisar el costo de envio y el total antes de
                    confirmar el pedido.
                  </p>
                </details>
              </div>
            </div>
          </motion.section>

          {related.length > 0 && (
            <section className="mt-12">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-main">
                Tambien te puede gustar
              </p>
              <h2 className="mt-2 text-[28px] font-black text-[#111827] dark:text-white">
                Productos relacionados
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {related.map((elemento) => (
                  <Productos
                    key={obtenerClaveProducto(elemento)}
                    product={elemento}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </Estructura>
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

function obtenerClaveProducto(producto) {
  return producto?.id || producto?._id || producto?.slug;
}

export default PaginaProducto;
