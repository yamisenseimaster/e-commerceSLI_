import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowRight,
  FiHeadphones,
  FiRefreshCw,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import Productos from '../componentes/Productos';
import CarruselPromociones from '../componentes/CarruselPromociones';
import Estructura from '../estructura/Estructura';
import { usarProductos } from '../Contextos/ContextoProductos';
import { CategoriasInicio } from '../datos/CategoriasInicio';
import { usarAjustesTema } from '../Contextos/ContextoTema';
import { traducirCategoria } from '../utilidades/localizacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

const beneficios = [
  {
    icon: FiTruck,
    title: 'Envio rapido',
    text: 'Entrega cuidada en cada pedido.',
  },
  {
    icon: FiRefreshCw,
    title: 'Cambios simples',
    text: 'Compra tranquilo y sin vueltas.',
  },
  {
    icon: FiShield,
    title: 'Pago seguro',
    text: 'Compra protegida y confiable.',
  },
  {
    icon: FiHeadphones,
    title: 'Soporte real',
    text: 'Te ayudamos antes y despues.',
  },
];

const datosDestacadosPortada = [
  { value: '24h', label: 'Pedidos rapidos', delay: 0.08 },
  { value: '+80', label: 'Productos', delay: 0.16 },
  { value: '100%', label: 'Stock real', delay: 0.24 },
];

