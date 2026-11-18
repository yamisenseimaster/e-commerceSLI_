import React, { useMemo, useState } from 'react';
import { FiBriefcase, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import BarraLateral from './BarraLateral';
const claveAlmacenamiento = 'dashboardCalendarEventsV2';
const eventoColores = ['#00b894', '#087c67', '#14b8a6', '#64748b', '#f59e0b', '#65a30d', '#334155'];
const semanaDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const completoSemanaDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const mesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const vistaEtiquetas = {
  month: 'mes',
  week: 'semana',
  day: 'día'
};
const horaFilas = Array.from({
  length: 12
}, (_, indice) => indice + 6);
const predeterminadoEventos = [];
const vacioEvento = {
  title: '',
  type: 'work',
  color: eventoColores[0],
  dateTime: aEntradaFechaHora(new Date()),
  description: ''
};
function Calendario() {
  const [eventos, establecerEventos] = useState(() => cargarEventos());
  const [vista, establecerVista] = useState('month');
  const [fechaActual, establecerFechaActual] = useState(new Date());
  const [modalModo, establecerModalModo] = useState(null);
  const [editandoEvento, establecerEditandoEvento] = useState(null);
  const [valores, establecerValores] = useState(vacioEvento);
  const diasMes = useMemo(() => obtenerMesDias(fechaActual), [fechaActual]);
  const semanaDiasDatos = useMemo(() => obtenerSemanaDias(fechaActual), [fechaActual]);
  const ordenadoEventos = useMemo(() => [...eventos].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)), [eventos]);
  const eventoResumen = useMemo(() => ({
    work: eventos.filter(evento => evento.type === 'work').length,
    leave: eventos.filter(evento => evento.type === 'leave').length
  }), [eventos]);
  const abrirCrearModal = () => {
    establecerEditandoEvento(null);
    establecerValores({
      ...vacioEvento,
      dateTime: aEntradaFechaHora(fechaActual)
    });
    establecerModalModo('form');
  };
  const abrirCrearModalParaFecha = (fecha, hora = 0) => {
    const seleccionadoFecha = new Date(fecha);
    seleccionadoFecha.setHours(hora, 0, 0, 0);
    establecerEditandoEvento(null);
    establecerValores({
      ...vacioEvento,
      dateTime: aEntradaFechaHora(seleccionadoFecha)
    });
    establecerFechaActual(seleccionadoFecha);
    establecerModalModo('form');
  };
  const abrirEditarModal = evento => {
    establecerEditandoEvento(evento);
    establecerValores({
      title: evento.title,
      type: evento.type,
      color: evento.color,
      dateTime: evento.dateTime,
      description: evento.description || ''
    });
    establecerModalModo('form');
  };
  const cerrarModal = () => {
    establecerModalModo(null);
    establecerEditandoEvento(null);
    establecerValores(vacioEvento);
  };
  const manejarCambio = evento => {
    const {
      name: nombre,
      value: valor
    } = evento.target;
    establecerValores(actual => ({
      ...actual,
      [nombre]: valor
    }));
  };
  const manejarCambioParteFechaHora = (parte, valor) => {
    establecerValores(actual => {
      const [fechaParte, horaParte = '00:00'] = actual.dateTime.split('T');
      return {
        ...actual,
        dateTime: parte === 'date' ? `${valor}T${horaParte}` : `${fechaParte}T${valor}`
      };
    });
  };
  const manejarEnvio = evento => {
    evento.preventDefault();
    const carga = {
      ...valores,
      id: editandoEvento?.id || `${Date.now()}`,
      title: valores.title.trim()
    };
    if (!carga.title) return;
    const siguienteEventos = editandoEvento ? eventos.map(elemento => elemento.id === editandoEvento.id ? carga : elemento) : [...eventos, carga];
    guardarEventos(siguienteEventos);
    establecerEventos(siguienteEventos);
    establecerFechaActual(new Date(carga.dateTime));
    cerrarModal();
  };
  const manejarEliminacion = () => {
    if (!editandoEvento) return;
    const siguienteEventos = eventos.filter(evento => evento.id !== editandoEvento.id);
    guardarEventos(siguienteEventos);
    establecerEventos(siguienteEventos);
    cerrarModal();
  };
  return <BarraLateral title="Calendario" eyebrow="Aplicaciones">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 overflow-hidden rounded-[10px] border border-[#d9e0ea] bg-white p-3 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none sm:p-4">
          <h3 className="text-[15px] font-bold text-[#26344a] dark:text-white">Calendario de eventos</h3>
          <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="order-1 flex overflow-hidden rounded-[8px] border border-main">
              <button type="button" onClick={() => establecerFechaActual(fecha => agregarPorVista(fecha, vista, -1))} className="flex h-9 w-12 items-center justify-center text-main transition hover:bg-emerald-50 dark:hover:bg-[#222222]">
                <FiChevronLeft />
              </button>
              <button type="button" onClick={() => establecerFechaActual(fecha => agregarPorVista(fecha, vista, 1))} className="flex h-9 w-12 items-center justify-center border-l border-main text-main transition hover:bg-emerald-50 dark:hover:bg-[#222222]">
                <FiChevronRight />
              </button>
            </div>

            <h2 className="order-3 w-full border-b-2 border-main px-1 pb-1 text-center text-xl font-black text-main sm:order-2 sm:w-auto">{obtenerTitulo(fechaActual, vista)}</h2>

            <div className="order-2 flex overflow-hidden rounded-[8px] bg-main text-white shadow-sm sm:order-3">
              <button type="button" onClick={() => establecerFechaActual(new Date())} className="h-9 px-4 text-[13px] font-black transition hover:bg-white/10 sm:px-5">hoy</button>
              {['month', 'week', 'day'].map(elemento => <button key={elemento} type="button" onClick={() => establecerVista(elemento)} className="h-9 px-4 font-black transition sm:px-5" style={{
              backgroundColor: vista === elemento ? 'rgba(0,0,0,0.18)' : 'transparent',
              fontSize: 13
            }}>
                
                  {vistaEtiquetas[elemento]}
                </button>)}
            </div>
          </div>

          {vista === 'month' && <VistaMes currentDate={fechaActual} days={diasMes} events={eventos} onCreate={abrirCrearModalParaFecha} onEdit={abrirEditarModal} />}
          {vista === 'week' && <VistaSemana days={semanaDiasDatos} events={eventos} onCreate={abrirCrearModalParaFecha} onEdit={abrirEditarModal} />}
          {vista === 'day' && <VistaDia date={fechaActual} events={eventos} onCreate={abrirCrearModalParaFecha} onEdit={abrirEditarModal} />}
        </section>

        <aside className="min-w-0 space-y-4">
          <button type="button" onClick={abrirCrearModal} className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-main text-sm font-black text-white shadow-sm transition hover:bg-subMain">
            <FiPlus /> Agregar evento
          </button>

          <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase text-[#7b8798]">Resumen de eventos</h3>
              <span className="rounded-[4px] bg-[#eef2f7] px-2 py-1 text-[12px] font-black text-[#64748b] dark:bg-[#242424] dark:text-[#cbd5e1]">{eventos.length} Total</span>
            </div>
            <ResumenFila color="#00b894" count={eventoResumen.work} label="Trabajo" />
            <ResumenFila color="#087c67" count={eventoResumen.leave} label="Permisos" />
          </section>

          <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase text-[#7b8798]">Próximos</h3>
              <span className="rounded-[4px] bg-[#eef2f7] px-2 py-1 text-[12px] font-black text-[#64748b] dark:bg-[#242424] dark:text-[#cbd5e1]">{ordenadoEventos.length}</span>
            </div>
            <div className="space-y-4">
              {ordenadoEventos.slice(0, 5).map(evento => <button key={evento.id} type="button" onClick={() => abrirEditarModal(evento)} className="flex w-full items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-emerald-50 text-main dark:bg-[#102624]"><FiCalendar /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-black text-[#26344a] dark:text-white">{evento.title}</span>
                    <span className="block truncate text-[12px] font-medium text-[#7b8798]">{formatearFechaHora(evento.dateTime)}</span>
                  </span>
                  <FiChevronRight className="text-[#9aa6b8]" />
                </button>)}
            </div>
          </section>
        </aside>
      </div>

      {modalModo === 'form' && <ModalEvento editing={Boolean(editandoEvento)} onChange={manejarCambio} onClose={cerrarModal} onDateTimePartChange={manejarCambioParteFechaHora} onDelete={manejarEliminacion} onSubmit={manejarEnvio} values={valores} />}
    </BarraLateral>;
}
function VistaMes({
  currentDate: fechaActual,
  days: dias,
  events: eventos,
  onCreate: alCrear,
  onEdit: alEditar
}) {
  return <div className="scrollbar-invisible overflow-x-auto rounded-[8px] border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div className="min-w-[392px] sm:min-w-0">
      <div className="grid grid-cols-7 bg-[#eef2f7] text-center text-[11px] font-black text-[#5f6f85] dark:bg-[#222222] dark:text-slate-200 sm:text-[13px]">
        {semanaDias.map(dia => <div key={dia} className="border-r border-[#d9e0ea] py-3 last:border-r-0 dark:border-[#2b2b2b] sm:py-3.5">{dia}</div>)}
      </div>
      <div className="calendar-month-grid grid grid-cols-7">
        {dias.map(dia => {
          const diaEventos = eventos.filter(evento => eventoTocaDia(evento, dia.date));
          const esHoy = esMismoDia(dia.date, fechaActual);
          return <div key={dia.key} onClick={() => alCrear(dia.date)} className={`cursor-pointer border-r border-t border-[#d9e0ea] p-1.5 text-left last:border-r-0 dark:border-[#2b2b2b] sm:p-2 ${dia.date.getDay() === 0 ? 'bg-emerald-50/30 dark:bg-[#17221e]' : 'bg-white dark:bg-[#191919]'} ${esHoy ? 'bg-emerald-50/80 dark:bg-[#143026]' : ''}`}>
                
              <div className={`mb-1.5 text-right text-[11px] font-bold sm:mb-2 sm:text-[13px] ${dia.currentMonth ? 'text-[#162033] dark:text-[#e5e7eb]' : 'text-[#c3cad4] dark:text-[#5f6672]'}`}>
                <span className={esHoy ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[#087c67] sm:h-7 sm:w-7' : ''}>{dia.date.getDate()}</span>
              </div>
              <div className="space-y-1">
                {diaEventos.slice(0, 2).map(evento => <IndicadorEvento key={evento.id} compact event={evento} onClick={() => alEditar(evento)} />)}
              </div>
            </div>;
        })}
      </div>
      </div>
    </div>;
}
function VistaSemana({
  days: dias,
  events: eventos,
  onCreate: alCrear,
  onEdit: alEditar
}) {
  const semanaCuadriculaEstilo = {
    gridTemplateColumns: '52px repeat(7, minmax(96px, 1fr))'
  };
  return <div className="max-h-[520px] overflow-auto border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div className="grid min-w-[760px] bg-[#eef2f7] text-center text-[14px] font-black text-[#26344a] dark:bg-[#222222] dark:text-slate-200" style={semanaCuadriculaEstilo}>
        <div className="border-r border-[#d9e0ea] dark:border-[#2b2b2b]" />
        {dias.map(dia => <div key={dia.toISOString()} className="border-r border-[#d9e0ea] py-4 last:border-r-0 dark:border-[#2b2b2b]">{semanaDias[dia.getDay()]} {dia.getMonth() + 1}/{dia.getDate()}</div>)}
      </div>
      <div className="grid min-w-[760px] border-t border-[#d9e0ea] dark:border-[#2b2b2b]" style={semanaCuadriculaEstilo}>
        <div className="border-r border-[#d9e0ea] p-3 text-[14px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">todo el dia</div>
        {dias.map(dia => <div key={dia.toISOString()} onClick={() => alCrear(dia)} className="min-h-[54px] cursor-pointer border-r border-[#d9e0ea] p-2 text-left last:border-r-0 dark:border-[#2b2b2b] dark:bg-[#191919]">
            {eventos.filter(evento => esMismoDia(new Date(evento.dateTime), dia)).map(evento => <IndicadorEvento key={evento.id} event={evento} onClick={() => alEditar(evento)} />)}
          </div>)}
      </div>
      <HoraCuadricula columns={7} days={dias} events={eventos} onCreate={alCrear} onEdit={alEditar} />
    </div>;
}
function VistaDia({
  date: fecha,
  events: eventos,
  onCreate: alCrear,
  onEdit: alEditar
}) {
  const diaCuadriculaEstilo = {
    gridTemplateColumns: '52px minmax(620px, 1fr)'
  };
  return <div className="max-h-[520px] overflow-auto border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div className="grid min-w-[680px] bg-[#eef2f7] text-center text-[14px] font-black text-[#64748b] dark:bg-[#222222] dark:text-slate-200" style={diaCuadriculaEstilo}>
        <div className="border-r border-[#d9e0ea] dark:border-[#2b2b2b]" />
        <div className="py-4">{completoSemanaDias[fecha.getDay()]}</div>
      </div>
      <div className="grid min-w-[680px] border-t border-[#d9e0ea] bg-emerald-50/40 dark:border-[#2b2b2b] dark:bg-[#143026]" style={diaCuadriculaEstilo}>
        <div className="border-r border-[#d9e0ea] p-3 text-[14px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">todo el dia</div>
        <div onClick={() => alCrear(fecha)} className="min-h-[54px] cursor-pointer p-2 text-left">
          {eventos.filter(evento => esMismoDia(new Date(evento.dateTime), fecha)).map(evento => <IndicadorEvento key={evento.id} event={evento} onClick={() => alEditar(evento)} />)}
        </div>
      </div>
      <HoraCuadricula columns={1} days={[fecha]} events={eventos} onCreate={alCrear} onEdit={alEditar} />
    </div>;
}
function HoraCuadricula({
  columns: columnas,
  days: dias,
  events: eventos,
  onCreate: alCrear,
  onEdit: alEditar
}) {
  const cuadriculaEstilo = {
    gridTemplateColumns: columnas === 7 ? '52px repeat(7, minmax(96px, 1fr))' : '52px minmax(620px, 1fr)'
  };
  return <div className="grid min-w-[680px]" style={cuadriculaEstilo}>
      {horaFilas.map(hora => <React.Fragment key={hora}>
          <div className="h-9 border-r border-t border-[#d9e0ea] pr-2 pt-1 text-right text-[12px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">{formatearHora(hora)}</div>
          {dias.map(dia => {
        const horaEventos = eventos.filter(evento => {
          const fecha = new Date(evento.dateTime);
          return esMismoDia(fecha, dia) && fecha.getHours() === hora;
        });
        return <div key={`${dia.toISOString()}-${hora}`} onClick={() => alCrear(dia, hora)} className="h-9 cursor-pointer border-r border-t border-[#d9e0ea] bg-emerald-50/20 px-1 py-1 text-left last:border-r-0 dark:border-[#2b2b2b] dark:bg-[#17221e]">
                {horaEventos.slice(0, 1).map(evento => <IndicadorEvento key={evento.id} event={evento} onClick={() => alEditar(evento)} />)}
              </div>;
      })}
        </React.Fragment>)}
    </div>;
}
function IndicadorEvento({
  compact: compacto = false,
  event: evento,
  onClick: alHacerClic
}) {
  return <button type="button" onClick={clicEvento => {
    clicEvento.stopPropagation();
    alHacerClic();
  }} className={`${compacto ? 'h-7 max-w-full px-2 text-[10px] sm:text-[11px]' : 'h-8 px-3 text-[12px]'} flex w-full items-center gap-1.5 truncate rounded-[8px] text-left font-black text-white shadow-sm transition hover:brightness-95 sm:gap-2`} style={{
    backgroundColor: evento.color
  }} title={evento.title}>
      
      <FiCalendar className="shrink-0 text-[11px]" />
      <span className="truncate">{compacto && evento.title === 'Taller de React' ? `00:54  ${evento.title}` : evento.title}</span>
    </button>;
}
function ModalEvento({
  editing: editando,
  onChange: alCambiar,
  onClose: alCerrar,
  onDateTimePartChange: alCambiarParteFechaHora,
  onDelete: alEliminar,
  onSubmit: alEnviar,
  values: valores
}) {
  const [fechaParte, horaParte = '00:00'] = valores.dateTime.split('T');
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar modal" onClick={alCerrar} />
      <form onSubmit={alEnviar} className="relative rounded-[8px] bg-white p-5 shadow-2xl dark:bg-[#191919]" style={{
      width: 'min(332px, calc(100vw - 32px))'
    }}>
        
        <button type="button" onClick={alCerrar} className="absolute -right-4 -top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#162033] shadow-md dark:bg-[#242424] dark:text-white">
          <FiX />
        </button>
        <h2 className="mb-5 text-[22px] font-black text-[#26344a] dark:text-white">{editando ? 'Editar evento' : 'Agregar evento'}</h2>

        <ModalCampo label="Titulo del evento">
          <input name="title" value={valores.title} onChange={alCambiar} required placeholder="Ingresa el titulo del evento" className={modalEntradaClase} />
        </ModalCampo>
        <ModalCampo label="Tipo de evento">
          <select name="type" value={valores.type} onChange={alCambiar} className={modalEntradaClase}>
            <option value="work">trabajo</option>
            <option value="leave">permiso</option>
            <option value="meeting">reunion</option>
            <option value="personal">personal</option>
          </select>
        </ModalCampo>
        <ModalCampo label="Color del evento">
          <div className="flex items-center gap-2">
            {eventoColores.map(color => <label key={color} className="relative block h-6 w-6 shrink-0 cursor-pointer">
                <input type="radio" name="color" value={color} checked={valores.color === color} onChange={alCambiar} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              
                <span className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm" style={{
              backgroundColor: color
            }}>
                  {valores.color === color && <FiCheck className="text-[14px] text-white" />}
                </span>
              </label>)}
          </div>
        </ModalCampo>
        <div className="grid grid-cols-2 gap-3">
          <ModalCampo label="Fecha">
            <input type="date" value={fechaParte} onChange={evento => alCambiarParteFechaHora('date', evento.target.value)} required className={modalEntradaClase} />
            
          </ModalCampo>
          <ModalCampo label="Hora">
            <input type="time" value={horaParte} onChange={evento => alCambiarParteFechaHora('time', evento.target.value)} required className={modalEntradaClase} />
            
          </ModalCampo>
        </div>
        <ModalCampo label="Descripcion (opcional)">
          <textarea name="description" value={valores.description} onChange={alCambiar} placeholder="Ingresa una descripcion" className={`${modalEntradaClase} min-h-[72px] resize-none`} />
        </ModalCampo>

        <div className={`mt-6 grid gap-2 ${editando ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {editando && <button type="button" onClick={alEliminar} className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-[5px] bg-flash px-3 text-sm font-black text-white">
              <FiTrash2 /> Eliminar
            </button>}
          <button type="submit" className="h-10 min-w-0 rounded-[5px] bg-main px-3 text-sm font-black leading-tight text-white hover:bg-subMain">
            Guardar evento
          </button>
        </div>
      </form>
    </div>;
}
function ModalCampo({
  children: hijos,
  label: etiqueta
}) {
  return <label className="mb-4 block text-[14px] font-bold text-[#64748b]">
      {etiqueta}
      <div className="mt-2">{hijos}</div>
    </label>;
}
function ResumenFila({
  color,
  count: cantidad,
  label: etiqueta
}) {
  return <div className="mb-3.5 flex items-center justify-between rounded-[5px] bg-[#f7f9fc] px-3.5 py-4 last:mb-0 dark:bg-[#111111]">
      <span className="flex items-center gap-3 text-[14px] font-bold text-[#64748b]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#242424]" style={{
        color
      }}>
          {etiqueta === 'Trabajo' ? <FiBriefcase /> : <FiCalendar />}
        </span>
        {etiqueta}
      </span>
      <strong className="rounded-[4px] px-2.5 py-1 text-[12px] text-white" style={{
      backgroundColor: color
    }}>{cantidad}</strong>
    </div>;
}
const modalEntradaClase = 'w-full rounded-[5px] border border-[#d9e0ea] bg-[#fbfcff] px-4 py-2.5 text-sm font-medium text-[#26344a] outline-none transition focus:border-main dark:border-[#303030] dark:bg-[#111111] dark:text-white';
function cargarEventos() {
  try {
    const almacenado = localStorage.getItem(claveAlmacenamiento);
    if (!almacenado) return predeterminadoEventos;
    const eventos = JSON.parse(almacenado);
    if (!Array.isArray(eventos)) return predeterminadoEventos;
    const anteriorColores = {
      '#2f6fdb': '#00b894',
      '#27c8c2': '#087c67',
      '#f34b7e': '#14b8a6',
      '#f0c90f': '#f59e0b',
      '#1fc2fb': '#65a30d',
      '#6d28d9': '#334155'
    };
    const ejemplosSinCambios = {
      'project-deadline': 'Fecha limite del proyecto',
      'react-workshop': 'Taller de React',
      vacation: 'Vacaciones',
      'public-holiday': 'Feriado'
    };
    return eventos.filter(evento => ejemplosSinCambios[evento.id] !== evento.title).map(evento => ({
      ...evento,
      color: anteriorColores[evento.color] || evento.color
    }));
  } catch {
    return predeterminadoEventos;
  }
}
function guardarEventos(eventos) {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(eventos));
}
function obtenerMesDias(fecha) {
  const ano = fecha.getFullYear();
  const mes = fecha.getMonth();
  const primero = new Date(ano, mes, 1);
  const inicio = new Date(ano, mes, 1 - primero.getDay());
  return Array.from({
    length: 42
  }, (_, indice) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + indice);
    return {
      date: dia,
      key: dia.toISOString(),
      currentMonth: dia.getMonth() === mes
    };
  });
}
function obtenerSemanaDias(fecha) {
  const inicio = new Date(fecha);
  inicio.setDate(fecha.getDate() - fecha.getDay());
  return Array.from({
    length: 7
  }, (_, indice) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + indice);
    return dia;
  });
}
function agregarPorVista(fecha, vista, importe) {
  const siguiente = new Date(fecha);
  if (vista === 'month') siguiente.setMonth(siguiente.getMonth() + importe);
  if (vista === 'week') siguiente.setDate(siguiente.getDate() + importe * 7);
  if (vista === 'day') siguiente.setDate(siguiente.getDate() + importe);
  return siguiente;
}
function obtenerTitulo(fecha, vista) {
  if (vista === 'month') return `${mesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;
  if (vista === 'week') {
    const dias = obtenerSemanaDias(fecha);
    return `${mesNombres[dias[0].getMonth()]} ${dias[0].getDate()} - ${dias[6].getDate()}, ${dias[6].getFullYear()}`;
  }
  return `${mesNombres[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`;
}
function esMismoDia(primero, segundo) {
  return primero.getFullYear() === segundo.getFullYear() && primero.getMonth() === segundo.getMonth() && primero.getDate() === segundo.getDate();
}
function eventoTocaDia(evento, dia) {
  const inicio = inicioDeDia(new Date(evento.dateTime));
  const fin = inicioDeDia(new Date(evento.endDateTime || evento.dateTime));
  const actual = inicioDeDia(dia);
  return actual >= inicio && actual <= fin;
}
function inicioDeDia(fecha) {
  const valor = new Date(fecha);
  valor.setHours(0, 0, 0, 0);
  return valor;
}
function aEntradaFechaHora(fecha) {
  const valor = new Date(fecha);
  valor.setMinutes(valor.getMinutes() - valor.getTimezoneOffset());
  return valor.toISOString().slice(0, 16);
}
function formatearHora(hora) {
  if (hora === 12) return '12pm';
  return hora > 12 ? `${hora - 12}pm` : `${hora}am`;
}
function formatearFechaHora(valor) {
  const fecha = new Date(valor);
  return `${fecha.toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })}, ${fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}
export default Calendario;
