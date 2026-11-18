import React from 'react';
import { IoClose } from 'react-icons/io5';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PanelPrincipal from './PanelPrincipal';
import { DatosCategorias } from './../../datos/DatosCategorias';
import { traducirCategoria } from '../../utilidades/localizacion';
import { enlaceSucursales } from '../../datos/navegacion';

function PanelMovil({ mobileDrawerOpen, toggleMobileDrawer }) {
  return (
    <PanelPrincipal
      DrawerOpen={mobileDrawerOpen}
      closeDrawer={toggleMobileDrawer}
      placement="left"
      className="mobile-menu-drawer">
      <motion.div
        className="ml-2 mt-2 h-[calc(100dvh-16px)] w-[min(88vw,360px)] overflow-hidden rounded-[26px] bg-white/92 shadow-[0_28px_80px_rgba(15,23,42,0.28)] backdrop-blur-2xl ring-1 ring-white/70 dark:bg-[#151515]/94 dark:shadow-black/45 dark:ring-white/10"
        initial={{ opacity: 0, x: -24, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}>
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-5 py-4 dark:border-[#282828]">
          <Link
            onClick={toggleMobileDrawer}
            to="/"
            className="font-display text-[23px] font-black text-[#111827] dark:text-white">
            Merca<span className="text-main">dito</span>
          </Link>
          <button
            onClick={toggleMobileDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f7ff] text-[#526176] transition hover:bg-main hover:text-white dark:bg-white/10 dark:text-white"
            aria-label="Cerrar menu">
            <IoClose />
          </button>
        </div>

        <div className="mobile-menu-scroll h-[calc(100dvh-89px)] overflow-y-auto px-4 py-4">
          <NavLink {...enlaceSucursales} onClick={toggleMobileDrawer} className="mb-5 block font-bold text-main" />
          <div className="mb-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-main">
              Categorias
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {DatosCategorias.map((categoria, indice) => (
                <motion.div
                  key={categoria._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: indice * 0.025,
                    ease: 'easeOut',
                  }}>
                  <NavLink
                    onClick={toggleMobileDrawer}
                    to={`/category/${categoria.title}`}
                    className={({ isActive }) =>
                      `flex min-h-[64px] items-center gap-3 rounded-[18px] p-3 text-left transition ${
                        isActive
                          ? 'bg-main text-white shadow-[0_14px_28px_rgba(0,200,147,0.20)]'
                          : 'bg-[#f7fafc] text-[#172033] ring-1 ring-[#edf1f6] hover:bg-[#eefbf8] hover:text-main dark:bg-white/[0.06] dark:text-[#f4f4f5] dark:ring-white/10 dark:hover:bg-main/10'
                      }`
                    }>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white/10">
                      <img
                        src={`/images/${categoria.icon}`}
                        className="h-7 w-7 object-contain"
                        alt={traducirCategoria(categoria.title)}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-black">
                        {traducirCategoria(categoria.title)}
                      </span>
                    </span>
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </PanelPrincipal>
  );
}

export default PanelMovil;