function PantallaInicio() {
  const { products: productos } = usarProductos();
  const { theme: tema } = usarAjustesTema();
  const esOscuro = tema.mode === 'dark';
  const destacados = useMemo(() => productos.slice(0, 8), [productos]);
  const diapositivasPortada = useMemo(
    () => crearDiapositivasPortada(destacados),
    [destacados],
  );
  const [indiceDiapositivaActiva, establecerIndiceDiapositivaActiva] =
    useState(0);
  const diapositivaActiva = diapositivasPortada[indiceDiapositivaActiva];
  const productoPortada = diapositivaActiva.product;
  const productoSecundario = destacados[1];

  useEffect(() => {
    const temporizador = window.setInterval(() => {
      establecerIndiceDiapositivaActiva(
        (actual) => (actual + 1) % diapositivasPortada.length,
      );
    }, 5200);

    return () => window.clearInterval(temporizador);
  }, [diapositivasPortada.length]);

  return (
    <Estructura colorPortada={esOscuro ? diapositivaActiva.darkBg : diapositivaActiva.bg}>
      <div className="min-h-screen bg-[#f7f4ef] pb-28 text-[#111827] dark:bg-[radial-gradient(circle_at_top,_#162622_0%,_#101113_46%,_#0a0a0b_100%)] dark:text-[#f4f4f5] sm:pb-10">
        <section id="portada">
          <div
            className="relative flex min-h-[calc(100svh-110px)] items-center overflow-hidden px-4 py-6 transition-colors duration-700 sm:px-9 md:min-h-[calc(100svh-64px)] lg:px-[5vw] lg:py-10"
            style={{
              backgroundColor: esOscuro
                ? diapositivaActiva.darkBg
                : diapositivaActiva.bg,
            }}>
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                background: esOscuro
                  ? `radial-gradient(circle at 76% 38%, ${diapositivaActiva.darkGlow}, transparent 34%), linear-gradient(120deg, rgba(255,255,255,0.04), transparent 58%)`
                  : `radial-gradient(circle at 76% 38%, ${diapositivaActiva.glow}, transparent 32%), linear-gradient(120deg, rgba(255,255,255,0.54), transparent 56%)`,
              }}
            />

            <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-5 sm:gap-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
              <div className="max-w-[760px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={diapositivaActiva.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.48, ease: 'easeOut' }}>
                    <p className="mb-4 inline-flex rounded-full bg-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-main shadow-sm backdrop-blur-xl ring-1 ring-white/30 dark:bg-white/[0.07] dark:text-[#67e8f9] dark:ring-white/[0.06] sm:text-[11px] sm:tracking-[0.24em]">
                      {diapositivaActiva.eyebrow}
                    </p>
                    <h1 className="font-display max-w-[760px] text-[40px] font-black leading-[0.96] tracking-normal text-[#101828] dark:text-[#f8fafc] xs:text-[46px] sm:text-[76px] sm:leading-[0.92] lg:text-[92px]">
                      {diapositivaActiva.title}
                    </h1>
                    <p className="mt-4 max-w-[560px] text-[13px] font-semibold leading-6 text-[#344054] dark:text-[#cbd5e1] sm:mt-6 sm:text-[16px] sm:leading-7">
                      {diapositivaActiva.text}
                    </p>
                    <div className="mt-5 grid max-w-[620px] grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
                      {datosDestacadosPortada.map((elemento) => (
                        <motion.div
                          key={elemento.label}
                          className="rounded-[16px] bg-white/[0.30] px-3 py-3 shadow-sm backdrop-blur-xl ring-1 ring-white/25 dark:bg-white/[0.08] dark:ring-white/[0.06] sm:px-4"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.42,
                            ease: 'easeOut',
                            delay: elemento.delay,
                          }}>
                          <p className="font-display text-[20px] font-black leading-none text-[#101828] dark:text-white sm:text-[25px]">
                            {elemento.value}
                          </p>
                          <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#667085] dark:text-[#cbd5e1] sm:text-[11px]">
                            {elemento.label}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative min-h-[225px] overflow-hidden rounded-[18px] bg-white/[0.04] sm:min-h-[430px] sm:overflow-visible sm:bg-transparent lg:row-span-2">
                <div className="absolute bottom-1 right-2 h-[210px] w-[210px] rounded-full bg-white/35 blur-3xl dark:bg-main/10 sm:left-1/2 sm:top-1/2 sm:h-[330px] sm:w-[330px] sm:-translate-x-1/2 sm:-translate-y-1/2" />
                <AnimatePresence mode="wait">
                  {productoPortada && (
                    <motion.img
                      key={
                        productoPortada._id ||
                        productoPortada.id ||
                        productoPortada.title
                      }
                      src={obtenerImagenProducto(productoPortada)}
                      alt={productoPortada.title}
                      fetchPriority="high"
                      decoding="async"
                      className="absolute bottom-0 right-2 z-10 h-[220px] w-[220px] object-contain drop-shadow-[0_30px_38px_rgba(15,23,42,0.22)] sm:relative sm:right-auto sm:mx-auto sm:h-[430px] sm:w-[430px] lg:h-[500px] lg:w-[500px]"
                      initial={{ opacity: 0, rotate: -8, scale: 0.9, y: 24 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
                      exit={{ opacity: 0, rotate: 8, scale: 0.94, y: -16 }}
                      transition={{ duration: 0.62, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
                <div className="absolute bottom-4 left-2 z-20 max-w-[145px] rounded-[14px] bg-white/[0.68] p-3 shadow-[0_22px_45px_rgba(15,23,42,0.16)] backdrop-blur-2xl ring-1 ring-white/30 dark:bg-white/[0.14] dark:shadow-black/35 dark:ring-white/[0.08] sm:bottom-6 sm:left-8 sm:max-w-none sm:rounded-[18px] sm:p-4">
                  <p className="text-[10px] font-bold text-[#667085] dark:text-[#cbd5e1] sm:text-[12px]">
                    Producto destacado
                  </p>
                  <p className="mt-1 max-w-[150px] truncate text-[13px] font-black dark:text-white sm:max-w-[190px] sm:text-[16px]">
                    {productoPortada?.title || 'Producto fresco'}
                  </p>
                  <p className="text-[16px] font-black text-main sm:text-[18px]">
                    ${productoPortada?.salePrice || productoPortada?.price || 0}
                  </p>
                </div>
                <div className="absolute right-0 top-12 z-20 hidden rounded-[18px] bg-white/55 p-4 shadow-[0_20px_42px_rgba(15,23,42,0.15)] backdrop-blur-2xl ring-1 ring-white/25 dark:bg-white/[0.09] dark:shadow-black/35 dark:ring-white/[0.06] sm:block">
                  <p className="text-[13px] font-black dark:text-white">
                    {diapositivaActiva.badge}
                  </p>
                  <p className="text-[11px] text-[#667085] dark:text-[#cbd5e1]">
                    {diapositivaActiva.badgeText}
                  </p>
                </div>
                <div className="absolute bottom-6 right-4 z-20 hidden w-[170px] rounded-[18px] bg-white/45 p-4 shadow-[0_20px_42px_rgba(15,23,42,0.14)] backdrop-blur-2xl ring-1 ring-white/25 dark:bg-white/[0.09] dark:shadow-black/35 dark:ring-white/[0.06] lg:block">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-main">
                    Compra simple
                  </p>
                  <p className="mt-2 text-[13px] font-bold leading-5 text-[#344054] dark:text-[#e5e7eb]">
                    Stock, precio y pedido en una sola vista.
                  </p>
                </div>
              </div>

              <div className="lg:col-start-1 lg:max-w-[700px]">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-main dark:bg-white/[0.16] dark:ring-1 dark:ring-white/[0.10] dark:hover:bg-main sm:h-12 sm:px-6 sm:text-[13px]">
                    Comprar ahora <FiArrowRight />
                  </Link>
                  <a
                    href="#colecciones"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/45 px-4 text-[12px] font-black text-[#111827] shadow-sm backdrop-blur-xl ring-1 ring-white/35 transition hover:bg-white/65 hover:text-main dark:bg-white/[0.14] dark:text-[#f8fafc] dark:ring-white/[0.09] dark:hover:bg-main/[0.18] dark:hover:text-white sm:h-12 sm:px-6 sm:text-[13px]">
                    Ver colecciones
                  </a>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  {diapositivasPortada.map((slide, indice) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => establecerIndiceDiapositivaActiva(indice)}
                      className={`h-2.5 rounded-full transition-all ${
                        indice === indiceDiapositivaActiva
                          ? 'w-9 bg-main shadow-[0_0_18px_rgba(0,200,147,0.35)]'
                          : 'w-2.5 bg-white/70 ring-1 ring-white/70 hover:bg-white dark:bg-white/30 dark:ring-white/10 dark:hover:bg-white/60'
                      }`}
                      aria-label={`Ver slide ${indice + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <CarruselPromociones />

        <section className="container mx-auto grid gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((elemento) => (
            <div
              key={elemento.title}
              className="flex items-center gap-3 rounded-[16px] bg-white/[0.62] p-4 shadow-sm backdrop-blur-xl ring-1 ring-white/25 dark:bg-white/[0.07] dark:ring-white/[0.06]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-main ring-1 ring-white/70 dark:bg-white/10 dark:ring-white/10">
                <elemento.icon />
              </span>
              <div>
                <h3 className="text-[13px] font-black">{elemento.title}</h3>
                <p className="text-[11px] font-medium text-[#7b8798] dark:text-[#9ca3af]">
                  {elemento.text}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section id="colecciones" className="container mx-auto px-4 py-4">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-main">
                Categorias
              </p>
              <h2 className="font-display mt-1 text-[28px] font-black">
                Compra por coleccion
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden text-[13px] font-black text-main sm:inline-flex">
              Ver todo <FiArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CategoriasInicio.map((categoria) => (
              <article
                key={categoria.title}
                className="rounded-[18px] bg-white/[0.62] p-4 shadow-sm backdrop-blur-xl ring-1 ring-white/25 dark:bg-white/[0.07] dark:ring-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-black">
                    {traducirCategoria(categoria.title)}
                  </h3>
                  <Link
                    to={`/category/${categoria.images[0]?.name || categoria.title}`}
                    className="text-[12px] font-black text-main">
                    Explorar
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {categoria.images.map((elemento) => (
                    <Link
                      key={elemento.name}
                      to={`/category/${elemento.name}`}
                      className="group rounded-[14px] bg-white/[0.55] p-2 text-center ring-1 ring-white/50 backdrop-blur dark:bg-white/[0.08] dark:ring-white/10">
                      <img
                        src={`/images/categories/${elemento.img}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="mx-auto h-16 w-full object-contain transition group-hover:scale-105"
                      />
                      <span className="mt-2 block truncate text-[10px] font-bold text-[#526176] dark:text-[#cbd5e1]">
                        {traducirCategoria(elemento.name)}
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <TarjetaPromocion
              title="Llegadas nuevas"
              text="Productos frescos seleccionados para esta semana."
              product={productoSecundario || productoPortada}
            />
            <TarjetaPromocion
              title="Tendencias"
              text="Los mas pedidos por nuestros clientes."
              product={destacados[2] || productoPortada}
            />
            <div className="rounded-[18px] border border-white/10 bg-[#111827] p-6 text-white shadow-sm dark:bg-white/[0.08] dark:backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-main">
                Oferta limitada
              </p>
              <h3 className="font-display mt-3 text-[30px] font-black leading-tight">
                Hasta 40% de descuento
              </h3>
              <p className="mt-2 text-[13px] text-white/70">
                En productos seleccionados y ofertas activas.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-5 text-[12px] font-black text-[#111827]">
                Ver ofertas
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-4">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-main">
                Populares
              </p>
              <h2 className="font-display mt-1 text-[28px] font-black">
                Productos destacados
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden text-[13px] font-black text-main sm:inline-flex">
              Ver todos <FiArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((producto) => (
              <Productos
                bg
                key={producto._id || producto.id}
                product={producto}
              />
            ))}
          </div>
        </section>
      </div>
    </Estructura>
  );
}

function crearDiapositivasPortada(destacados) {
  const fallback = [
    {
      title: 'Producto fresco',
      salePrice: 40,
      price: 40,
      image: '/products/74.png',
    },
    {
      title: 'Combo del dia',
      salePrice: 29,
      price: 34,
      image: '/products/11.png',
    },
    {
      title: 'Bebida natural',
      salePrice: 12,
      price: 16,
      image: '/products/51.png',
    },
    {
      title: 'Ensalada premium',
      salePrice: 15,
      price: 23,
      image: '/products/21.png',
    },
  ];

  const elementos = [0, 1, 2, 3].map(
    (indice) => destacados[indice] || fallback[indice],
  );

  return [
    {
      eyebrow: 'Nueva coleccion',
      title: 'Comida fresca para cada momento.',
      text: 'Explora productos seleccionados, ofertas activas y compras rapidas desde una tienda mas clara, moderna y lista para vender.',
      badge: '+100 clientes',
      badgeText: 'confian en la tienda',
      bg: '#dce8e6',
      darkBg: '#10221f',
      glow: 'rgba(0, 200, 147, 0.22)',
      darkGlow: 'rgba(0, 200, 147, 0.22)',
      product: elementos[0],
    },
    {
      eyebrow: 'Menu especial',
      title: 'Sabores listos para compartir.',
      text: 'Arma tu pedido con productos destacados, stock actualizado y precios pensados para comprar sin vueltas.',
      badge: 'Stock real',
      badgeText: 'actualizado por sistema',
      bg: '#f7dccf',
      darkBg: '#2a1612',
      glow: 'rgba(255, 107, 107, 0.26)',
      darkGlow: 'rgba(255, 107, 107, 0.2)',
      product: elementos[1],
    },
    {
      eyebrow: 'Bebidas frias',
      title: 'Frescura directa a tu mesa.',
      text: 'Jugos, bebidas y acompaniamientos para completar cualquier compra desde un checkout simple.',
      badge: 'Pago facil',
      badgeText: 'modo prueba activo',
      bg: '#d7edf5',
      darkBg: '#0f1f2a',
      glow: 'rgba(31, 194, 251, 0.26)',
      darkGlow: 'rgba(31, 194, 251, 0.2)',
      product: elementos[2],
    },
    {
      eyebrow: 'Ofertas activas',
      title: 'Elige rapido, compra mejor.',
      text: 'Encuentra productos populares, descuentos y categorias listas para navegar desde el primer vistazo.',
      badge: 'Ofertas',
      badgeText: 'seleccion semanal',
      bg: '#e9e1f7',
      darkBg: '#1d1730',
      glow: 'rgba(108, 92, 231, 0.24)',
      darkGlow: 'rgba(108, 92, 231, 0.24)',
      product: elementos[3],
    },
  ];
}

function TarjetaPromocion({ title: titulo, text: texto, product: producto }) {
  return (
    <article className="grid min-h-[210px] grid-cols-[1fr_150px] overflow-hidden rounded-[18px] border border-white/[0.55] bg-white/[0.68] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
      <div className="p-6">
        <h3 className="text-[24px] font-black leading-tight">{titulo}</h3>
        <p className="mt-2 text-[13px] leading-5 text-[#7b8798] dark:text-[#9ca3af]">
          {texto}
        </p>
        <Link
          to="/shop"
          className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-main">
          Comprar <FiArrowRight />
        </Link>
      </div>
      {producto && (
        <div className="flex items-center justify-center bg-white/[0.55] dark:bg-white/[0.08]">
          <img
            src={obtenerImagenProducto(producto)}
            alt={producto.title}
            loading="lazy"
            decoding="async"
            className="h-36 w-36 object-contain drop-shadow-lg"
          />
        </div>
      )}
    </article>
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

export default PantallaInicio;
