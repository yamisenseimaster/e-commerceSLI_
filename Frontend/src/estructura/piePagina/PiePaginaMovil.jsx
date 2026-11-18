import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiUserCheck } from 'react-icons/fi';
import { CgMenuBoxed } from 'react-icons/cg';
import { BsCart4 } from 'react-icons/bs';
import { ContextoBarraLateral } from '../../Contextos/ContextoVentanas';
import { NavLink } from 'react-router-dom';
import { usarCarrito } from '../../Contextos/ContextoCarrito';

const PiePaginaMovil = () => {
  const { toggleMobileDrawer, toggleCartDrawer } =
    useContext(ContextoBarraLateral);
  const { itemCount: cantidadArticulos } = usarCarrito();
  const activo = 'bg-main text-white shadow-[0_10px_24px_rgba(0,200,147,0.28)]';
  const inActive =
    'transitions flex h-12 min-w-[66px] flex-col items-center justify-center rounded-full px-2 text-[#26344a] hover:bg-main hover:text-white dark:text-[#f4f4f5] dark:hover:bg-main';
  const Hover = ({ isActive }) =>
    isActive ? `${activo} ${inActive}` : inActive;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 lg:hidden">
      <motion.div
        className="relative mx-auto flex h-16 max-w-[430px] items-center justify-between rounded-full border border-white/55 bg-white/[0.86] px-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#171717]/[0.88] dark:shadow-black/35"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: [0, -3, 0], scale: 1 }}
        transition={{
          duration: 0.55,
          ease: 'easeOut',
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ y: -2 }}>
        <NavLink to="/dashboard" className={Hover}>
          <ContenidoNavegacionMovil icon={<FiUserCheck />} label="Perfil" />
        </NavLink>
        <NavLink to="/shop" className={Hover}>
          <ContenidoNavegacionMovil icon={<FiShoppingBag />} label="Tienda" />
        </NavLink>
        <button onClick={toggleCartDrawer} className={`${inActive} relative`}>
          {cantidadArticulos > 0 && (
            <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flash px-1 text-[10px] font-black text-white">
              {cantidadArticulos}
            </div>
          )}
          <ContenidoNavegacionMovil icon={<BsCart4 />} label="Carrito" />
        </button>
        <button onClick={toggleMobileDrawer} className={inActive}>
          <ContenidoNavegacionMovil icon={<CgMenuBoxed />} label="Menu" />
        </button>
      </motion.div>
    </footer>
  );
};

function ContenidoNavegacionMovil({ icon: icono, label: etiqueta }) {
  return (
    <>
      <span className="text-[19px] leading-none">{icono}</span>
      <span className="mt-1 text-[10px] font-black leading-none">
        {etiqueta}
      </span>
    </>
  );
}

export default PiePaginaMovil;
