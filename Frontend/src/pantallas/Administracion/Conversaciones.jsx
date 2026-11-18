import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheck, FiFileText, FiImage, FiMessageCircle, FiMoreVertical, FiPaperclip, FiPlus, FiRefreshCw, FiSearch, FiSend, FiSmile, FiTrash2, FiX } from 'react-icons/fi';
import BarraLateral from './BarraLateral';
import { apiAdministracion as administracionApi, apiConversaciones } from '../../servicios/api';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
const rapidoRespuestas = ['Hola, gracias por escribirnos. En que puedo ayudarte?', 'Tu pedido ya esta siendo revisado por nuestro equipo.', 'Perfecto, te confirmo la informacion en unos minutos.'];
const opcionesEmoji = ['😀', '😊', '👍', '🙏', '❤️', '🔥', '🎉', '✅', '📦', '💬', '💵', '🚚'];
const ORIGEN_API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
function Conversaciones() {
  const {
    user: usuario
  } = usarAutenticacion();
  const [conversaciones, establecerConversaciones] = useState([]);
  const [clientes, establecerClientes] = useState([]);
  const [idActivo, establecerIdActivo] = useState('');
  const [mensajes, establecerMensajes] = useState([]);
  const [consulta, establecerConsulta] = useState('');
  const [mensaje, establecerMensaje] = useState('');
  const [cargando, establecerCargando] = useState(true);
  const [mensajesCargando, establecerMensajesCargando] = useState(false);
  const [enviando, establecerEnviando] = useState(false);
  const [creando, establecerCreando] = useState(false);
  const [chatEstado, establecerEstadoChat] = useState({
    mode: 'internal'
  });
  const [nuevoContacto, establecerNuevoContacto] = useState({
    customerId: ''
  });
  const [contactoModalAbrir, establecerContactoModalAbrir] = useState(false);
  const [eliminarModalAbrir, establecerEliminarModalAbrir] = useState(false);
  const [movilChatAbrir, establecerMovilChatAbrir] = useState(false);
  const [emojiAbrir, establecerEmojiAbrir] = useState(false);
  const [pendienteAdjunto, establecerPendienteAdjunto] = useState(null);
  const imagenEntradaReferencia = useRef(null);
  const documentoEntradaReferencia = useRef(null);
  const mensajesFinReferencia = useRef(null);
  const conversacionActiva = conversaciones.find(conversacion => conversacion.id === idActivo) || conversaciones[0];
  const cargarConversaciones = async (siguienteIdActivo = idActivo) => {
    const datos = await apiConversaciones.conversations(consulta);
    establecerConversaciones(datos);
    const destino = siguienteIdActivo || datos[0]?.id || '';
    establecerIdActivo(datos.some(conversacion => conversacion.id === destino) ? destino : datos[0]?.id || '');
    return datos;
  };
  useEffect(() => {
    establecerCargando(true);
    Promise.all([cargarConversaciones(), apiConversaciones.status()]).then(([, estado]) => establecerEstadoChat(estado)).catch(error => toast.error(error.message || 'No se pudo cargar el chat')).finally(() => establecerCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (usuario?.role !== 'admin') return;
    administracionApi.customers().then(datos => establecerClientes(datos.filter(cliente => cliente.role !== 'admin'))).catch(() => establecerClientes([]));
  }, [usuario?.role]);
  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargarConversaciones(idActivo).catch(() => {});
    }, 250);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta]);
  useEffect(() => {
    if (!conversacionActiva?.id) {
      establecerMensajes([]);
      return;
    }
    establecerMensajesCargando(true);
    Promise.all([apiConversaciones.messages(conversacionActiva.id), conversacionActiva.unread > 0 ? apiConversaciones.marcarLeidos(conversacionActiva.id) : Promise.resolve(null)]).then(([datos]) => {
      establecerMensajes(datos);
      if (conversacionActiva.unread > 0) {
        establecerConversaciones(actual => actual.map(conversacion => conversacion.id === conversacionActiva.id ? {
          ...conversacion,
          unread: 0
        } : conversacion));
      }
    }).catch(error => toast.error(error.message || 'No se pudieron cargar los mensajes')).finally(() => establecerMensajesCargando(false));
  }, [conversacionActiva?.id]);
  useEffect(() => {
    let activo = true;
    const temporizador = setInterval(async () => {
      try {
        const lista = await apiConversaciones.conversations(consulta);
        if (activo) establecerConversaciones(lista);
        if (conversacionActiva?.id) {
          const reciente = await apiConversaciones.messages(conversacionActiva.id);
          if (activo) establecerMensajes(reciente);
        }
      } catch {

        // Keep the current messages visible until the next successful refresh.
      }
    }, 5000);
    return () => {
      activo = false;
      clearInterval(temporizador);
    };
  }, [conversacionActiva?.id, consulta]);
  useEffect(() => {
    mensajesFinReferencia.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [mensajes.length, conversacionActiva?.id]);
  const totalSinLeer = useMemo(() => conversaciones.reduce((suma, conversacion) => suma + Number(conversacion.unread || 0), 0), [conversaciones]);
  const manejarEnviar = async (evento, preestablecidoTexto) => {
    evento?.preventDefault();
    const texto = (preestablecidoTexto || mensaje).trim();
    if (!texto && !pendienteAdjunto || !conversacionActiva) return;
    establecerEnviando(true);
    try {
      const creado = pendienteAdjunto ? await apiConversaciones.enviarArchivo(conversacionActiva.id, {
        caption: texto || pendienteAdjunto.fileName,
        dataUrl: pendienteAdjunto.dataUrl,
        fileName: pendienteAdjunto.fileName,
        mimeType: pendienteAdjunto.mimeType,
        type: pendienteAdjunto.type
      }) : await apiConversaciones.enviarMensaje(conversacionActiva.id, {
        text: texto,
        type: 'text'
      });
      establecerMensajes(actual => [...actual, creado]);
      establecerMensaje('');
      establecerPendienteAdjunto(null);
      establecerEmojiAbrir(false);
      await cargarConversaciones(conversacionActiva.id);
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar el mensaje');
    } finally {
      establecerEnviando(false);
    }
  };
  const manejarAdjuntarArchivo = async (evento, tipo) => {
    if (!conversacionActiva) return;
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    const esImagen = tipo === 'image' && archivo.type.startsWith('image/');
    const esPdf = tipo === 'document' && archivo.type === 'application/pdf';
    if (!esImagen && !esPdf) {
      toast.error(tipo === 'image' ? 'Selecciona una imagen valida' : 'Selecciona un PDF valido');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('El archivo no puede superar 5MB');
      return;
    }
    establecerEnviando(true);
    try {
      const urlDatos = await leerArchivoComoUrlDatos(archivo);
      establecerPendienteAdjunto({
        dataUrl: urlDatos,
        fileName: archivo.name,
        mimeType: archivo.type,
        type: tipo
      });
      toast.info(tipo === 'image' ? 'Imagen lista para enviar' : 'PDF listo para enviar');
    } catch (error) {
      toast.error(error.message || 'No se pudo preparar el archivo');
    } finally {
      establecerEnviando(false);
    }
  };
  const manejarEliminarConversacion = async () => {
    if (!conversacionActiva) return;
    establecerEnviando(true);
    try {
      await apiConversaciones.eliminarConversacion(conversacionActiva.id);
      establecerEliminarModalAbrir(false);
      establecerMovilChatAbrir(false);
      establecerMensajes([]);
      await cargarConversaciones('');
      toast.success('Chat eliminado');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el chat');
    } finally {
      establecerEnviando(false);
    }
  };
  const manejarSimularEntrante = async () => {
    if (usuario?.role !== 'admin') return;
    if (!conversacionActiva) return;
    try {
      const creado = await apiConversaciones.simulateIncoming(conversacionActiva.id, {
        text: 'Gracias, quedo atento a tu respuesta.',
        type: 'text'
      });
      establecerMensajes(actual => [...actual, creado]);
      await cargarConversaciones(conversacionActiva.id);
      toast.success('Mensaje entrante recibido');
    } catch (error) {
      toast.error(error.message || 'No se pudo simular el mensaje');
    }
  };
  const manejarCrearConversacion = async evento => {
    evento.preventDefault();
    if (usuario?.role === 'admin' && !nuevoContacto.customerId) return;
    establecerCreando(true);
    try {
      const creado = await apiConversaciones.crearConversacion({
        customerId: nuevoContacto.customerId
      });
      establecerNuevoContacto({
        customerId: ''
      });
      establecerContactoModalAbrir(false);
      await cargarConversaciones(creado.id);
      establecerMovilChatAbrir(true);
      toast.success('Chat creado');
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el chat');
    } finally {
      establecerCreando(false);
    }
  };
  return <BarraLateral title="Chat" eyebrow="Aplicaciones">
      <section className="h-[calc(100dvh-118px)] min-h-[540px] overflow-hidden rounded-[18px] border border-[#d9e0ea] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101214] dark:shadow-black/30 sm:h-[calc(100dvh-132px)] xl:min-h-[640px]">
        <div className="h-full min-h-0 xl:grid xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className={`${movilChatAbrir ? 'hidden xl:flex' : 'flex'} h-full min-h-0 flex-col border-r border-[#e4eaf2] bg-[#fbfcff] dark:border-white/[0.08] dark:bg-[#141719]`}>
            <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#e4eaf2] bg-gradient-to-r from-[#effaf6] to-white px-4 dark:border-white/[0.08] dark:from-[#16231f] dark:to-[#141719]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#00a884] text-xl text-white shadow-[0_12px_25px_rgba(0,168,132,0.24)]">
                  <FiMessageCircle />
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[#162033] dark:text-white">Chat interno</h2>
                  <p className="text-[13px] font-semibold text-[#667781] dark:text-[#9ca3af]">
                    {chatEstado.mode === 'internal' ? 'Mensajeria de la tienda' : 'Chat'} · {totalSinLeer} sin leer
                  </p>
                </div>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#00a884] shadow-sm ring-1 ring-[#dceee8] transition hover:-rotate-45 hover:bg-[#e7f7f2] dark:bg-white/[0.08] dark:ring-white/[0.08]" type="button" onClick={() => cargarConversaciones(idActivo)} title="Actualizar">
                
                <FiRefreshCw />
              </button>
            </div>

            <div className="shrink-0 space-y-3 border-b border-[#edf1f6] p-4 dark:border-white/[0.08]">
              <label className="flex h-12 items-center gap-3 rounded-[14px] border-0 bg-[#f3f5f7] px-3.5 text-[#7d8794] dark:bg-[#202020] dark:text-[#9ca3af]">
                <FiSearch className="shrink-0" />
                <input value={consulta} onChange={evento => establecerConsulta(evento.target.value)} className="buscador-chat h-full min-w-0 w-full border-0 bg-transparent px-0 text-[15px] font-medium shadow-none outline-none ring-0 placeholder:text-[#7d8794] focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 dark:text-[#e5e7eb]" placeholder="Buscar o iniciar chat" />
                
                {consulta && <button type="button" onClick={() => establecerConsulta('')} className="text-[#8b96a8]">
                    <FiX />
                  </button>}
              </label>

              {usuario?.role === 'admin' && <button type="button" onClick={() => establecerContactoModalAbrir(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#00a884] text-[14px] font-black text-white shadow-[0_14px_28px_rgba(0,168,132,0.20)] transition hover:bg-[#029674]">
                
                  <FiPlus /> Agregar cliente registrado
                </button>}
              {usuario?.role !== 'admin' && <button type="button" disabled={creando} onClick={manejarCrearConversacion} className="h-12 w-full rounded-[14px] bg-[#00a884] font-bold text-white disabled:opacity-50">
                  {creando ? 'Creando...' : 'Consultar con la tienda'}
                </button>}

              <div className="grid grid-cols-1 gap-2 text-[12px] font-bold">
                <button className="h-10 rounded-[13px] bg-[#e7f7f2] text-[14px] text-[#008069] dark:bg-white/[0.08] dark:text-[#6ee7c7]" type="button">Chats</button>
              </div>
            </div>

            <div className="scrollbar-invisible min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {cargando && <p className="px-2 py-3 text-[14px] font-semibold text-[#7b8798]">Cargando chats...</p>}
              {!cargando && conversaciones.length === 0 && <p className="rounded-[14px] border border-dashed border-[#d9e0ea] px-4 py-8 text-center text-[14px] font-semibold text-[#7b8798] dark:border-white/[0.08]">No hay conversaciones.</p>}
              {conversaciones.map(conversacion => <button key={conversacion.id} type="button" onClick={() => {
              establecerIdActivo(conversacion.id);
              establecerMovilChatAbrir(true);
            }} className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition ${conversacionActiva?.id === conversacion.id ? 'border-[#b9eadb] bg-[#e8f5f1] shadow-sm dark:border-[#1e5f52] dark:bg-[#12302a]' : 'border-transparent bg-white hover:border-[#e4eaf2] hover:bg-[#f8fbff] dark:bg-white/[0.04] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.07]'}`}>
                
                  <span className="relative shrink-0">
                    <img src={conversacion.avatar || '/images/categories/1.png'} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-[#d9e0ea]" />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00a884] dark:border-slate-900" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <strong className="truncate text-[15px] font-black text-[#1f2c34] dark:text-white">{conversacion.name}</strong>
                      <span className="shrink-0 text-[12px] font-semibold text-[#7b8798]">{formatearHora(conversacion.lastMessageAt)}</span>
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-[#7b8798]">{conversacion.lastMessage || 'Sin mensajes'}</span>
                      {conversacion.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-main px-1.5 text-[10px] font-bold text-white">
                          {conversacion.unread}
                        </span>}
                    </span>
                  </span>
                </button>)}
            </div>
          </aside>

          <div className={`${movilChatAbrir ? 'flex' : 'hidden xl:flex'} h-full min-h-0 min-w-0 flex-col bg-[#f3f5f2] dark:bg-[#0d0f10]`}>
            {conversacionActiva ? <>
                <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#e4eaf2] bg-white/85 px-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141719]/90 sm:px-5">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => establecerMovilChatAbrir(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#526176] transition hover:bg-[#edf1f6] dark:text-slate-300 dark:hover:bg-slate-800 xl:hidden" aria-label="Volver a chats" title="Volver a chats">
                    
                      <FiArrowLeft />
                    </button>
                    <span className="relative">
                      <img src={conversacionActiva.avatar || '/images/categories/1.png'} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md dark:ring-white/[0.10]" />
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00a884] dark:border-slate-900" />
                    </span>
                    <div>
                      <h3 className="text-[18px] font-black text-[#162033] dark:text-white">{conversacionActiva.name}</h3>
                      <p className="text-[13px] font-semibold text-[#00a884]">{conversacionActiva.email || 'Cliente registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#526176] dark:text-slate-300">
                    {usuario?.role === 'admin' && <>
                        <button className="flex h-10 w-10 items-center justify-center rounded-[12px] hover:bg-[#f3f7ff] dark:hover:bg-white/[0.08]" type="button" title="Simular respuesta" onClick={manejarSimularEntrante}>
                          <FiMoreVertical />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[#f34b7e] hover:bg-[#fff0f5] dark:hover:bg-white/[0.08]" type="button" title="Eliminar chat" onClick={() => establecerEliminarModalAbrir(true)}>
                          <FiTrash2 />
                        </button>
                      </>}
                  </div>
                </header>

                <div className="scrollbar-invisible flex-1 space-y-3 overflow-y-auto px-3 py-5 sm:px-7 sm:py-6" style={{
              backgroundImage: 'radial-gradient(circle at 16% 16%, rgba(0,168,132,0.08), transparent 28%), radial-gradient(circle at 84% 18%, rgba(47,111,219,0.08), transparent 26%)'
            }}>
                
                  {mensajesCargando && <p className="text-[14px] font-semibold text-[#7b8798]">Cargando mensajes...</p>}
                  {!mensajesCargando && mensajes.length === 0 && <div className="mx-auto mt-10 max-w-sm rounded-[20px] bg-white/80 p-5 text-center shadow-sm ring-1 ring-[#e4eaf2] backdrop-blur dark:bg-white/[0.06] dark:ring-white/[0.08]">
                      <FiMessageCircle className="mx-auto mb-3 text-3xl text-main" />
                      <p className="text-[15px] font-black text-[#26344a] dark:text-white">No hay mensajes todavia</p>
                      <p className="mt-1 text-[13px] font-medium text-[#7b8798]">Escribe abajo para iniciar la conversacion.</p>
                    </div>}
                  {mensajes.map(elemento => <BurbujaMensaje key={elemento.id} item={elemento} viewerRole={usuario?.role} />)}
                  <div ref={mensajesFinReferencia} />
                </div>

                <div className="shrink-0 border-t border-[#e4eaf2] bg-white/90 px-3 pt-3 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141719]/95">
                  {pendienteAdjunto && <div className="mb-3 flex items-center justify-between gap-3 rounded-[8px] border border-[#d9e0ea] bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                      <div className="flex min-w-0 items-center gap-3">
                        {pendienteAdjunto.type === 'image' ? <img src={pendienteAdjunto.dataUrl} alt="" className="h-14 w-14 rounded-[6px] object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-[6px] bg-[#fff0f5] text-xl text-[#f34b7e]">
                            <FiFileText />
                          </span>}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-black text-[#162033] dark:text-white">{pendienteAdjunto.fileName}</p>
                          <p className="text-[12px] font-semibold text-[#7b8798]">
                            {pendienteAdjunto.type === 'image' ? 'Imagen lista para enviar' : 'PDF listo para enviar'}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => establecerPendienteAdjunto(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b] hover:text-[#f34b7e]">
                        <FiX />
                      </button>
                    </div>}
                  {usuario?.role === 'admin' && <div className="scrollbar-invisible mb-2 flex gap-2 overflow-x-auto pb-1">
                      {rapidoRespuestas.map(respuesta => <button key={respuesta} type="button" onClick={evento => manejarEnviar(evento, respuesta)} className="shrink-0 rounded-full border border-[#d9e0ea] bg-white px-4 py-2 text-[13px] font-bold text-[#526176] shadow-sm transition hover:border-[#00a884] hover:text-[#008069] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#d1d5db]">
                    
                          {respuesta}
                        </button>)}
                    </div>}
                  <form onSubmit={manejarEnviar} className="flex min-w-0 items-center gap-2 pb-3">
                    <input ref={imagenEntradaReferencia} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={evento => manejarAdjuntarArchivo(evento, 'image')} />
                  
                    <input ref={documentoEntradaReferencia} type="file" accept="application/pdf" className="hidden" onChange={evento => manejarAdjuntarArchivo(evento, 'document')} />
                  
                    <button type="button" onClick={() => documentoEntradaReferencia.current?.click()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#54656f] shadow-sm ring-1 ring-[#e4eaf2] transition hover:text-main dark:bg-white/[0.06] dark:ring-white/[0.08] sm:h-12 sm:w-12" title="Enviar PDF">
                      <FiPaperclip />
                    </button>
                    <button type="button" onClick={() => imagenEntradaReferencia.current?.click()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#54656f] shadow-sm ring-1 ring-[#e4eaf2] transition hover:text-main dark:bg-white/[0.06] dark:ring-white/[0.08] sm:h-12 sm:w-12" title="Enviar imagen">
                      <FiImage />
                    </button>
                    <div className="relative">
                      <button type="button" onClick={() => establecerEmojiAbrir(abierto => !abierto)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#54656f] shadow-sm ring-1 ring-[#e4eaf2] transition hover:text-main dark:bg-white/[0.06] dark:ring-white/[0.08] sm:h-12 sm:w-12" title="Emojis">
                        <FiSmile />
                      </button>
                      {emojiAbrir && <div className="absolute bottom-[52px] left-0 z-20 grid w-[220px] grid-cols-6 gap-1 rounded-[8px] border border-[#d9e0ea] bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                          {opcionesEmoji.map(emoji => <button key={emoji} type="button" onClick={() => establecerMensaje(actual => `${actual}${emoji}`)} className="flex h-8 items-center justify-center rounded-[6px] text-lg hover:bg-[#f3f7ff] dark:hover:bg-slate-800">
                        
                              {emoji}
                            </button>)}
                        </div>}
                    </div>
                    <input value={mensaje} onChange={evento => establecerMensaje(evento.target.value)} className="h-11 min-w-0 flex-1 rounded-full border border-[#e4eaf2] bg-white px-4 text-[15px] font-semibold outline-none placeholder:text-[#a9b4c4] focus:border-[#00a884] dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white sm:h-12 sm:px-5" placeholder="Escribe un mensaje" />
                  
                    <button type="submit" disabled={enviando} className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#00a884] text-[14px] font-bold text-white shadow-[0_12px_26px_rgba(0,168,132,0.24)] hover:bg-[#029674] disabled:opacity-60 sm:h-12 sm:w-auto sm:px-5">
                      <FiSend /> <span className="hidden sm:inline">{enviando ? 'Enviando...' : 'Enviar'}</span>
                    </button>
                  </form>
                </div>
              </> : <div className="flex flex-1 flex-col items-center justify-center text-center text-[#7b8798]">
                <FiMessageCircle className="mb-3 text-4xl text-main" />
                <p className="font-bold">Selecciona o crea un chat</p>
              </div>}
          </div>
        </div>
      </section>

      {contactoModalAbrir && <ContactoModal creating={creando} customers={clientes} newContact={nuevoContacto} onClose={() => establecerContactoModalAbrir(false)} onSubmit={manejarCrearConversacion} setNewContact={establecerNuevoContacto} />}
      {eliminarModalAbrir && <EliminarChatModal conversation={conversacionActiva} deleting={enviando} onClose={() => establecerEliminarModalAbrir(false)} onConfirm={manejarEliminarConversacion} />}
    </BarraLateral>;
}
function ContactoModal({
  creating: creando,
  customers: clientes,
  newContact: nuevoContacto,
  onClose: alCerrar,
  onSubmit: alEnviar,
  setNewContact: establecerNuevoContacto
}) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0 cursor-default" onClick={alCerrar} />
      <section className="relative z-[1] w-full max-w-[460px] overflow-hidden rounded-[8px] bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-[#e1e7f0] px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-[20px] font-black text-[#162033] dark:text-white">Agregar contacto</h3>
            <p className="mt-1 text-[13px] font-medium text-[#7b8798]">Selecciona un cliente registrado para abrir su chat.</p>
          </div>
          <button type="button" onClick={alCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b]">
            <FiX />
          </button>
        </header>

        <div className="p-5">
          <form onSubmit={alEnviar} className="grid gap-3">
            <select value={nuevoContacto.customerId} onChange={evento => establecerNuevoContacto({
            customerId: evento.target.value
          })} className="h-11 rounded-[5px] border border-[#d9e0ea] px-3 text-sm font-medium outline-none focus:border-main dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              
              <option value="">Seleccionar cliente registrado</option>
              {clientes.map(cliente => <option key={cliente.id} value={cliente.id}>
                  {cliente.name} - {cliente.email}
                </option>)}
            </select>
            {clientes.length === 0 && <p className="rounded-[5px] bg-[#fff7ed] px-3 py-2 text-[12px] font-semibold text-[#9a3412]">
                No hay clientes registrados disponibles.
              </p>}
            <div className="mt-2 flex justify-end gap-3 border-t border-[#e1e7f0] pt-4 dark:border-slate-800">
              <button type="button" onClick={alCerrar} className="h-10 rounded-[5px] border border-[#d9e0ea] px-4 text-sm font-black text-[#26344a] dark:text-white">
                Cancelar
              </button>
              <button type="submit" disabled={creando} className="flex h-10 items-center gap-2 rounded-[5px] bg-main px-4 text-sm font-black text-white disabled:opacity-60">
                <FiPlus /> {creando ? 'Creando...' : 'Crear chat'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>;
}
function EliminarChatModal({
  conversation: conversacion,
  deleting: eliminando,
  onClose: alCerrar,
  onConfirm: alConfirmar
}) {
  if (!conversacion) return null;
  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0 cursor-default" onClick={alCerrar} />
      <section className="relative z-[1] w-full max-w-[420px] overflow-hidden rounded-[8px] border border-[#d9e0ea] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-[#e1e7f0] px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-[20px] font-black text-[#162033] dark:text-white">Eliminar chat</h3>
            <p className="mt-1 text-[13px] font-medium text-[#7b8798]">Esta accion eliminara la conversacion y sus mensajes.</p>
          </div>
          <button type="button" onClick={alCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b]">
            <FiX />
          </button>
        </header>

        <div className="p-5">
          <div className="rounded-[8px] bg-[#fff0f5] px-4 py-3 text-[13px] font-bold text-[#be123c]">
            Eliminar chat con {conversacion.name}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={alCerrar} className="h-10 rounded-[5px] border border-[#d9e0ea] px-4 text-sm font-black text-[#26344a] dark:text-white">
              Cancelar
            </button>
            <button type="button" disabled={eliminando} onClick={alConfirmar} className="flex h-10 items-center gap-2 rounded-[5px] bg-[#f34b7e] px-4 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60">
              <FiTrash2 /> {eliminando ? 'Eliminando...' : 'Eliminar chat'}
            </button>
          </div>
        </div>
      </section>
    </div>;
}
function BurbujaMensaje({
  item: elemento,
  viewerRole: rolVisor
}) {
  const esMio = rolVisor === 'admin' ? elemento.from === 'admin' : elemento.from === 'client';
  return <div className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-[86%] overflow-hidden rounded-[18px] px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 sm:max-w-[72%] ${esMio ? 'rounded-br-[6px] bg-[#d9fdd3] text-[#111b21] ring-[#bcebc0] dark:bg-[#143a2d] dark:text-emerald-50 dark:ring-white/[0.06]' : 'rounded-bl-[6px] bg-white text-[#111b21] ring-[#e4eaf2] dark:bg-white/[0.07] dark:text-slate-100 dark:ring-white/[0.08]'}`}>
        
        {elemento.attachments?.length > 0 && <div className="mb-2 grid gap-2">
            {elemento.attachments.map(adjunto => <VistaPreviaAdjunto key={adjunto.url || adjunto.id || adjunto.name} attachment={adjunto} />)}
          </div>}
        <p className="whitespace-pre-wrap break-words text-[15px] font-semibold leading-6">{elemento.text}</p>
        <span className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] font-semibold ${esMio ? 'text-[#667781]' : 'text-[#8b96a8]'}`}>
          {formatearHora(elemento.createdAt)}
          {esMio && <FiCheck className="text-[#53bdeb]" />}
        </span>
      </div>
    </div>;
}
function VistaPreviaAdjunto({
  attachment: adjunto
}) {
  if (typeof adjunto === 'string') {
    return <img src={urlMultimedia(adjunto)} alt="" className="h-24 max-w-full rounded-[6px] border border-white/40 object-cover" />;
  }
  if (adjunto.type === 'image' && adjunto.url) {
    return <img src={urlMultimedia(adjunto.url)} alt={adjunto.name || ''} className="max-h-52 max-w-full rounded-[6px] border border-white/40 object-cover" />;
  }
  return <a href={urlMultimedia(adjunto.url || '#')} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[6px] border border-white/40 bg-white/15 p-3 text-current">
      
      <FiFileText className="shrink-0 text-xl" />
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{adjunto.name || 'Documento'}</span>
    </a>;
}
function urlMultimedia(url) {
  if (!url || url === '#') return '#';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${ORIGEN_API}${url.startsWith('/') ? url : `/${url}`}`;
}
function formatearHora(valor) {
  if (!valor) return '';
  return new Date(valor).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
function leerArchivoComoUrlDatos(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo'));
    lector.readAsDataURL(archivo);
  });
}
export default Conversaciones;
