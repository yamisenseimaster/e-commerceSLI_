import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPackage,
  FiShoppingBag,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import InicioSesion from '../../componentes/Modales/InicioSesion';
import { ContextoBarraLateral } from '../../Contextos/ContextoVentanas';
import Carrito from '../../componentes/Paneles/Carrito';
import PanelMovil from '../../componentes/Paneles/PanelMovil';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { usarCarrito } from '../../Contextos/ContextoCarrito';
import { usarAjustesTema } from '../../Contextos/ContextoTema';
import BuscadorProductos from '../../componentes/BuscadorProductos';
import { enlaceSucursales } from '../../datos/navegacion';
import PanelFavoritos from '../../componentes/Paneles/PanelFavoritos';
import {
  EVENTO_FAVORITOS_REQUIERE_SESION,
  usarFavoritos,
} from '../../Contextos/ContextoFavoritos';

const BarraNavegacion = ({ colorPortada }) => {
  const enTienda = useLocation().pathname === '/shop';
  const barra = useRef(null);
  const [sobrePortada, establecerSobrePortada] = useState(true);
  const tienePortada = Boolean(colorPortada);
  useEffect(() => {
    if (!tienePortada) return;
    const portada = document.getElementById('portada');
    const actualizar = () => establecerSobrePortada(portada.getBoundingClientRect().bottom > barra.current.offsetHeight);
    const ajustarAltura = () => {
      portada.style.setProperty('--alto-navegacion', `${barra.current.getBoundingClientRect().height}px`);
      actualizar();
    };
    ajustarAltura();
    const observador = new ResizeObserver(ajustarAltura);
    observador.observe(portada);
    observador.observe(barra.current);
    window.addEventListener('scroll', actualizar, { passive: true });
    return () => {
      observador.disconnect();
      window.removeEventListener('scroll', actualizar);
    };
  }, [tienePortada]);
  const {
    toggleCartDrawer,
    closeCartDrawer,
    cartDrawerOpen,
    mobileDrawerOpen,
    toggleMobileDrawer,
  } = useContext(ContextoBarraLateral);
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const pendingFavoritesAction = useRef(null);
  const { user: usuario, logout: cerrarSesion } = usarAutenticacion();
  const { itemCount: cantidadArticulos } = usarCarrito();
  const { favoriteCount, addFavorite } = usarFavoritos();
  const { theme: tema, setMode: establecerModo } = usarAjustesTema();
  const navegar = useNavigate();
  const esOscuro = tema.mode === 'dark';

  useEffect(() => {
    const requestLogin = (evento) => {
      pendingFavoritesAction.current = {
        type: 'product',
        product: evento.detail.product,
      };
      setFavoritesDrawerOpen(false);
      establecerModalAbierto(true);
    };
    window.addEventListener(EVENTO_FAVORITOS_REQUIERE_SESION, requestLogin);
    return () =>
      window.removeEventListener(
        EVENTO_FAVORITOS_REQUIERE_SESION,
        requestLogin,
      );
  }, []);

  useEffect(() => {
    if (!modalAbierto && !usuario) pendingFavoritesAction.current = null;
  }, [modalAbierto, usuario]);

  useEffect(() => {
    if (!usuario || !pendingFavoritesAction.current) return;
    const action = pendingFavoritesAction.current;
    pendingFavoritesAction.current = null;
    if (action.type === 'drawer') setFavoritesDrawerOpen(true);
    else addFavorite(action.product);
  }, [usuario, addFavorite]);

  useEffect(() => {
    const closeOnOutsideClick = (evento) => {
      if (!accountMenuRef.current?.contains(evento.target))
        setAccountMenuOpen(false);
    };
    const closeOnEscape = (evento) => {
      if (evento.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const manejarCierreSesion = () => {
    setAccountMenuOpen(false);
    setFavoritesDrawerOpen(false);
    cerrarSesion();
    navegar('/');
  };

  const handleFavoritesClick = () => {
    if (usuario) {
      setFavoritesDrawerOpen(true);
    } else {
      pendingFavoritesAction.current = { type: 'drawer' };
      establecerModalAbierto(true);
    }
  };

  const hover =
    'text-[#26344a] hover:text-main transitions dark:text-[#d7dde7] dark:hover:text-main';
  const Hover = ({ isActive }) => (isActive ? 'text-main' : hover);
  return (
    <>
      <InicioSesion
        modalOpen={modalAbierto}
        setModalOpen={establecerModalAbierto}
        onSuccess={() => Boolean(pendingFavoritesAction.current)}
      />
      <Carrito
        cartDrawerOpen={cartDrawerOpen}
        closeCartDrawer={closeCartDrawer}
      />

      <PanelFavoritos
        closeFavoritesDrawer={() => setFavoritesDrawerOpen(false)}
        favoritesDrawerOpen={favoritesDrawerOpen}
      />

      <PanelMovil
        mobileDrawerOpen={mobileDrawerOpen}
        toggleMobileDrawer={toggleMobileDrawer}
      />

      <div ref={barra} style={colorPortada && sobrePortada ? { backgroundColor: colorPortada } : undefined}
        className={`sticky top-0 z-20 backdrop-blur ${colorPortada ? 'bg-white transition-colors duration-300 dark:bg-[#151515]' : 'border-b border-[#e2e8f0] bg-white/95 shadow-sm dark:border-[#2a2a2a] dark:bg-[#151515]/95'}`}>
        <div className="container relative mx-auto flex h-[58px] items-center gap-3 px-3 sm:px-4 md:h-16 lg:gap-5">
          <button
            type="button"
            onClick={toggleMobileDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[#26344a] lg:hidden dark:border-[#303030] dark:text-white"
            aria-label="Abrir menu">
            <FiMenu />
          </button>
          <div className={`shrink-0 ${enTienda ? "max-sm:absolute max-sm:left-1/2 max-sm:-translate-x-1/2" : ""}`}>
            <Link
              to="/"
              className="font-display inline-flex items-center text-[24px] font-black tracking-tight text-black dark:text-white">
              Merca<span className="text-main">dito</span>
            </Link>
          </div>

          <nav className="ml-4 hidden items-center gap-6 text-[13px] font-black lg:flex">
            <NavLink className={Hover} to="/shop">
              Tienda
            </NavLink>
            <NavLink {...enlaceSucursales} className={Hover} />
          </nav>

          <div className="hidden min-w-0 flex-1 md:block">
            <BuscadorProductos
              className="h-12 w-full"
              panelAmplio
              placeholder="Buscar productos, marcas y categorías…"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <div
              ref={accountMenuRef}
              className="relative hidden sm:block"
              onMouseEnter={() => usuario && setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
              onBlur={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget))
                  setAccountMenuOpen(false);
              }}>
              <button
                type="button"
                onClick={() =>
                  usuario
                    ? setAccountMenuOpen(true)
                    : establecerModalAbierto(true)
                }
                className="flex h-10 items-center gap-2 rounded-full border border-[#d9e0ea] px-3 text-[12px] font-black text-[#26344a] transition hover:border-main hover:text-main dark:border-[#303030] dark:text-[#d7dde7]"
                aria-haspopup={usuario ? 'true' : undefined}
                aria-expanded={usuario ? accountMenuOpen : undefined}
                aria-controls={usuario ? 'account-menu' : undefined}
                title={usuario ? 'Opciones de cuenta' : 'Iniciar sesión'}>
                <FiUser />
                <span>{usuario ? 'Cuenta' : 'Entrar'}</span>
                {usuario && (
                  <FiChevronDown
                    className={`text-xs transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              {usuario && accountMenuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full z-50 w-56 pt-2">
                  <div className="overflow-hidden rounded-2xl border border-[#dce5e3] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-[#303735] dark:bg-[#1b1d1c] dark:shadow-black/40">
                    <div className="border-b border-[#e7efec] px-3 py-2.5 dark:border-[#303735]">
                      <p className="truncate text-sm font-bold text-[#182a29] dark:text-white">
                        {usuario.name}
                      </p>
                      <p className="truncate text-xs text-[#71827d] dark:text-[#a6b6af]">
                        {usuario.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#314840] transition hover:bg-[#eaf8f3] hover:text-main dark:text-[#d7e5dd] dark:hover:bg-[#12362f]">
                      <FiUser /> Mi perfil
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#314840] transition hover:bg-[#eaf8f3] hover:text-main dark:text-[#d7e5dd] dark:hover:bg-[#12362f]">
                      <FiPackage /> Mis pedidos
                    </Link>
                    <div className="my-1 border-t border-[#e7efec] dark:border-[#303735]" />
                    <button
                      type="button"
                      onClick={manejarCierreSesion}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#d64545] transition hover:bg-[#fff0f0] dark:hover:bg-[#3a2020]">
                      <FiLogOut /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleFavoritesClick}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[#26344a] transition hover:border-flash hover:text-flash sm:flex dark:border-[#303030] dark:text-[#d7dde7]"
              aria-label="Favoritos"
              title="Favoritos">
              <FiHeart />
              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flash px-1 text-[10px] font-black text-white">
                  {favoriteCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => establecerModo(esOscuro ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[#26344a] transition hover:border-main hover:text-main dark:border-[#303030] dark:text-[#d7dde7]"
              title={
                esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
              }>
              {esOscuro ? <FiSun /> : <FiMoon />}
            </button>
            <button
              onClick={toggleCartDrawer}
              className="relative flex h-10 items-center gap-2 rounded-full bg-[#111827] px-4 text-[12px] font-black text-white transition hover:bg-main dark:bg-white dark:text-[#111827]">
              <FiShoppingBag />
              <span className="hidden sm:inline">Carrito</span>
              <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flash px-1 text-[10px] text-white">
                {cantidadArticulos}
              </div>
            </button>
          </div>
        </div>
        <div className="px-3 pb-2 sm:px-4 md:hidden">
          <BuscadorProductos className="h-11 w-full" showButton={!enTienda} />
        </div>
      </div>
    </>
  );
};
export default BarraNavegacion;
