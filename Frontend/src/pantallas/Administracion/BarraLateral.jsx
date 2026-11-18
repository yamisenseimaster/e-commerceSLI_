import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MorphIcon } from 'morphicons/react';
import { Bell, Calendar, FileText, Lock, LogOut, Menu, MessageCircle, Moon, ShoppingBag, Store, Sun, User, Users } from 'lucide';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { usarAjustesTema } from '../../Contextos/ContextoTema';
import { apiPedidos } from '../../servicios/api';
const ORIGEN_API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
function BarraLateral({
  children: hijos,
  title: titulo = 'Tienda',
  eyebrow: epigrafe = 'Paneles'
}) {
  const {
    user: usuario,
    cerrarSesion: cerrarSesion
  } = usarAutenticacion();
  const {
    theme: tema,
    establecerModo: establecerModo
  } = usarAjustesTema();
  const navegar = useNavigate();
  const [barraLateralContraido, establecerBarraLateralContraido] = useState(false);
  const [barraLateralMovilAbierta, establecerMovilBarraLateralAbrir] = useState(false);
  const [desplegableActivo, establecerActivoDesplegable] = useState(null);
  const [sistemaNotificaciones, establecerSistemaNotificaciones] = useState([]);
  const referenciaBarraSuperior = useRef(null);
  const esOscuro = tema.mode === 'dark';
  useEffect(() => {
    const cerrarDesplegable = evento => {
      if (!referenciaBarraSuperior.current?.contains(evento.target)) {
        establecerActivoDesplegable(null);
      }
    };
    document.addEventListener('mousedown', cerrarDesplegable);
    return () => {
      document.removeEventListener('mousedown', cerrarDesplegable);
    };
  }, []);
  useEffect(() => {
    let montado = true;
    const cargarNotificaciones = async () => {
      if (!usuario) return;
      try {
        const pedidos = await apiPedidos.listar();
        if (!montado) return;
        establecerSistemaNotificaciones(pedidos.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(pedido => ({
          id: pedido.id,
          title: pedido.status === 'Pending' ? 'Pedido pendiente' : `Pedido ${traducirPedidoEstado(pedido.status)}`,
          message: `Pedido #${cortoId(pedido.id)} por $${Number(pedido.total || 0).toLocaleString('es-AR')}`,
          time: haceHoras(pedido.createdAt),
          icon: pedido.status === 'Pending' ? Bell : ShoppingBag,
          color: pedido.status === 'Pending' ? '#f34b7e' : '#306fd6',
          path: '/orders'
        })));
      } catch {
        if (!montado) return;
        establecerSistemaNotificaciones([]);
      }
    };
    cargarNotificaciones();
    const temporizador = window.setInterval(cargarNotificaciones, 30000);
    return () => {
      montado = false;
      window.clearInterval(temporizador);
    };
  }, [usuario]);
  const pendienteNotificaciones = useMemo(() => sistemaNotificaciones.filter(elemento => elemento.title.toLowerCase().includes('pendiente')).length, [sistemaNotificaciones]);
  const alternarDesplegable = nombre => {
    establecerActivoDesplegable(actual => actual === nombre ? null : nombre);
  };
  const visibleGrupos = useMemo(() => {
    const administracionGrupos = [{
      title: 'Paneles',
      items: [{
        name: 'Dashboard',
        link: '/dashboard',
        icon: ShoppingBag
      }]
    }, {
      title: 'Aplicaciones',
      items: [{
        name: 'Calendario',
        link: '/calendar',
        icon: Calendar
      }, {
        name: 'Productos',
        link: '/admin/products',
        icon: Store
      }, {
        name: 'Clientes CRM',
        link: '/customers',
        icon: Users
      }, {
        name: 'Lista de pedidos',
        link: '/orders',
        icon: FileText
      }, {
        name: 'Chat',
        link: '/chat',
        icon: MessageCircle
      }]
    }, {
      title: 'Paginas',
      items: [{
        name: 'Mi perfil',
        link: '/profile',
        icon: User
      }, {
        name: 'Cambiar contrasena',
        link: '/password',
        icon: Lock
      }]
    }];
    const clienteGrupos = [{
      title: 'Area de cliente',
      items: [{
        name: 'Mi perfil',
        link: '/profile',
        icon: User
      }, {
        name: 'Lista de pedidos',
        link: '/orders',
        icon: FileText
      }, {
        name: 'Chat',
        link: '/chat',
        icon: MessageCircle
      }, {
        name: 'Cambiar contrasena',
        link: '/password',
        icon: Lock
      }]
    }];
    return usuario?.role === 'admin' ? administracionGrupos : clienteGrupos;
  }, [usuario?.role]);
  const claseContenedor = esOscuro ? 'bg-[#141414] text-slate-100' : 'bg-[#f5f7fb] text-[#29364a]';
  const panelClase = esOscuro ? 'border-[#2a2a2a] bg-[#171717]' : 'border-[#d9e0ea] bg-white';
  const barraLateralPaleta = obtenerBarraLateralPaleta(tema.sidebar, esOscuro);
  const barraLateralClase = barraLateralPaleta.shell;
  const navegacionBase = 'group flex h-10 items-center gap-2.5 rounded-[10px] border px-3 text-[15px] font-semibold transition';
  const navegacionInactiva = barraLateralPaleta.navInactive;
  const navegacionActivo = barraLateralPaleta.navActive;
  const IconoBoton = ({
    children: hijos,
    label: etiqueta,
    onClick: alHacerClic,
    active: activo,
    badge: insignia
  }) => <button type="button" aria-label={etiqueta} title={etiqueta} onClick={alHacerClic} className={`relative flex h-9 w-9 items-center justify-center rounded-[10px] border text-[15px] transition sm:h-8 sm:w-8 ${activo ? 'border-[var(--dash-accent)] bg-blue-50 text-[var(--dash-accent)] dark:bg-[#252525]' : esOscuro ? 'border-[#303030] bg-[#191919] text-[#cbd5e1] hover:border-[var(--dash-accent)] hover:text-white' : 'border-[#d9e0ea] bg-white text-[#7b8798] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]'}`}>
    
      {hijos}
      {insignia && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#f34b7e] dark:border-slate-950" />}
    </button>;
  return <>
      <ToastContainer position="top-center" autoClose={2100} className="app-toast-container" toastClassName="app-toast" bodyClassName="app-toast-body" progressClassName="app-toast-progress" newestOnTop closeOnClick pauseOnFocusLoss={false} draggable pauseOnHover limit={2} theme={esOscuro ? 'dark' : 'light'} />
      

      <div className={`dashboard-shell min-h-screen text-[16px] ${claseContenedor}`}>
        {barraLateralMovilAbierta && <button type="button" aria-label="Cerrar menu" className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-[2px] lg:hidden" onClick={() => establecerMovilBarraLateralAbrir(false)} />}
        <aside className={`fixed left-0 top-0 z-40 block h-dvh w-[min(88vw,264px)] border-r transition-transform duration-300 ease-out lg:h-screen lg:w-[236px] ${barraLateralMovilAbierta ? 'translate-x-0' : '-translate-x-full'} ${barraLateralContraido ? 'lg:-translate-x-full' : 'lg:translate-x-0'} ${barraLateralClase}`}>
          
          <div className="flex h-full flex-col">
            <Link to="/dashboard" className={`flex h-[62px] items-center px-8 ${barraLateralPaleta.divider}`}>
              <span className={`font-display text-[27px] font-black tracking-normal ${barraLateralPaleta.logoText}`}>
                Re<span className="text-[var(--dash-accent)]">Play</span>
              </span>
            </Link>

            <div className="scrollbar-invisible flex-1 overflow-y-auto px-3.5 py-4">
              {visibleGrupos.map(grupo => <div key={grupo.title} className="mb-4">
                  <p className={`mb-2 px-1.5 text-[13px] font-bold uppercase tracking-wide ${barraLateralPaleta.groupTitle}`}>
                    {grupo.title}
                  </p>
                  <nav className="flex flex-col gap-1">
                    {grupo.items.map(elemento => <NavLink key={`${grupo.title}-${elemento.name}`} to={elemento.link} onClick={() => establecerMovilBarraLateralAbrir(false)} className={({
                  isActive: esActivo
                }) => `${navegacionBase} ${esActivo ? navegacionActivo : navegacionInactiva}`}>
                    
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.08] text-[16px] transition group-hover:bg-white/[0.14]">
                          <PanelAdministracionMorphIcono icon={elemento.icon} />
                        </span>
                        <span className="truncate">{elemento.name}</span>
                      </NavLink>)}
                  </nav>
                </div>)}
            </div>

            <div className={`border-t p-3.5 ${barraLateralPaleta.footer}`}>
              <button type="button" onClick={() => {
              cerrarSesion();
              navegar('/');
            }} className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-flash px-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-red-600">
                
                <PanelAdministracionMorphIcono icon={LogOut} />
                <span>Cerrar sesion</span>
              </button>
            </div>
          </div>
        </aside>

        <div className={`min-w-0 transition-[padding] duration-300 ease-out ${barraLateralContraido ? 'lg:pl-0' : 'lg:pl-[236px]'}`}>
          <header className={`sticky top-0 z-20 flex h-[58px] items-center justify-between gap-2 border-b px-3 sm:h-[60px] sm:px-5 ${panelClase}`}>
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#29364a] transition hover:bg-[#f3f7ff] dark:text-slate-200 dark:hover:bg-[#242424] sm:h-8 sm:w-8" aria-label={barraLateralContraido ? 'Mostrar menu' : 'Ocultar menu'} title={barraLateralContraido ? 'Mostrar menu' : 'Ocultar menu'} onClick={() => {
              if (window.innerWidth < 1024) {
                establecerMovilBarraLateralAbrir(true);
                return;
              }
              establecerBarraLateralContraido(actual => !actual);
            }}>
                
                <PanelAdministracionMorphIcono icon={Menu} className="text-[19px]" />
              </button>
            </div>

            <div ref={referenciaBarraSuperior} className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
              <IconoBoton label={esOscuro ? 'Modo claro' : 'Modo oscuro'} onClick={() => establecerModo(esOscuro ? 'light' : 'dark')}>
                <PanelAdministracionMorphIcono icon={esOscuro ? Sun : Moon} />
              </IconoBoton>
              <div className="relative hidden sm:block">
                <IconoBoton label="Notificaciones" onClick={() => alternarDesplegable('notifications')} active={desplegableActivo === 'notifications'} badge={pendienteNotificaciones > 0}>
                  <PanelAdministracionMorphIcono icon={Bell} />
                </IconoBoton>
                {desplegableActivo === 'notifications' && <DesplegableBarraSuperior className="right-0 w-[255px]" isDark={esOscuro}>
                    <TituloDesplegable title={`Notificaciones${pendienteNotificaciones ? ` (${pendienteNotificaciones})` : ''}`} />
                    <div className="space-y-1.5">
                      {sistemaNotificaciones.length ? sistemaNotificaciones.map(elemento => <NotificacionFila key={elemento.id} item={elemento} isDark={esOscuro} onClick={() => {
                    establecerActivoDesplegable(null);
                    navegar(elemento.path);
                  }} />) : <VacioDesplegable text="No hay notificaciones recientes." />}
                    </div>
                    <button type="button" onClick={() => {
                  establecerActivoDesplegable(null);
                  navegar('/orders');
                }} className="mt-2 h-7 w-full rounded-[4px] border border-[var(--dash-accent)] bg-blue-50 text-[11px] font-semibold text-[var(--dash-accent)] dark:bg-slate-800">
                    
                      Ver todas las notificaciones
                    </button>
                  </DesplegableBarraSuperior>}
              </div>
              <div className="ml-1 hidden text-right sm:block">
                <p className="text-[15px] font-bold leading-5 text-[#1f2937] dark:text-white">{usuario?.name || 'Administrador'}</p>
                <p className="text-[13px] capitalize leading-4 text-[#8b96a8]">{usuario?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--dash-accent)] text-[13px] font-bold text-white shadow-lg shadow-emerald-300/30">
                {usuario?.avatar ? <img src={`${ORIGEN_API}${usuario.avatar}`} alt="Foto de perfil" className="h-full w-full object-cover" /> : usuario?.name?.slice(0, 1) || 'A'}
              </div>
            </div>
          </header>

          <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#9aa6b8]">{epigrafe}</p>
                <h1 className="font-display mt-1 truncate text-[24px] font-black leading-8 text-[#263b60] dark:text-white sm:text-[28px]">{titulo}</h1>
              </div>
              <div className="hidden text-[14px] font-medium text-[#8b96a8] dark:text-[#7c8594] sm:block">
                Tienda / <span className="font-semibold text-[var(--dash-accent)]">{titulo}</span>
              </div>
            </div>

            {hijos}
          </main>
        </div>

      </div>
    </>;
}
function PanelAdministracionMorphIcono({
  icon: icono,
  className: nombreClase = '',
  label: etiqueta,
  size: tamano = '1em'
}) {
  return <MorphIcon icon={icono} size={tamano} strokeWidth={2.15} reducedMotion="user" className={`inline-block shrink-0 align-[-0.125em] ${nombreClase}`} label={etiqueta} />;
}
function DesplegableBarraSuperior({
  children: hijos,
  className: nombreClase,
  isDark: esOscuro
}) {
  return <div className={`absolute top-[36px] z-50 max-w-[calc(100vw-1.5rem)] rounded-[4px] border p-1.5 shadow-xl ${esOscuro ? 'border-slate-700 bg-slate-900 shadow-slate-950/40' : 'border-[#cfd8e6] bg-white shadow-slate-200/90'} ${nombreClase}`}>
      
      {hijos}
    </div>;
}
function TituloDesplegable({
  title: titulo
}) {
  return <div className="mb-1 flex items-center justify-between px-1 py-1">
      <h3 className="text-[12px] font-bold text-[#2a3951] dark:text-white">{titulo}</h3>
    </div>;
}
function NotificacionFila({
  item: elemento,
  isDark: esOscuro,
  onClick: alHacerClic
}) {
  return <button type="button" onClick={alHacerClic} className={`flex w-full items-start gap-2 rounded-[4px] border p-2 text-left transition ${esOscuro ? 'border-slate-700 bg-slate-950 hover:bg-slate-800' : 'border-[#d9e0ea] bg-white hover:bg-[#f6f9ff]'}`}>
      
      {elemento.avatar ? <img src={elemento.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border text-[15px]" style={{
      borderColor: elemento.color,
      color: elemento.color,
      backgroundColor: `${elemento.color}12`
    }}>
        
          <PanelAdministracionMorphIcono icon={elemento.icon || Bell} />
        </span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <strong className="truncate text-[11px] text-[#2a3951] dark:text-white">{elemento.title || elemento.name}</strong>
          <span className="shrink-0 text-[9px] text-[#7b8798]">{elemento.time}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[10px] leading-4 text-[#7b8798]">{elemento.message}</span>
        {elemento.unread > 0 && <span className="mt-1 inline-flex rounded-full bg-[#f34b7e] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {elemento.unread} nuevo{elemento.unread > 1 ? 's' : ''}
          </span>}
      </span>
    </button>;
}
function VacioDesplegable({
  text: texto
}) {
  return <div className="rounded-[4px] border border-dashed border-[#d9e0ea] px-3 py-5 text-center text-[11px] font-semibold text-[#7b8798] dark:border-slate-700">
      {texto}
    </div>;
}
function cortoId(id) {
  return String(id || '').slice(0, 8).toUpperCase();
}
function traducirPedidoEstado(estado) {
  const mapa = {
    Pending: 'pendiente',
    Processing: 'en proceso',
    Complete: 'completado',
    Completed: 'completado',
    Canceled: 'cancelado',
    Cancelled: 'cancelado',
    Shipped: 'enviado',
    Delivered: 'entregado'
  };
  return mapa[estado] || String(estado || 'actualizado').toLowerCase();
}
function haceHoras(valor) {
  if (!valor) return '';
  const diferencia = Date.now() - new Date(valor).getTime();
  const minutos = Math.max(0, Math.floor(diferencia / 60000));
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias}d`;
  return new Date(valor).toLocaleDateString('es-ES');
}
function obtenerBarraLateralPaleta(barraLateral, esOscuro) {
  const base = {
    default: {
      shell: esOscuro ? 'border-[#2a2a2a] bg-[#151515]' : 'border-[#d9e0ea] bg-white',
      divider: esOscuro ? 'border-[#2a2a2a]' : 'border-[#d9e0ea]',
      footer: esOscuro ? 'border-[#2a2a2a]' : 'border-[#d9e0ea]',
      groupTitle: 'text-[#a2adbd]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro ? 'border-transparent text-[#9ca3af] hover:border-[#2f2f2f] hover:bg-[#202020] hover:text-white' : 'border-transparent text-[#64748b] hover:border-[#c7d7f6] hover:bg-[#f3f7ff] hover:text-[var(--dash-accent)]',
      navActive: esOscuro ? 'border-[#303030] bg-[#252525] text-white shadow-none' : 'border-[var(--dash-accent)] bg-[#eef5ff] text-[var(--dash-accent)] shadow-sm shadow-blue-100/70'
    },
    dark: {
      shell: 'border-[#242424] bg-[#111111] text-white shadow-[12px_0_40px_rgba(0,0,0,0.28)]',
      divider: 'border-[#242424]',
      footer: 'border-[#242424]',
      groupTitle: 'text-[#8b949e]',
      logoText: 'text-white',
      navInactive: 'border-transparent text-[#aeb7c5] hover:border-white/[0.08] hover:bg-white/[0.07] hover:text-white',
      navActive: 'border-white/[0.10] bg-white/[0.10] text-white shadow-none'
    },
    primary: {
      shell: esOscuro ? 'border-[#214073] bg-[#10213d] text-white shadow-[12px_0_40px_rgba(12,34,66,0.28)]' : 'border-[#bdd6ff] bg-[#eaf3ff] text-[#162033] shadow-[12px_0_34px_rgba(48,111,214,0.12)]',
      divider: esOscuro ? 'border-[#244b85]' : 'border-[#c9dcfb]',
      footer: esOscuro ? 'border-[#244b85]' : 'border-[#c9dcfb]',
      groupTitle: esOscuro ? 'text-[#99b9f2]' : 'text-[#6683ad]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro ? 'border-transparent text-[#c3d8ff] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white' : 'border-transparent text-[#536174] hover:border-[var(--dash-accent)] hover:bg-white/70 hover:text-[var(--dash-accent)]',
      navActive: esOscuro ? 'border-white/[0.14] bg-white/[0.12] text-white shadow-none' : 'border-[var(--dash-accent)] bg-white text-[var(--dash-accent)] shadow-sm shadow-blue-100/80'
    },
    gradient: {
      shell: esOscuro ? 'border-[#243247] bg-[radial-gradient(circle_at_top_left,rgba(48,111,214,0.28),transparent_34%),linear-gradient(160deg,#111827_0%,#171717_55%,#0f172a_100%)] text-white shadow-[12px_0_42px_rgba(2,6,23,0.34)]' : 'border-[#cbdaf1] bg-[radial-gradient(circle_at_top_left,rgba(48,111,214,0.18),transparent_34%),linear-gradient(160deg,#ffffff_0%,#f3f7ff_54%,#eefbf8_100%)] text-[#162033] shadow-[12px_0_34px_rgba(48,111,214,0.11)]',
      divider: esOscuro ? 'border-white/[0.08]' : 'border-white/70',
      footer: esOscuro ? 'border-white/[0.08]' : 'border-white/70',
      groupTitle: esOscuro ? 'text-[#93a4bd]' : 'text-[#75859b]',
      logoText: esOscuro ? 'text-white' : 'text-[#162033]',
      navInactive: esOscuro ? 'border-transparent text-[#cbd5e1] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white' : 'border-transparent text-[#526176] hover:border-white hover:bg-white/72 hover:text-[var(--dash-accent)]',
      navActive: esOscuro ? 'border-white/[0.14] bg-white/[0.12] text-white shadow-none' : 'border-white bg-white/88 text-[var(--dash-accent)] shadow-sm shadow-blue-100/70'
    }
  };
  return base[barraLateral] || base.default;
}
export default BarraLateral;
