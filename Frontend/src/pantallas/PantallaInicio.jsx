import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiMapPin,
  FiMessageCircle,
  FiShoppingBag,
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

const pasosCompra = [
  {
    icon: FiShoppingBag,
    title: 'Elegí tus favoritos',
    text: 'Armá tu pedido con stock actualizado.',
    fondo: 'from-[#e4f8f0] via-[#f4fcf9] to-[#ffffff] border-[#75d2b0]',
    iconoCaja: 'bg-[#d0f3e6] text-[#0f6b53] border-[#67cfa9]',
  },
  {
    icon: FiMapPin,
    title: 'Indicá tu sucursal',
    text: 'Seleccioná envío o retiro en el local.',
    fondo: 'from-[#e3f0ff] via-[#f2f8ff] to-[#ffffff] border-[#84bcff]',
    iconoCaja: 'bg-[#d4e8ff] text-[#153973] border-[#6ba8f2]',
  },
  {
    icon: FiCreditCard,
    title: 'Confirmá tu pago',
    text: 'Checkout simple, rápido y sin vueltas.',
    fondo: 'from-[#fef6d8] via-[#fffbec] to-[#ffffff] border-[#f3c65f]',
    iconoCaja: 'bg-[#fdeba6] text-[#755000] border-[#eab338]',
  },
  {
    icon: FiCheckCircle,
    title: '¡Listo para disfrutar!',
    text: 'Te avisamos apenas sale tu pedido.',
    fondo: 'from-[#fce7f3] via-[#fff4fa] to-[#ffffff] border-[#f5b5d2]',
    iconoCaja: 'bg-[#fbcfe8] text-[#9d174d] border-[#f472b6]',
  },
  {
    icon: FiMessageCircle,
    title: 'Atención por WhatsApp',
    text: 'Consultá tu pedido en tiempo real al +54 9 388 452-8910.',
    fondo: 'from-[#dcfce7] via-[#f0fdf4] to-[#ffffff] border-[#4ade80]',
    iconoCaja: 'bg-[#bbf7d0] text-[#15803d] border-[#22c55e]',
  },
];

