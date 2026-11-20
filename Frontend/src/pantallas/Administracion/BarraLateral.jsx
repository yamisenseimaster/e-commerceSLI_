import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MorphIcon } from 'morphicons/react';
import {
  Bell,
  Calendar as Calendario,
  ChevronDown,
  FileText,
  Lock,
  LogOut,
  Maximize,
  Menu,
  Minimize,
  Moon,
  Search,
  ShoppingBag,
  Store,
  Sun,
  User,
  Users,
} from 'lucide';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { usarAjustesTema } from '../../Contextos/ContextoTema';
import { apiPedidos } from '../../servicios/api';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

function BarraLateral({
  children: hijos,
  title: titulo = 'Tienda',
  eyebrow = 'Paneles',
}) {
  const { user: usuario, logout: cerrarSesion } = usarAutenticacion();
  const { theme: tema, setMode: establecerModo } = usarAjustesTema();
  const navegar = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const topbarRef = useRef(null);
  const esOscuro = tema.mode === 'dark';

  useEffect(() => {
    const closeDropdown = (evento) => {
      if (!topbarRef.current?.contains(evento.target)) {
        setActiveDropdown(null);
      }
    };
    const syncFullscreen = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener('mousedown', closeDropdown);
    document.addEventListener('fullscreenchange', syncFullscreen);

    return () => {
      document.removeEventListener('mousedown', closeDropdown);
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      if (!usuario) return;

      try {
        const pedidos = await apiPedidos.listar();
        if (!mounted) return;

        setSystemNotifications(
          pedidos
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((pedido) => ({
              id: pedido.id,
              title:
                pedido.status === 'Pending'
                  ? 'Pedido pendiente'
                  : `Pedido ${traducirEstadoPedido(pedido.status)}`,
              message: `Pedido #${identificadorCorto(pedido.id)} por $${Number(pedido.total || 0).toLocaleString('en-US')}`,
              time: tiempoTranscurrido(pedido.createdAt),
              icon: pedido.status === 'Pending' ? Bell : ShoppingBag,
              color: pedido.status === 'Pending' ? '#f34b7e' : '#306fd6',
              path: '/orders',
            })),
        );
      } catch {
        if (!mounted) return;
        setSystemNotifications([]);
      }
    };

    loadNotifications();
    const temporizador = window.setInterval(loadNotifications, 30000);

    return () => {
      mounted = false;
      window.clearInterval(temporizador);
    };
  }, [usuario]);

  const pendingNotifications = useMemo(
    () =>
      systemNotifications.filter((elemento) =>
        elemento.title.toLowerCase().includes('pendiente'),
      ).length,
    [systemNotifications],
  );

  const toggleDropdown = (nombre) => {
    setActiveDropdown((actual) => (actual === nombre ? null : nombre));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      return;
    }

    await document.exitFullscreen?.();
  };

  const visibleGroups = useMemo(() => {
    const adminGroups = [
      {
        title: 'Paneles',
        items: [{ name: 'Tienda', link: '/dashboard', icon: ShoppingBag }],
      },
      {
        title: 'Aplicaciones',
        items: [
          { name: 'Calendario', link: '/calendar', icon: Calendario },
          { name: 'Productos', link: '/admin/products', icon: Store },
          { name: 'Clientes CRM', link: '/customers', icon: Users },
          { name: 'Lista de pedidos', link: '/orders', icon: FileText },
        ],
      },
      {
        title: 'Paginas',
        items: [
          { name: 'Mi perfil', link: '/profile', icon: User },
          { name: 'Cambiar contrasena', link: '/password', icon: Lock },
        ],
      },
    ];

    const customerGroups = [
      {
        title: 'Area de cliente',
        items: [
          { name: 'Mi perfil', link: '/profile', icon: User },
          { name: 'Lista de pedidos', link: '/orders', icon: FileText },
          { name: 'Cambiar contrasena', link: '/password', icon: Lock },
        ],
      },
    ];

    return usuario?.role === 'admin' ? adminGroups : customerGroups;
  }, [usuario?.role]);

  const shellClass = esOscuro
    ? 'bg-[#141414] text-slate-100'
    : 'bg-[#f5f7fb] text-[#29364a]';
  const panelClass = esOscuro
    ? 'border-[#2a2a2a] bg-[#171717]'
    : 'border-[#d9e0ea] bg-white';
  const sidebarPalette = obtenerPaletaBarraLateral(tema.sidebar, esOscuro);
  const sidebarClass = sidebarPalette.shell;
  const navBase =
    'group flex h-10 items-center gap-2.5 rounded-[10px] border px-3 text-[15px] font-semibold transition';
  const navInactive = sidebarPalette.navInactive;
  const navActive = sidebarPalette.navActive;

  const IconButton = ({
    children,
    label: etiqueta,
    onClick: alHacerClic,
    active: activo,
    badge,
  }) => (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={alHacerClic}
      className={`relative flex h-9 w-9 items-center justify-center rounded-[10px] border text-[15px] transition sm:h-8 sm:w-8 ${
        activo
          ? 'border-[var(--dash-accent)] bg-blue-50 text-[var(--dash-accent)] dark:bg-[#252525]'
          : esOscuro
            ? 'border-[#303030] bg-[#191919] text-[#cbd5e1] hover:border-[var(--dash-accent)] hover:text-white'
            : 'border-[#d9e0ea] bg-white text-[#7b8798] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]'
      }`}>
      {children}
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#f34b7e] dark:border-slate-950" />
      )}
    </button>
  );

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2100}
        className="app-toast-container"
        toastClassName="app-toast"
        bodyClassName="app-toast-body"
        progressClassName="app-toast-progress"
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={2}
        theme={esOscuro ? 'dark' : 'light'}
      />

      <div className={`dashboard-shell min-h-screen text-[16px] ${shellClass}`}>
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menu"
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed left-0 top-0 z-40 block h-dvh w-[min(88vw,264px)] border-r transition-transform duration-300 ease-out lg:h-screen lg:w-[236px] ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'} ${
            sidebarClass
          }`}>
          <div className="flex h-full flex-col">
            <Link
              to="/"
              className={`flex h-[62px] items-center px-8 ${sidebarPalette.divider}`}>
              <span
                className={`font-display text-[27px] font-black tracking-normal ${sidebarPalette.logoText}`}>
                Merca<span className="text-[var(--dash-accent)]">dito</span>
              </span>
            </Link>

            <div className="scrollbar-invisible flex-1 overflow-y-auto px-3.5 py-4">
              {visibleGroups.map((group) => (
                <div key={group.title} className="mb-4">
                  <p
                    className={`mb-2 px-1.5 text-[13px] font-bold uppercase tracking-wide ${sidebarPalette.groupTitle}`}>
                    {group.title}
                  </p>
                  <nav className="flex flex-col gap-1">
                    {group.items.map((elemento) => (
                      <NavLink
                        key={`${group.title}-${elemento.name}`}
                        to={elemento.link}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `${navBase} ${isActive ? navActive : navInactive}`
                        }>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.08] text-[16px] transition group-hover:bg-white/[0.14]">
                          <IconoPanel icon={elemento.icon} />
                        </span>
                        <span className="truncate">{elemento.name}</span>
                        {elemento.name === 'Tienda' && (
                          <IconoPanel
                            icon={ChevronDown}
                            className="ml-auto text-[11px] opacity-60"
                          />
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            <div className={`border-t p-3.5 ${sidebarPalette.footer}`}>
              <Link
                to="/"
                className="mb-2 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-main px-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-subMain">
                <IconoPanel icon={ShoppingBag} />
                <span>Ir a la tienda</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  cerrarSesion();
                  navegar('/');
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-flash px-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-red-600">
                <IconoPanel icon={LogOut} />
                <span>Cerrar sesion</span>
              </button>
            </div>
          </div>
        </aside>

        <div
          className={`min-w-0 transition-[padding] duration-300 ease-out ${sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-[236px]'}`}>
          <header
            className={`sticky top-0 z-20 flex h-[58px] items-center justify-between gap-2 border-b px-3 sm:h-[60px] sm:px-5 ${panelClass}`}>
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#29364a] transition hover:bg-[#f3f7ff] dark:text-slate-200 dark:hover:bg-[#242424] sm:h-8 sm:w-8"
                aria-label={sidebarCollapsed ? 'Mostrar menu' : 'Ocultar menu'}
                title={sidebarCollapsed ? 'Mostrar menu' : 'Ocultar menu'}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileSidebarOpen(true);
                    return;
                  }

                  setSidebarCollapsed((actual) => !actual);
                }}>
                <IconoPanel icon={Menu} className="text-[19px]" />
              </button>
              <div
                className={`hidden h-9 w-[270px] items-center gap-2 rounded-full border px-3.5 md:flex ${
                  esOscuro
                    ? 'border-[#303030] bg-[#111111]'
                    : 'border-[#d9e0ea] bg-[#fbfcff]'
                }`}>
                <IconoPanel
                  icon={Search}
                  className="text-[15px] text-[#a9b4c4]"
                />
                <input
                  className="h-full w-full border-0 bg-transparent p-0 text-[14px] font-medium text-[#6b7788] outline-none placeholder:text-[#a9b4c4] dark:text-slate-200 dark:placeholder:text-[#6b7280]"
                  placeholder="Buscar..."
                  type="text"
                />
              </div>
            </div>

            <div
              ref={topbarRef}
              className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
              <IconButton
                label={esOscuro ? 'Modo claro' : 'Modo oscuro'}
                onClick={() => establecerModo(esOscuro ? 'light' : 'dark')}>
                <IconoPanel icon={esOscuro ? Sun : Moon} />
              </IconButton>
              <div className="relative md:hidden">
                <IconButton
                  label="Buscar"
                  onClick={() => toggleDropdown('search')}
                  active={activeDropdown === 'search'}>
                  <IconoPanel icon={Search} />
                </IconButton>
                {activeDropdown === 'search' && (
                  <MenuBarraSuperior
                    className="right-0 w-[260px]"
                    isDark={esOscuro}>
                    <div
                      className={`flex h-10 items-center gap-2 rounded-[8px] border px-3 ${
                        esOscuro
                          ? 'border-[#303030] bg-[#111111]'
                          : 'border-[#d9e0ea] bg-[#fbfcff]'
                      }`}>
                      <IconoPanel
                        icon={Search}
                        className="text-[13px] text-[#a9b4c4]"
                      />
                      <input
                        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] text-[#6b7788] outline-none placeholder:text-[#a9b4c4] dark:text-slate-200"
                        placeholder="Buscar..."
                        type="text"
                      />
                    </div>
                  </MenuBarraSuperior>
                )}
              </div>
              <IconButton
                label={
                  isFullscreen
                    ? 'Salir de pantalla completa'
                    : 'Pantalla completa'
                }
                onClick={toggleFullscreen}>
                <IconoPanel icon={isFullscreen ? Minimize : Maximize} />
              </IconButton>
              <div className="relative hidden sm:block">
                <IconButton
                  label="Notificaciones"
                  onClick={() => toggleDropdown('notifications')}
                  active={activeDropdown === 'notifications'}
                  badge={pendingNotifications > 0}>
                  <IconoPanel icon={Bell} />
                </IconButton>
                {activeDropdown === 'notifications' && (
                  <MenuBarraSuperior
                    className="right-0 w-[255px]"
                    isDark={esOscuro}>
                    <TituloMenu
                      title={`Notificaciones${pendingNotifications ? ` (${pendingNotifications})` : ''}`}
                    />
                    <div className="space-y-1.5">
                      {systemNotifications.length ? (
                        systemNotifications.map((elemento) => (
                          <FilaNotificacion
                            key={elemento.id}
                            item={elemento}
                            isDark={esOscuro}
                            onClick={() => {
                              setActiveDropdown(null);
                              navegar(elemento.path);
                            }}
                          />
                        ))
                      ) : (
                        <MenuVacio text="No hay notificaciones recientes." />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        navegar('/orders');
                      }}
                      className="mt-2 h-7 w-full rounded-[4px] border border-[var(--dash-accent)] bg-blue-50 text-[11px] font-semibold text-[var(--dash-accent)] dark:bg-slate-800">
                      Ver todas las notificaciones
                    </button>
                  </MenuBarraSuperior>
                )}
              </div>
              <div className="ml-1 hidden text-right sm:block">
                <p className="text-[15px] font-bold leading-5 text-[#1f2937] dark:text-white">
                  {usuario?.name || 'Administrador'}
                </p>
                <p className="text-[13px] capitalize leading-4 text-[#8b96a8]">
                  {usuario?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--dash-accent)] text-[13px] font-bold text-white shadow-lg shadow-emerald-300/30">
                {usuario?.avatar ? (
                  <img
                    src={`${ORIGEN_API}${usuario.avatar}`}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  usuario?.name?.slice(0, 1) || 'A'
                )}
              </div>
            </div>
          </header>

          <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#9aa6b8]">
                  {eyebrow}
                </p>
                <h1 className="font-display mt-1 truncate text-[24px] font-black leading-8 text-[#263b60] dark:text-white sm:text-[28px]">
                  {titulo}
                </h1>
              </div>
              <div className="hidden text-[14px] font-medium text-[#8b96a8] dark:text-[#7c8594] sm:block">
                Tienda /{' '}
                <span className="font-semibold text-[var(--dash-accent)]">
                  {titulo}
                </span>
              </div>
            </div>

            {hijos}
          </main>
        </div>
      </div>
    </>
  );
}

