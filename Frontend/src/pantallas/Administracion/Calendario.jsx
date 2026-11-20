import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { solicitarApi } from '../../servicios/api';
import BarraLateral from './BarraLateral';

const claveAlmacenamiento = 'dashboardCalendarEventsV2';
const eventColors = [
  '#00b894',
  '#087c67',
  '#14b8a6',
  '#64748b',
  '#f59e0b',
  '#65a30d',
  '#334155',
];
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const fullWeekDays = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const viewLabels = {
  month: 'mes',
  week: 'semana',
  day: 'día',
};
const timeRows = Array.from({ length: 12 }, (_, indice) => indice + 6);

const defaultEvents = [];

const emptyEvent = {
  title: '',
  type: 'work',
  color: eventColors[0],
  dateTime: fechaYHoraParaCampo(new Date()),
  description: '',
};

function Calendario() {
  const [events, setEvents] = useState([]);
  const ocupado = useRef(false);
  const [listo, establecerListo] = useState(false);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      for (const anterior of cargarEventos()) {
        await solicitarApi('/admin/eventos/' + encodeURIComponent(anterior.id), { method: 'POST', data: anterior });
      }
      const guardados = await solicitarApi('/admin/eventos');
      if (activo) {
        localStorage.removeItem(claveAlmacenamiento);
        setEvents(guardados);
        establecerListo(true);
      }
    }
    cargar().catch(error => toast.error(error.message));
    return () => { activo = false };
  }, []);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modoModal, establecerModoModal] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [valores, establecerValores] = useState(emptyEvent);

  const monthDays = useMemo(
    () => obtenerDiasDelMes(currentDate),
    [currentDate],
  );
  const weekDaysData = useMemo(
    () => obtenerDiasDeLaSemana(currentDate),
    [currentDate],
  );
  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)),
    [events],
  );
  const eventSummary = useMemo(
    () => ({
      work: events.filter((evento) => evento.type === 'work').length,
      leave: events.filter((evento) => evento.type === 'leave').length,
    }),
    [events],
  );

  const openCreateModal = () => {
    setEditingEvent(null);
    establecerValores({
      ...emptyEvent,
      dateTime: fechaYHoraParaCampo(currentDate),
    });
    establecerModoModal('form');
  };

  const openCreateModalForDate = (fecha, hora = 0) => {
    const selectedDate = new Date(fecha);
    selectedDate.setHours(hora, 0, 0, 0);
    setEditingEvent(null);
    establecerValores({
      ...emptyEvent,
      dateTime: fechaYHoraParaCampo(selectedDate),
    });
    setCurrentDate(selectedDate);
    establecerModoModal('form');
  };

  const openEditModal = (evento) => {
    setEditingEvent(evento);
    establecerValores({
      title: evento.title,
      type: evento.type,
      color: evento.color,
      dateTime: evento.dateTime,
      description: evento.description || '',
    });
    establecerModoModal('form');
  };

  const cerrarModal = () => {
    establecerModoModal(null);
    setEditingEvent(null);
    establecerValores(emptyEvent);
  };

  const manejarCambio = (evento) => {
    const { name: nombre, value: valor } = evento.target;
    establecerValores((actual) => ({ ...actual, [nombre]: valor }));
  };

  const handleDateTimePartChange = (part, valor) => {
    establecerValores((actual) => {
      const [datePart, timePart = '00:00'] = actual.dateTime.split('T');
      return {
        ...actual,
        dateTime:
          part === 'date' ? `${valor}T${timePart}` : `${datePart}T${valor}`,
      };
    });
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (!valores.title.trim() || ocupado.current || !listo) return;
    ocupado.current = true;
    try {
      const clave = editingEvent?.id || crypto.randomUUID();
      const guardado = await solicitarApi('/admin/eventos/' + encodeURIComponent(clave), {
        method: editingEvent ? 'PUT' : 'POST', data: valores,
      });
      setEvents(actual => [...actual.filter(item => item.id !== clave), guardado]);
      setCurrentDate(new Date(guardado.dateTime));
      cerrarModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      ocupado.current = false;
    }
  };

  const manejarEliminacion = async () => {
    if (!editingEvent || ocupado.current) return;
    ocupado.current = true;
    try {
      await solicitarApi('/admin/eventos/' + encodeURIComponent(editingEvent.id), { method: 'DELETE' });
      setEvents(actual => actual.filter(item => item.id !== editingEvent.id));
      cerrarModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      ocupado.current = false;
    }
  };

  return (
    <BarraLateral title="Calendario" eyebrow="Aplicaciones">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 overflow-hidden rounded-[10px] border border-[#d9e0ea] bg-white p-3 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none sm:p-4">
          <h3 className="text-[15px] font-bold text-[#26344a] dark:text-white">
            Calendario de eventos
          </h3>
          <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="order-1 flex overflow-hidden rounded-[8px] border border-main">
              <button
                type="button"
                onClick={() =>
                  setCurrentDate((fecha) => avanzarSegunVista(fecha, view, -1))
                }
                className="flex h-9 w-12 items-center justify-center text-main transition hover:bg-emerald-50 dark:hover:bg-[#222222]">
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentDate((fecha) => avanzarSegunVista(fecha, view, 1))
                }
                className="flex h-9 w-12 items-center justify-center border-l border-main text-main transition hover:bg-emerald-50 dark:hover:bg-[#222222]">
                <FiChevronRight />
              </button>
            </div>

            <h2 className="order-3 w-full border-b-2 border-main px-1 pb-1 text-center text-xl font-black text-main sm:order-2 sm:w-auto">
              {obtenerTitulo(currentDate, view)}
            </h2>

            <div className="order-2 flex overflow-hidden rounded-[8px] bg-main text-white shadow-sm sm:order-3">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="h-9 px-4 text-[13px] font-black transition hover:bg-white/10 sm:px-5">
                hoy
              </button>
              {['month', 'week', 'day'].map((elemento) => (
                <button
                  key={elemento}
                  type="button"
                  onClick={() => setView(elemento)}
                  className="h-9 px-4 font-black transition sm:px-5"
                  style={{
                    backgroundColor:
                      view === elemento ? 'rgba(0,0,0,0.18)' : 'transparent',
                    fontSize: 13,
                  }}>
                  {viewLabels[elemento]}
                </button>
              ))}
            </div>
          </div>

          {view === 'month' && (
            <VistaMes
              currentDate={currentDate}
              days={monthDays}
              events={events}
              onCreate={openCreateModalForDate}
              onEdit={openEditModal}
            />
          )}
          {view === 'week' && (
            <VistaSemana
              days={weekDaysData}
              events={events}
              onCreate={openCreateModalForDate}
              onEdit={openEditModal}
            />
          )}
          {view === 'day' && (
            <VistaDia
              date={currentDate}
              events={events}
              onCreate={openCreateModalForDate}
              onEdit={openEditModal}
            />
          )}
        </section>

        <aside className="min-w-0 space-y-4">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-main text-sm font-black text-white shadow-sm transition hover:bg-subMain">
            <FiPlus /> Agregar evento
          </button>

          <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase text-[#7b8798]">
                Resumen de eventos
              </h3>
              <span className="rounded-[4px] bg-[#eef2f7] px-2 py-1 text-[12px] font-black text-[#64748b] dark:bg-[#242424] dark:text-[#cbd5e1]">
                {events.length} Total
              </span>
            </div>
            <FilaResumen
              color="#00b894"
              count={eventSummary.work}
              label="Trabajo"
            />
            <FilaResumen
              color="#087c67"
              count={eventSummary.leave}
              label="Permisos"
            />
          </section>

          <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-[#2b2b2b] dark:bg-[#191919] dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase text-[#7b8798]">
                Próximos
              </h3>
              <span className="rounded-[4px] bg-[#eef2f7] px-2 py-1 text-[12px] font-black text-[#64748b] dark:bg-[#242424] dark:text-[#cbd5e1]">
                {sortedEvents.length}
              </span>
            </div>
            <div className="space-y-4">
              {sortedEvents.slice(0, 5).map((evento) => (
                <button
                  key={evento.id}
                  type="button"
                  onClick={() => openEditModal(evento)}
                  className="flex w-full items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-emerald-50 text-main dark:bg-[#102624]">
                    <FiCalendar />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-black text-[#26344a] dark:text-white">
                      {evento.title}
                    </span>
                    <span className="block truncate text-[12px] font-medium text-[#7b8798]">
                      {formatearFechaYHora(evento.dateTime)}
                    </span>
                  </span>
                  <FiChevronRight className="text-[#9aa6b8]" />
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {modoModal === 'form' && (
        <ModalEvento
          editing={Boolean(editingEvent)}
          onChange={manejarCambio}
          onClose={cerrarModal}
          onDateTimePartChange={handleDateTimePartChange}
          onDelete={manejarEliminacion}
          onSubmit={manejarEnvio}
          values={valores}
        />
      )}
    </BarraLateral>
  );
}

function VistaMes({ currentDate, days, events, onCreate, onEdit: alEditar }) {
  return (
    <div className="scrollbar-invisible overflow-x-auto rounded-[8px] border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div className="min-w-[392px] sm:min-w-0">
        <div className="grid grid-cols-7 bg-[#eef2f7] text-center text-[11px] font-black text-[#5f6f85] dark:bg-[#222222] dark:text-slate-200 sm:text-[13px]">
          {weekDays.map((dia) => (
            <div
              key={dia}
              className="border-r border-[#d9e0ea] py-3 last:border-r-0 dark:border-[#2b2b2b] sm:py-3.5">
              {dia}
            </div>
          ))}
        </div>
        <div className="calendar-month-grid grid grid-cols-7">
          {days.map((dia) => {
            const dayEvents = events.filter((evento) =>
              eventoOcurreEseDia(evento, dia.date),
            );
            const isToday = esMismoDia(dia.date, currentDate);
            return (
              <div
                key={dia.key}
                onClick={() => onCreate(dia.date)}
                className={`cursor-pointer border-r border-t border-[#d9e0ea] p-1.5 text-left last:border-r-0 dark:border-[#2b2b2b] sm:p-2 ${
                  dia.date.getDay() === 0
                    ? 'bg-emerald-50/30 dark:bg-[#17221e]'
                    : 'bg-white dark:bg-[#191919]'
                } ${isToday ? 'bg-emerald-50/80 dark:bg-[#143026]' : ''}`}>
                <div
                  className={`mb-1.5 text-right text-[11px] font-bold sm:mb-2 sm:text-[13px] ${dia.currentMonth ? 'text-[#162033] dark:text-[#e5e7eb]' : 'text-[#c3cad4] dark:text-[#5f6672]'}`}>
                  <span
                    className={
                      isToday
                        ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[#087c67] sm:h-7 sm:w-7'
                        : ''
                    }>
                    {dia.date.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((evento) => (
                    <EtiquetaEvento
                      key={evento.id}
                      compact
                      event={evento}
                      onClick={() => alEditar(evento)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VistaSemana({ days, events, onCreate, onEdit: alEditar }) {
  const weekGridStyle = {
    gridTemplateColumns: '52px repeat(7, minmax(96px, 1fr))',
  };

  return (
    <div className="max-h-[520px] overflow-auto border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div
        className="grid min-w-[760px] bg-[#eef2f7] text-center text-[14px] font-black text-[#26344a] dark:bg-[#222222] dark:text-slate-200"
        style={weekGridStyle}>
        <div className="border-r border-[#d9e0ea] dark:border-[#2b2b2b]" />
        {days.map((dia) => (
          <div
            key={dia.toISOString()}
            className="border-r border-[#d9e0ea] py-4 last:border-r-0 dark:border-[#2b2b2b]">
            {weekDays[dia.getDay()]} {dia.getMonth() + 1}/{dia.getDate()}
          </div>
        ))}
      </div>
      <div
        className="grid min-w-[760px] border-t border-[#d9e0ea] dark:border-[#2b2b2b]"
        style={weekGridStyle}>
        <div className="border-r border-[#d9e0ea] p-3 text-[14px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">
          todo el dia
        </div>
        {days.map((dia) => (
          <div
            key={dia.toISOString()}
            onClick={() => onCreate(dia)}
            className="min-h-[54px] cursor-pointer border-r border-[#d9e0ea] p-2 text-left last:border-r-0 dark:border-[#2b2b2b] dark:bg-[#191919]">
            {events
              .filter((evento) => esMismoDia(new Date(evento.dateTime), dia))
              .map((evento) => (
                <EtiquetaEvento
                  key={evento.id}
                  event={evento}
                  onClick={() => alEditar(evento)}
                />
              ))}
          </div>
        ))}
      </div>
      <CuadriculaHoraria
        columns={7}
        days={days}
        events={events}
        onCreate={onCreate}
        onEdit={alEditar}
      />
    </div>
  );
}

function VistaDia({ date: fecha, events, onCreate, onEdit: alEditar }) {
  const dayGridStyle = { gridTemplateColumns: '52px minmax(620px, 1fr)' };

  return (
    <div className="max-h-[520px] overflow-auto border border-[#d9e0ea] dark:border-[#2b2b2b]">
      <div
        className="grid min-w-[680px] bg-[#eef2f7] text-center text-[14px] font-black text-[#64748b] dark:bg-[#222222] dark:text-slate-200"
        style={dayGridStyle}>
        <div className="border-r border-[#d9e0ea] dark:border-[#2b2b2b]" />
        <div className="py-4">{fullWeekDays[fecha.getDay()]}</div>
      </div>
      <div
        className="grid min-w-[680px] border-t border-[#d9e0ea] bg-emerald-50/40 dark:border-[#2b2b2b] dark:bg-[#143026]"
        style={dayGridStyle}>
        <div className="border-r border-[#d9e0ea] p-3 text-[14px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">
          todo el dia
        </div>
        <div
          onClick={() => onCreate(fecha)}
          className="min-h-[54px] cursor-pointer p-2 text-left">
          {events
            .filter((evento) => esMismoDia(new Date(evento.dateTime), fecha))
            .map((evento) => (
              <EtiquetaEvento
                key={evento.id}
                event={evento}
                onClick={() => alEditar(evento)}
              />
            ))}
        </div>
      </div>
      <CuadriculaHoraria
        columns={1}
        days={[fecha]}
        events={events}
        onCreate={onCreate}
        onEdit={alEditar}
      />
    </div>
  );
}

function CuadriculaHoraria({
  columns: columnas,
  days,
  events,
  onCreate,
  onEdit: alEditar,
}) {
  const gridStyle = {
    gridTemplateColumns:
      columnas === 7
        ? '52px repeat(7, minmax(96px, 1fr))'
        : '52px minmax(620px, 1fr)',
  };

  return (
    <div className="grid min-w-[680px]" style={gridStyle}>
      {timeRows.map((hora) => (
        <React.Fragment key={hora}>
          <div className="h-9 border-r border-t border-[#d9e0ea] pr-2 pt-1 text-right text-[12px] text-[#64748b] dark:border-[#2b2b2b] dark:text-[#9ca3af]">
            {formatearHoras(hora)}
          </div>
          {days.map((dia) => {
            const hourEvents = events.filter((evento) => {
              const fecha = new Date(evento.dateTime);
              return esMismoDia(fecha, dia) && fecha.getHours() === hora;
            });
            return (
              <div
                key={`${dia.toISOString()}-${hora}`}
                onClick={() => onCreate(dia, hora)}
                className="h-9 cursor-pointer border-r border-t border-[#d9e0ea] bg-emerald-50/20 px-1 py-1 text-left last:border-r-0 dark:border-[#2b2b2b] dark:bg-[#17221e]">
                {hourEvents.slice(0, 1).map((evento) => (
                  <EtiquetaEvento
                    key={evento.id}
                    event={evento}
                    onClick={() => alEditar(evento)}
                  />
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function EtiquetaEvento({
  compact = false,
  event: evento,
  onClick: alHacerClic,
}) {
  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        alHacerClic();
      }}
      className={`${compact ? 'h-7 max-w-full px-2 text-[10px] sm:text-[11px]' : 'h-8 px-3 text-[12px]'} flex w-full items-center gap-1.5 truncate rounded-[8px] text-left font-black text-white shadow-sm transition hover:brightness-95 sm:gap-2`}
      style={{ backgroundColor: evento.color }}
      title={evento.title}>
      <FiCalendar className="shrink-0 text-[11px]" />
      <span className="truncate">
        {compact && evento.title === 'Taller de React'
          ? `00:54  ${evento.title}`
          : evento.title}
      </span>
    </button>
  );
}

function ModalEvento({
  editing,
  onChange: alCambiar,
  onClose: alCerrar,
  onDateTimePartChange,
  onDelete: alEliminar,
  onSubmit: alEnviar,
  values: valores,
}) {
  const [datePart, timePart = '00:00'] = valores.dateTime.split('T');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar modal"
        onClick={alCerrar}
      />
      <form
        onSubmit={alEnviar}
        className="relative rounded-[8px] bg-white p-5 shadow-2xl dark:bg-[#191919]"
        style={{ width: 'min(332px, calc(100vw - 32px))' }}>
        <button
          type="button"
          onClick={alCerrar}
          className="absolute -right-4 -top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#162033] shadow-md dark:bg-[#242424] dark:text-white">
          <FiX />
        </button>
        <h2 className="mb-5 text-[22px] font-black text-[#26344a] dark:text-white">
          {editing ? 'Editar evento' : 'Agregar evento'}
        </h2>

        <CampoModal label="Titulo del evento">
          <input
            name="title"
            value={valores.title}
            onChange={alCambiar}
            required
            placeholder="Ingresa el titulo del evento"
            className={modalInputClass}
          />
        </CampoModal>
        <CampoModal label="Tipo de evento">
          <select
            name="type"
            value={valores.type}
            onChange={alCambiar}
            className={modalInputClass}>
            <option value="work">trabajo</option>
            <option value="leave">permiso</option>
            <option value="meeting">reunion</option>
            <option value="personal">personal</option>
          </select>
        </CampoModal>
        <CampoModal label="Color del evento">
          <div className="flex items-center gap-2">
            {eventColors.map((color) => (
              <label
                key={color}
                className="relative block h-6 w-6 shrink-0 cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  checked={valores.color === color}
                  onChange={alCambiar}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundColor: color }}>
                  {valores.color === color && (
                    <FiCheck className="text-[14px] text-white" />
                  )}
                </span>
              </label>
            ))}
          </div>
        </CampoModal>
        <div className="grid grid-cols-2 gap-3">
          <CampoModal label="Fecha">
            <input
              type="date"
              value={datePart}
              onChange={(evento) =>
                onDateTimePartChange('date', evento.target.value)
              }
              required
              className={modalInputClass}
            />
          </CampoModal>
          <CampoModal label="Hora">
            <input
              type="time"
              value={timePart}
              onChange={(evento) =>
                onDateTimePartChange('time', evento.target.value)
              }
              required
              className={modalInputClass}
            />
          </CampoModal>
        </div>
        <CampoModal label="Descripcion (opcional)">
          <textarea
            name="description"
            value={valores.description}
            onChange={alCambiar}
            placeholder="Ingresa una descripcion"
            className={`${modalInputClass} min-h-[72px] resize-none`}
          />
        </CampoModal>

        <div
          className={`mt-6 grid gap-2 ${editing ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {editing && (
            <button
              type="button"
              onClick={alEliminar}
              className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-[5px] bg-flash px-3 text-sm font-black text-white">
              <FiTrash2 /> Eliminar
            </button>
          )}
          <button
            type="submit"
            className="h-10 min-w-0 rounded-[5px] bg-main px-3 text-sm font-black leading-tight text-white hover:bg-subMain">
            Guardar evento
          </button>
        </div>
      </form>
    </div>
  );
}

function CampoModal({ children: hijos, label: etiqueta }) {
  return (
    <label className="mb-4 block text-[14px] font-bold text-[#64748b]">
      {etiqueta}
      <div className="mt-2">{hijos}</div>
    </label>
  );
}

function FilaResumen({ color, count: cantidadTotal, label: etiqueta }) {
  return (
    <div className="mb-3.5 flex items-center justify-between rounded-[5px] bg-[#f7f9fc] px-3.5 py-4 last:mb-0 dark:bg-[#111111]">
      <span className="flex items-center gap-3 text-[14px] font-bold text-[#64748b]">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#242424]"
          style={{ color }}>
          {etiqueta === 'Trabajo' ? <FiBriefcase /> : <FiCalendar />}
        </span>
        {etiqueta}
      </span>
      <strong
        className="rounded-[4px] px-2.5 py-1 text-[12px] text-white"
        style={{ backgroundColor: color }}>
        {cantidadTotal}
      </strong>
    </div>
  );
}

const modalInputClass =
  'w-full rounded-[5px] border border-[#d9e0ea] bg-[#fbfcff] px-4 py-2.5 text-sm font-medium text-[#26344a] outline-none transition focus:border-main dark:border-[#303030] dark:bg-[#111111] dark:text-white';

function cargarEventos() {
  try {
    const stored = localStorage.getItem(claveAlmacenamiento);
    if (!stored) return defaultEvents;
    const events = JSON.parse(stored);
    if (!Array.isArray(events)) return defaultEvents;
    const oldColors = {
      '#2f6fdb': '#00b894',
      '#27c8c2': '#087c67',
      '#f34b7e': '#14b8a6',
      '#f0c90f': '#f59e0b',
      '#1fc2fb': '#65a30d',
      '#6d28d9': '#334155',
    };
    const untouchedExamples = {
      'project-deadline': 'Fecha limite del proyecto',
      'react-workshop': 'Taller de React',
      vacation: 'Vacaciones',
      'public-holiday': 'Feriado',
    };
    return events
      .filter((evento) => untouchedExamples[evento.id] !== evento.title)
      .map((evento) => ({
        ...evento,
        color: oldColors[evento.color] || evento.color,
      }));
  } catch {
    return defaultEvents;
  }
}

function obtenerDiasDelMes(fecha) {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const first = new Date(anio, mes, 1);
  const start = new Date(anio, mes, 1 - first.getDay());

  return Array.from({ length: 42 }, (_, indice) => {
    const dia = new Date(start);
    dia.setDate(start.getDate() + indice);
    return {
      date: dia,
      key: dia.toISOString(),
      currentMonth: dia.getMonth() === mes,
    };
  });
}

function obtenerDiasDeLaSemana(fecha) {
  const start = new Date(fecha);
  start.setDate(fecha.getDate() - fecha.getDay());
  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(start);
    dia.setDate(start.getDate() + indice);
    return dia;
  });
}

function avanzarSegunVista(fecha, view, amount) {
  const siguiente = new Date(fecha);
  if (view === 'month') siguiente.setMonth(siguiente.getMonth() + amount);
  if (view === 'week') siguiente.setDate(siguiente.getDate() + amount * 7);
  if (view === 'day') siguiente.setDate(siguiente.getDate() + amount);
  return siguiente;
}

function obtenerTitulo(fecha, view) {
  if (view === 'month')
    return `${monthNames[fecha.getMonth()]} ${fecha.getFullYear()}`;
  if (view === 'week') {
    const days = obtenerDiasDeLaSemana(fecha);
    return `${monthNames[days[0].getMonth()]} ${days[0].getDate()} - ${days[6].getDate()}, ${days[6].getFullYear()}`;
  }
  return `${monthNames[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`;
}

function esMismoDia(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function eventoOcurreEseDia(evento, dia) {
  const start = inicioDelDia(new Date(evento.dateTime));
  const end = inicioDelDia(new Date(evento.endDateTime || evento.dateTime));
  const actual = inicioDelDia(dia);
  return actual >= start && actual <= end;
}

function inicioDelDia(fecha) {
  const valor = new Date(fecha);
  valor.setHours(0, 0, 0, 0);
  return valor;
}

function fechaYHoraParaCampo(fecha) {
  const valor = new Date(fecha);
  valor.setMinutes(valor.getMinutes() - valor.getTimezoneOffset());
  return valor.toISOString().slice(0, 16);
}

function formatearHoras(hora) {
  if (hora === 12) return '12pm';
  return hora > 12 ? `${hora - 12}pm` : `${hora}am`;
}

function formatearFechaYHora(valor) {
  const fecha = new Date(valor);
  return `${fecha.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}, ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

export default Calendario;