const datosDestacadosPortada = [
  {
    value: '24h',
    label: 'Pedidos rapidos',
    delay: 0.08,
    caja: 'border-[#96c5fa] bg-white/85 dark:border-[#2e4f73] dark:bg-white/[0.08]',
    texto: 'text-[#153973] dark:text-[#93c5fd]',
  },
  {
    value: '+80',
    label: 'Productos',
    delay: 0.16,
    caja: 'border-[#f5b5d2] bg-white/85 dark:border-[#5e2a42] dark:bg-white/[0.08]',
    texto: 'text-[#be185d] dark:text-[#f9a8d4]',
  },
  {
    value: '100%',
    label: 'Stock real',
    delay: 0.24,
    caja: 'border-[#86efac] bg-white/85 dark:border-[#234d42] dark:bg-white/[0.08]',
    texto: 'text-[#0f6b53] dark:text-[#8de2c3]',
  },
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
  const [indicePasoActivo, establecerIndicePasoActivo] = useState(0);
  const diapositivaActiva = diapositivasPortada[indiceDiapositivaActiva];
  const productoPortada = diapositivaActiva.product;
  const productoSecundario = destacados[1];
  const pasoActual = pasosCompra[indicePasoActivo];
  const IconoPaso = pasoActual.icon;

  useEffect(() => {
    const temporizador = window.setInterval(() => {
      establecerIndiceDiapositivaActiva(
        (actual) => (actual + 1) % diapositivasPortada.length,
      );
    }, 5200);

    return () => window.clearInterval(temporizador);
  }, [diapositivasPortada.length]);

  useEffect(() => {
    const intervaloPasos = window.setInterval(() => {
      establecerIndicePasoActivo(
        (actual) => (actual + 1) % pasosCompra.length,
      );
    }, 3600);

    return () => window.clearInterval(intervaloPasos);
  }, []);

  return (
    <Estructura colorPortada={esOscuro ? diapositivaActiva.darkBg : diapositivaActiva.bg}>
      <div className="min-h-screen bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%22160%22_height=%22160%22_viewBox=%220_0_160_160%22%3E%3Cpath_d=%22M36_52h34a11_11_0_0_0_0-22_14_14_0_0_0-26-5_12_12_0_0_0-8_27Z%22_fill=%22none%22_stroke=%22%236ba5e7%22_stroke-opacity=%220.18%22_stroke-width=%221.5%22/%3E%3Cpath_d=%22M106_122h32a10_10_0_0_0_0-20_13_13_0_0_0-24-4_11_11_0_0_0-8_24Z%22_fill=%22none%22_stroke=%22%23e0a93b%22_stroke-opacity=%220.22%22_stroke-width=%221.5%22/%3E%3Cpath_d=%22M124_34v12M118_40h12M38_118v10M33_123h10%22_stroke=%22%236ba5e7%22_stroke-opacity=%220.22%22_stroke-width=%221.5%22_stroke-linecap=%22round%22/%3E%3C/svg%3E'),radial-gradient(ellipse_68%_38%_at_12%_14%,#fcd972_0%,transparent_72%),radial-gradient(ellipse_72%_35%_at_86%_26%,#a6d2ff_0%,transparent_70%),radial-gradient(ellipse_64%_40%_at_22%_54%,#fde28a_0%,transparent_74%),radial-gradient(ellipse_76%_36%_at_80%_78%,#b3d9ff_0%,transparent_72%),linear-gradient(165deg,#fdf8e6_0%,#eef6ff_50%,#fef9e6_100%)] pb-28 text-[#111827] dark:bg-[radial-gradient(circle_at_top,_#162622_0%,_#101113_46%,_#0a0a0b_100%)] dark:text-[#f4f4f5] sm:pb-10">
        <section id="portada">
          <div
            className="relative overflow-hidden px-4 py-6 transition-colors duration-700 sm:px-8 lg:py-8"
            style={{
              backgroundColor: esOscuro
                ? diapositivaActiva.darkBg
                : diapositivaActiva.bg,
            }}>
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                background: esOscuro
                  ? `radial-gradient(circle at 74% 44%, ${diapositivaActiva.darkGlow}, transparent 36%), linear-gradient(120deg, rgba(255,255,255,0.04), transparent 58%)`
                  : `radial-gradient(circle at 74% 44%, ${diapositivaActiva.glow}, transparent 34%), linear-gradient(120deg, rgba(255,255,255,0.58), transparent 56%)`,
              }}
            />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-7 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
              <div className="max-w-[560px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={diapositivaActiva.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.44, ease: 'easeOut' }}>
                    <p className="mb-3 inline-flex rounded-full border border-[#84bcff] bg-[#e3f0ff]/90 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#153973] shadow-2xs backdrop-blur-xl dark:border-[#3d6b9c] dark:bg-[#1a3047] dark:text-[#9ec5f0] sm:text-[11px]">
                      {diapositivaActiva.eyebrow}
                    </p>
                    <h1 className="font-display text-[34px] font-black leading-[1.04] tracking-tight text-[#101828] dark:text-[#f8fafc] sm:text-[44px] lg:text-[48px]">
                      {diapositivaActiva.titlePrefix}{' '}
                      <span className="text-[#153973] dark:text-[#8ec5ff]">
                        {diapositivaActiva.titleBlue}
                      </span>{' '}
                      <span className="text-[#be185d] dark:text-[#f9a8d4]">
                        {diapositivaActiva.titlePink}
                      </span>
                    </h1>
                    <p className="mt-3 max-w-[490px] text-[13px] font-semibold leading-6 text-[#344054] dark:text-[#cbd5e1] sm:text-[14px]">
                      {diapositivaActiva.text}
                    </p>
                    <div className="mt-4 grid max-w-[470px] grid-cols-3 gap-2 sm:mt-5 sm:gap-2.5">
                      {datosDestacadosPortada.map((elemento) => (
                        <motion.div
                          key={elemento.label}
                          className={`rounded-2xl border px-3 py-2.5 shadow-2xs backdrop-blur-xl ${elemento.caja}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.38,
                            ease: 'easeOut',
                            delay: elemento.delay,
                          }}>
                          <p className="font-display text-[18px] font-black leading-none text-[#101828] dark:text-white sm:text-[21px]">
                            {elemento.value}
                          </p>
                          <p
                            className={`mt-1 truncate text-[9px] font-black uppercase tracking-[0.11em] sm:text-[10px] ${elemento.texto}`}>
                            {elemento.label}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Columna derecha: Óvalo contenedor de la imagen + tarjetitas */}
              <div className="relative mx-auto flex min-h-[260px] w-full max-w-[420px] items-center justify-center sm:min-h-[340px] lg:row-span-2">
                <div className="absolute h-[260px] w-[260px] rotate-6 rounded-[50%] bg-white/55 blur-2xl dark:bg-main/15 sm:h-[310px] sm:w-[310px]" />

                <div className="relative z-10 flex h-[250px] w-[225px] items-center justify-center overflow-hidden rounded-[50%] border-[3px] border-[#7ab8ff] bg-white/90 p-3 shadow-[0_22px_40px_-10px_rgba(21,57,115,0.22)] ring-4 ring-white/75 backdrop-blur-md dark:border-[#3d6b9c] dark:bg-[#182635]/90 dark:ring-white/10 sm:h-[315px] sm:w-[280px] sm:p-4">
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
                        className="h-full w-full rounded-[50%] object-contain drop-shadow-[0_18px_24px_rgba(15,23,42,0.18)]"
                        initial={{ opacity: 0, rotate: -6, scale: 0.9, y: 16 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, rotate: 6, scale: 0.94, y: -12 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Tarjeta inferior izquierda: Producto destacado (Azul) */}
                <div className="absolute bottom-2 left-1 z-20 max-w-[155px] rounded-2xl border border-[#84bcff] bg-white/90 p-2.5 shadow-[0_16px_34px_rgba(21,57,115,0.16)] backdrop-blur-xl dark:border-[#3d6b9c] dark:bg-[#162230]/90 sm:bottom-3 sm:left-0 sm:max-w-[180px] sm:p-3">
                  <p className="text-[10px] font-bold text-[#3b69a8] dark:text-[#93c5fd]">
                    Producto destacado
                  </p>
                  <p className="mt-0.5 truncate text-[12px] font-black text-[#101828] dark:text-white sm:text-[14px]">
                    {productoPortada?.title || 'Producto fresco'}
                  </p>
                  <p className="text-[14px] font-black text-[#153973] dark:text-[#8ec5ff] sm:text-[15px]">
                    ${productoPortada?.salePrice || productoPortada?.price || 0}
                  </p>
                </div>

                {/* Tarjeta superior derecha: Badge (Rosa) */}
                <div className="absolute right-1 top-2 z-20 hidden rounded-2xl border border-[#f5b5d2] bg-white/90 px-3.5 py-2.5 shadow-[0_16px_34px_rgba(190,24,93,0.14)] backdrop-blur-xl dark:border-[#5e2a42] dark:bg-[#241820]/90 sm:right-0 sm:block">
                  <p className="text-[12px] font-black text-[#101828] dark:text-white">
                    {diapositivaActiva.badge}
                  </p>
                  <p className="text-[10px] font-bold text-[#be185d] dark:text-[#f9a8d4]">
                    {diapositivaActiva.badgeText}
                  </p>
                </div>

                {/* Tarjeta inferior derecha: Compra simple (Verde) */}
                <div className="absolute bottom-3 right-0 z-20 hidden w-[150px] rounded-2xl border border-[#86efac] bg-white/90 p-3 shadow-[0_16px_34px_rgba(15,107,83,0.14)] backdrop-blur-xl dark:border-[#234d42] dark:bg-[#152420]/90 lg:block">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-main">
                    Compra simple
                  </p>
                  <p className="mt-1 text-[11px] font-bold leading-4 text-[#344054] dark:text-[#e5e7eb]">
                    Stock, precio y pedido en una sola vista.
                  </p>
                </div>
              </div>

              <div className="lg:col-start-1 lg:max-w-[540px]">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111827] px-5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-[#153973] dark:bg-white/[0.16] dark:ring-1 dark:ring-white/[0.10] dark:hover:bg-main">
                    Comprar ahora <FiArrowRight />
                  </Link>
                  <a
                    href="#colecciones"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#84bcff] bg-white/85 px-5 text-[12px] font-black text-[#153973] shadow-2xs backdrop-blur-xl transition hover:border-[#3b82f6] hover:bg-white dark:border-[#3d6b9c] dark:bg-white/[0.14] dark:text-[#b8dbff] dark:hover:bg-main/[0.18] dark:hover:text-white">
                    Ver colecciones
                  </a>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {diapositivasPortada.map((slide, indice) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => establecerIndiceDiapositivaActiva(indice)}
                      className={`h-2 rounded-full transition-all ${
                        indice === indiceDiapositivaActiva
                          ? 'w-8 bg-[#153973] shadow-[0_0_14px_rgba(21,57,115,0.35)] dark:bg-main'
                          : 'w-2 bg-white/85 ring-1 ring-[#96c5fa] hover:bg-white dark:bg-white/30 dark:ring-white/10 dark:hover:bg-white/60'
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

        <section className="container mx-auto px-4 py-5">
          <div
            className={`relative overflow-hidden rounded-[26px] border-2 bg-gradient-to-r px-5 py-5 shadow-[0_14px_30px_-10px_rgba(15,23,42,0.12)] transition-colors duration-500 dark:border-white/10 dark:from-[#182220] dark:via-[#141a19] dark:to-[#121615] sm:px-7 ${pasoActual.fondo}`}>
            <div className="flex flex-col items-center justify-center gap-3.5 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pasoActual.title}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl shadow-2xs dark:border-white/15 dark:bg-white/10 dark:text-[#8de2c3] ${pasoActual.iconoCaja}`}>
                    <IconoPaso />
                  </span>
                  <div className="text-center">
                    <h3 className="text-[16px] font-black text-[#111827] dark:text-white sm:text-[18px]">
                      {pasoActual.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#475569] dark:text-[#cbd5e1] sm:text-[14px]">
                      {pasoActual.text}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-2">
                {pasosCompra.map((item, idx) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => establecerIndicePasoActivo(idx)}
                    aria-label={`Ver ${item.title}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === indicePasoActivo
                        ? 'w-8 bg-[#111827] dark:bg-main'
                        : 'w-2 bg-black/20 hover:bg-black/40 dark:bg-white/25 dark:hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="colecciones" className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-main">
                Categorías
              </p>
              <h2 className="font-display mt-1 text-[28px] font-black text-[#102a21] dark:text-white">
                Compra por colección
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center rounded-full border border-[#67cfa9] bg-[#e5f7f0] px-4 py-1.5 text-[13px] font-black text-[#0f583e] transition hover:bg-main hover:text-white dark:border-[#2e6b56] dark:bg-[#193329] dark:text-[#8de2c3] sm:inline-flex">
              Ver todo <FiArrowRight className="ml-1.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {CategoriasInicio.map((categoria) => (
              <article
                key={categoria.title}
                className="relative overflow-hidden rounded-tl-[46px] rounded-tr-[18px] rounded-br-[48px] rounded-bl-[20px] border-2 border-[#75d2b0] bg-gradient-to-br from-[#c8eee0] via-[#dff6ed] to-[#f4fbf8] p-5 shadow-[0_18px_36px_-10px_rgba(14,94,66,0.20)] transition-transform duration-300 hover:-translate-y-1 dark:border-[#2e6e58] dark:from-[#17362b] dark:via-[#142921] dark:to-[#111f1a]">
                {/* Onda sinuosa superior */}
                <svg
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full text-[#8ee0c1]/65 dark:text-[#275948]/70">
                  <path
                    fill="currentColor"
                    d="M0,14 C85,28 160,0 245,14 C315,25 365,6 400,14 L400,0 L0,0 Z"
                  />
                </svg>

                {/* Onda sinuosa inferior */}
                <svg
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3.5 w-full rotate-180 text-[#8ee0c1]/55 dark:text-[#275948]/60">
                  <path
                    fill="currentColor"
                    d="M0,14 C85,28 160,0 245,14 C315,25 365,6 400,14 L400,0 L0,0 Z"
                  />
                </svg>

                <div className="relative flex items-center justify-between">
                  <h3 className="text-[19px] font-black text-[#0d4632] dark:text-white">
                    {traducirCategoria(categoria.title)}
                  </h3>
                  <Link
                    to={`/category/${categoria.images[0]?.name || categoria.title}`}
                    className="rounded-full border border-[#45be93] bg-white/85 px-3.5 py-1 text-[12px] font-black text-[#0e5c40] shadow-xs transition hover:bg-main hover:text-white dark:border-[#377d64] dark:bg-white/10 dark:text-[#8de2c3]">
                    Explorar
                  </Link>
                </div>

                <div className="relative mt-4 grid grid-cols-2 gap-2.5">
                  {categoria.images.map((elemento) => (
                    <Link
                      key={elemento.name}
                      to={`/category/${elemento.name}`}
                      className="group flex flex-col items-center justify-between rounded-tl-[26px] rounded-tr-[12px] rounded-br-[26px] rounded-bl-[12px] border border-[#8ce0c0] bg-white/95 px-2 py-2.5 text-center shadow-xs transition hover:border-main hover:bg-white dark:border-[#2d614f] dark:bg-[#1a2c25]">
                      <img
                        src={`/images/categories/${elemento.img}`}
                        alt={traducirCategoria(elemento.name)}
                        loading="lazy"
                        decoding="async"
                        className="mx-auto h-14 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="mt-2.5 inline-block whitespace-nowrap rounded-full border-[1.5px] border-[#39b58a] bg-[#eaf9f3] px-3 py-1 text-[11px] font-extrabold leading-none text-[#0e4a35] transition group-hover:border-main group-hover:bg-main group-hover:text-white dark:border-[#49be95] dark:bg-[#132e24] dark:text-[#a8eed4]">
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
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
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
            <div className="relative overflow-hidden rounded-[38px] border-2 border-[#f48fb1] bg-gradient-to-br from-[#701c41] via-[#8f2453] to-[#4d112c] p-6 text-white shadow-[0_18px_38px_-10px_rgba(143,36,83,0.34)]">
              {/* Trama sutil de lunares en el interior */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(#ffd1e3_1.2px,transparent_1.2px)] [background-size:14px_14px]"
              />
              {/* Óvalos decorativos */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-56 rotate-12 rounded-full bg-[#f472b6]/25"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 left-6 h-28 w-44 -rotate-6 rounded-full border border-white/20 bg-white/10"
              />

              <div className="relative z-10">
                <span className="inline-block rounded-full border border-[#f9a8d4]/60 bg-white/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#fbcfe8]">
                  Oferta limitada
                </span>
                <h3 className="font-display mt-3 text-[30px] font-black leading-tight">
                  Hasta 40% de descuento
                </h3>
                <p className="mt-2 text-[13px] text-white/85">
                  En productos seleccionados y ofertas activas.
                </p>
                <Link
                  to="/shop"
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-[#fce7f3] px-5 text-[12px] font-black text-[#701c41] shadow-sm transition hover:bg-white">
                  Ver ofertas
                </Link>
              </div>
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
      titlePrefix: 'Comida',
      titleBlue: 'fresca',
      titlePink: 'para cada momento.',
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
      titlePrefix: 'Sabores',
      titleBlue: 'listos',
      titlePink: 'para compartir.',
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
      titlePrefix: 'Frescura',
      titleBlue: 'directa',
      titlePink: 'a tu mesa.',
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
      titlePrefix: 'Elige',
      titleBlue: 'rapido,',
      titlePink: 'compra mejor.',
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
    <article className="group relative grid min-h-[230px] grid-cols-[1fr_148px] overflow-hidden rounded-[56px] border-[2.5px] border-[#84bcff] bg-gradient-to-br from-[#b4d6ff] via-[#d4e8ff] to-[#f0f7ff] shadow-[0_18px_36px_-10px_rgba(21,57,115,0.18)] ring-4 ring-[#84bcff]/20 transition-transform duration-300 hover:-translate-y-1 dark:border-[#3d6b9c] dark:from-[#1e3a57] dark:via-[#182c42] dark:to-[#14202e]">
      {/* Trama sutil interior de micropuntos azul cielo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#3b78bd_1.15px,transparent_1.15px)] [background-size:13px_13px] dark:opacity-20"
      />

      {/* Óvalos contorneados en el fondo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-10 h-36 w-52 -rotate-12 rounded-full border border-white/70 bg-white/50 dark:border-white/10 dark:bg-white/5"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-14 h-32 w-48 rotate-12 rounded-full border border-[#84bcff]/45 bg-white/40 dark:border-white/10 dark:bg-white/5"
      />

      <div className="relative z-10 flex flex-col justify-between p-6 pl-7">
        <div>
          <h3 className="text-[24px] font-black leading-tight text-[#153973] dark:text-white">
            {titulo}
          </h3>
          <p className="mt-2 text-[13px] font-semibold leading-5 text-[#2d528f] dark:text-[#b3d9ff]">
            {texto}
          </p>
        </div>
        <Link
          to="/shop"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border-[1.5px] border-[#5b9eed] bg-white/90 px-4 py-1.5 text-[12px] font-black text-[#153973] shadow-xs transition hover:border-[#2159a8] hover:bg-[#2159a8] hover:text-white dark:border-[#5b9eed] dark:bg-white/10 dark:text-[#b3d9ff]">
          Comprar <FiArrowRight />
        </Link>
      </div>

      {producto && (
        <div className="relative z-10 flex items-center justify-center pr-5">
          {/* Óvalo bien remarcado contenedor de la imagen */}
          <div className="h-36 w-32 overflow-hidden rounded-[50%] border-[2.5px] border-[#6ba8f2] bg-white/95 p-1 shadow-[0_10px_22px_rgba(21,57,115,0.16)] ring-4 ring-white/60 dark:border-[#5b9eed] dark:bg-white/15">
            <img
              src={obtenerImagenProducto(producto)}
              alt={producto.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-[50%] object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
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