function IconoPanel({
  icon: icono,
  className = '',
  label: etiqueta,
  size = '1em',
}) {
  return (
    <MorphIcon
      icon={icono}
      size={size}
      strokeWidth={2.15}
      reducedMotion="user"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
      label={etiqueta}
    />
  );
}

function MenuBarraSuperior({ children: hijos, className, isDark: esOscuro }) {
  return (
    <div
      className={`absolute top-[36px] z-50 max-w-[calc(100vw-1.5rem)] rounded-[4px] border p-1.5 shadow-xl ${
        esOscuro
          ? 'border-slate-700 bg-slate-900 shadow-slate-950/40'
          : 'border-[#cfd8e6] bg-white shadow-slate-200/90'
      } ${className}`}>
      {hijos}
    </div>
  );
}

function TituloMenu({ title: titulo }) {
  return (
    <div className="mb-1 flex items-center justify-between px-1 py-1">
      <h3 className="text-[12px] font-bold text-[#2a3951] dark:text-white">
        {titulo}
      </h3>
    </div>
  );
}

function FilaNotificacion({
  item: elemento,
  isDark: esOscuro,
  onClick: alHacerClic,
}) {
  return (
    <button
      type="button"
      onClick={alHacerClic}
      className={`flex w-full items-start gap-2 rounded-[4px] border p-2 text-left transition ${
        esOscuro
          ? 'border-slate-700 bg-slate-950 hover:bg-slate-800'
          : 'border-[#d9e0ea] bg-white hover:bg-[#f6f9ff]'
      }`}>
      {elemento.avatar ? (
        <img
          src={elemento.avatar}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border text-[15px]"
          style={{
            borderColor: elemento.color,
            color: elemento.color,
            backgroundColor: `${elemento.color}12`,
          }}>
          <IconoPanel icon={elemento.icon || Bell} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <strong className="truncate text-[11px] text-[#2a3951] dark:text-white">
            {elemento.title || elemento.name}
          </strong>
          <span className="shrink-0 text-[9px] text-[#7b8798]">
            {elemento.time}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[10px] leading-4 text-[#7b8798]">
          {elemento.message}
        </span>
        {elemento.unread > 0 && (
          <span className="mt-1 inline-flex rounded-full bg-[#f34b7e] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {elemento.unread} nuevo{elemento.unread > 1 ? 's' : ''}
          </span>
        )}
      </span>
    </button>
  );
}

function MenuVacio({ text: texto }) {
  return (
    <div className="rounded-[4px] border border-dashed border-[#d9e0ea] px-3 py-5 text-center text-[11px] font-semibold text-[#7b8798] dark:border-slate-700">
      {texto}
    </div>
  );
}

function identificadorCorto(identificador) {
  return String(identificador || '')
    .slice(0, 8)
    .toUpperCase();
}

function traducirEstadoPedido(estado) {
  const map = {
    Pending: 'pendiente',
    Processing: 'en proceso',
    Complete: 'completado',
    Completed: 'completado',
    Canceled: 'cancelado',
    Cancelled: 'cancelado',
    Shipped: 'enviado',
    Delivered: 'entregado',
  };

  return map[estado] || String(estado || 'actualizado').toLowerCase();
}

function tiempoTranscurrido(valor) {
  if (!valor) return '';

  const diff = Date.now() - new Date(valor).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(valor).toLocaleDateString('es-ES');
}

function obtenerPaletaBarraLateral(sidebar, esOscuro) {
  const base = {
    default: {
      shell: esOscuro
        ? 'border-[#2a2a2a] bg-[#151515]'
        : 'border-[#d9e0ea] bg-white',
      divider: esOscuro ? 'border-[#2a2a2a]' : 'border-[#d9e0ea]',
      footer: esOscuro ? 'border-[#2a2a2a]' : 'border-[#d9e0ea]',
      groupTitle: 'text-[#a2adbd]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro
        ? 'border-transparent text-[#9ca3af] hover:border-[#2f2f2f] hover:bg-[#202020] hover:text-white'
        : 'border-transparent text-[#64748b] hover:border-[#c7d7f6] hover:bg-[#f3f7ff] hover:text-[var(--dash-accent)]',
      navActive: esOscuro
        ? 'border-[#303030] bg-[#252525] text-white shadow-none'
        : 'border-[var(--dash-accent)] bg-[#eef5ff] text-[var(--dash-accent)] shadow-sm shadow-blue-100/70',
    },
    dark: {
      shell:
        'border-[#242424] bg-[#111111] text-white shadow-[12px_0_40px_rgba(0,0,0,0.28)]',
      divider: 'border-[#242424]',
      footer: 'border-[#242424]',
      groupTitle: 'text-[#8b949e]',
      logoText: 'text-white',
      navInactive:
        'border-transparent text-[#aeb7c5] hover:border-white/[0.08] hover:bg-white/[0.07] hover:text-white',
      navActive: 'border-white/[0.10] bg-white/[0.10] text-white shadow-none',
    },
    primary: {
      shell: esOscuro
        ? 'border-[#214073] bg-[#10213d] text-white shadow-[12px_0_40px_rgba(12,34,66,0.28)]'
        : 'border-[#bdd6ff] bg-[#eaf3ff] text-[#162033] shadow-[12px_0_34px_rgba(48,111,214,0.12)]',
      divider: esOscuro ? 'border-[#244b85]' : 'border-[#c9dcfb]',
      footer: esOscuro ? 'border-[#244b85]' : 'border-[#c9dcfb]',
      groupTitle: esOscuro ? 'text-[#99b9f2]' : 'text-[#6683ad]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro
        ? 'border-transparent text-[#c3d8ff] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white'
        : 'border-transparent text-[#536174] hover:border-[var(--dash-accent)] hover:bg-white/70 hover:text-[var(--dash-accent)]',
      navActive: esOscuro
        ? 'border-white/[0.14] bg-white/[0.12] text-white shadow-none'
        : 'border-[var(--dash-accent)] bg-white text-[var(--dash-accent)] shadow-sm shadow-blue-100/80',
    },
    gradient: {
      shell: esOscuro
        ? 'border-[#243247] bg-[radial-gradient(circle_at_top_left,rgba(48,111,214,0.28),transparent_34%),linear-gradient(160deg,#111827_0%,#171717_55%,#0f172a_100%)] text-white shadow-[12px_0_42px_rgba(2,6,23,0.34)]'
        : 'border-[#cbdaf1] bg-[radial-gradient(circle_at_top_left,rgba(48,111,214,0.18),transparent_34%),linear-gradient(160deg,#ffffff_0%,#f3f7ff_54%,#eefbf8_100%)] text-[#162033] shadow-[12px_0_34px_rgba(48,111,214,0.11)]',
      divider: esOscuro ? 'border-white/[0.08]' : 'border-white/70',
      footer: esOscuro ? 'border-white/[0.08]' : 'border-white/70',
      groupTitle: esOscuro ? 'text-[#93a4bd]' : 'text-[#75859b]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro
        ? 'border-transparent text-[#cbd5e1] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white'
        : 'border-transparent text-[#526176] hover:border-white hover:bg-white/72 hover:text-[var(--dash-accent)]',
      navActive: esOscuro
        ? 'border-white/[0.14] bg-white/[0.12] text-white shadow-none'
        : 'border-white bg-white/88 text-[var(--dash-accent)] shadow-sm shadow-blue-100/70',
    },
  };

  return base[sidebar] || base.default;
}

export default BarraLateral;
