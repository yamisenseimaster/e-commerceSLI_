import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCalendar,
  FiChevronRight,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import BarraLateral from './BarraLateral';
import { apiAdministracion } from '../../servicios/api';

function Clientes() {
  const [clientes, establecerClientes] = useState([]);
  const [cargando, establecerCargando] = useState(true);
  const [consulta, establecerConsulta] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    apiAdministracion
      .clientes()
      .then((datos) => establecerClientes(datos))
      .catch((error) =>
        toast.error(error.message || 'No se pudieron cargar los clientes'),
      )
      .finally(() => establecerCargando(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const busqueda = consulta.trim().toLowerCase();
    if (!busqueda) return clientes;

    return clientes.filter((cliente) =>
      [cliente.name, cliente.email, cliente.phone, cliente.role]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(busqueda)),
    );
  }, [clientes, consulta]);

  const selectedCustomer = useMemo(
    () => clientes.find((cliente) => cliente.id === selectedId) || null,
    [clientes, selectedId],
  );
  const totalOrders = clientes.reduce(
    (suma, cliente) => suma + Number(cliente.ordersCount || 0),
    0,
  );
  const totalSpent = clientes.reduce(
    (suma, cliente) => suma + Number(cliente.totalSpent || 0),
    0,
  );
  const activeCustomers = clientes.filter(
    (cliente) => cliente.ordersCount > 0,
  ).length;

  const manejarEliminacion = async () => {
    if (!selectedCustomer || selectedCustomer.role === 'admin') return;

    setDeleting(true);
    try {
      await apiAdministracion.eliminarCliente(selectedCustomer.id);
      establecerClientes((actual) =>
        actual.filter((cliente) => cliente.id !== selectedCustomer.id),
      );
      setSelectedId(null);
      setDeleteModalOpen(false);
      toast.success('Cliente eliminado');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el cliente');
    } finally {
      setDeleting(false);
    }
  };

  const closeCustomerDetail = () => {
    setDeleteModalOpen(false);
    setSelectedId(null);
  };

  return (
    <BarraLateral title="Clientes CRM" eyebrow="Aplicaciones">
      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          <TarjetaResumen
            accent="#2f6fdb"
            helper="+12 esta semana"
            icon={<FiUsers />}
            label="Clientes registrados"
            progress={76}
            trend="Base total de clientes"
            value={clientes.length}
          />

          <TarjetaResumen
            accent="#27c8c2"
            helper="+8 esta semana"
            icon={<FiShoppingBag />}
            label="Pedidos totales"
            progress={68}
            trend="Pedidos acumulados"
            value={totalOrders}
          />

          <TarjetaResumen
            accent="#e9ce1b"
            helper="+$240 esta semana"
            icon={<FiCalendar />}
            label="Valor acumulado"
            progress={82}
            trend="Ingresos de clientes"
            value={formatearDinero(totalSpent)}
          />

          <TarjetaResumen
            accent="#f34b7e"
            helper="-2 esta semana"
            icon={<FiUser />}
            label="Clientes activos"
            progress={Math.min(
              100,
              clientes.length ? (activeCustomers / clientes.length) * 100 : 0,
            )}
            trend="Con compras registradas"
            value={activeCustomers}
          />
        </section>

        <section className="rounded-[10px] border border-[#d9e0ea] bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-black text-[#162033] dark:text-white">
                Clientes
              </h2>
              <p className="text-[13px] font-medium text-[#7b8798]">
                Busca un cliente y abre su ficha completa.
              </p>
            </div>

            <label className="flex h-11 w-full items-center gap-3 rounded-[8px] border border-[#d9e0ea] bg-[#fbfcff] px-4 text-[#9aa6b8] dark:border-slate-700 dark:bg-slate-950 md:w-[360px]">
              <FiSearch />
              <input
                value={consulta}
                onChange={(evento) => establecerConsulta(evento.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#26344a] outline-none placeholder:text-[#a9b4c4] dark:text-white"
                placeholder="Buscar por nombre, email o telefono..."
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {cargando && (
              <p className="col-span-full py-8 text-center text-sm font-bold text-[#7b8798]">
                Cargando clientes...
              </p>
            )}
            {!cargando &&
              filteredCustomers.map((cliente) => (
                <TarjetaCliente
                  key={cliente.id}
                  customer={cliente}
                  onOpen={() => setSelectedId(cliente.id)}
                />
              ))}
            {!cargando && filteredCustomers.length === 0 && (
              <p className="col-span-full rounded-[6px] border border-dashed border-[#d9e0ea] py-8 text-center text-sm font-bold text-[#7b8798]">
                No se encontraron clientes.
              </p>
            )}
          </div>
        </section>
      </div>

      {selectedCustomer && (
        <ModalDetalleCliente
          customer={selectedCustomer}
          confirmingDelete={deleteModalOpen}
          deleting={deleting}
          onCancelDelete={() => setDeleteModalOpen(false)}
          onClose={closeCustomerDetail}
          onConfirmDelete={manejarEliminacion}
          onDeleteRequest={() => setDeleteModalOpen(true)}
        />
      )}
    </BarraLateral>
  );
}

function TarjetaCliente({ customer: cliente, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group rounded-[10px] border border-[#e1e7f0] bg-white p-4 text-left shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-main hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <Avatar name={cliente.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[16px] font-black text-[#26344a] dark:text-white">
              {cliente.name}
            </h3>
            <InsigniaRol role={cliente.role} />
          </div>
          <p className="mt-1 truncate text-[13px] font-medium text-[#7b8798]">
            {cliente.email}
          </p>
        </div>
        <FiChevronRight className="text-[#9aa6b8] transition group-hover:translate-x-1 group-hover:text-main" />
      </div>

      <div className="mt-4 rounded-[8px] bg-[#f3f7ff] p-2 dark:bg-slate-950">
        <div className="grid grid-cols-3 divide-x divide-[#dbe5f2] text-center dark:divide-slate-800">
          <EstadisticaBreve label="Pedidos" value={cliente.ordersCount} />
          <EstadisticaBreve
            label="Gastado"
            value={formatearDinero(cliente.totalSpent)}
          />
          <EstadisticaBreve
            label="Registro"
            value={formatearFecha(cliente.createdAt)}
          />
        </div>
      </div>
    </button>
  );
}

function ModalDetalleCliente({
  confirmingDelete,
  customer: cliente,
  deleting,
  onCancelDelete,
  onClose: alCerrar,
  onConfirmDelete,
  onDeleteRequest,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default"
        onClick={alCerrar}
      />

      <section
        className="relative z-[1] flex flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl dark:bg-slate-900"
        style={{ width: 'min(720px, calc(100vw - 48px))', maxHeight: '78vh' }}>
        {confirmingDelete && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm dark:bg-slate-950/90">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[8px] border border-[#d9e0ea] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-[#e1e7f0] px-5 py-4 dark:border-slate-800">
                <h3 className="text-[20px] font-black text-[#162033] dark:text-white">
                  Eliminar cliente
                </h3>
                <p className="mt-1 text-[13px] font-medium text-[#7b8798]">
                  Esta accion no se puede deshacer.
                </p>
              </div>

              <div className="px-5 py-5">
                <div className="rounded-[6px] bg-red-50 p-4 text-sm font-bold text-red-700">
                  Se eliminara a{' '}
                  <span className="font-black">{cliente.name}</span>. Los pedidos guardados conservarán su historial.
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e1e7f0] px-5 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onCancelDelete}
                  disabled={deleting}
                  className="h-10 rounded-[5px] border border-[#d9e0ea] bg-white px-4 text-sm font-black text-[#26344a] transition hover:border-main hover:text-main disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={deleting}
                  className="flex h-10 items-center gap-2 rounded-[5px] bg-flash px-4 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                  <FiTrash2 /> {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e1e7f0] p-4 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Avatar name={cliente.name} large />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[24px] font-black text-[#162033] dark:text-white">
                  {cliente.name}
                </h2>
                <InsigniaRol role={cliente.role} />
              </div>
              <p className="mt-1 text-[13px] font-medium text-[#7b8798]">
                Cliente desde {formatearFecha(cliente.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={cliente.role === 'admin' || deleting}
              onClick={onDeleteRequest}
              className="flex h-10 items-center gap-2 rounded-[5px] bg-flash px-4 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
              <FiTrash2 /> {deleting ? 'Eliminando...' : 'Eliminar cliente'}
            </button>
            <button
              type="button"
              onClick={alCerrar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] bg-white text-[#64748b] transition hover:border-main hover:text-main dark:border-slate-700 dark:bg-slate-950"
              aria-label="Cerrar">
              <FiX />
            </button>
          </div>
        </div>

        <div className="scrollbar-invisible overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <BloqueInformacion
              icon={<FiMail />}
              label="Email"
              value={cliente.email}
            />
            <BloqueInformacion
              icon={<FiPhone />}
              label="Telefono"
              value={
                cliente.phone ||
                obtenerUltimoTelefono(cliente) ||
                'Sin telefono'
              }
            />
            <BloqueInformacion
              icon={<FiMapPin />}
              label="Direccion"
              value={
                cliente.address ||
                obtenerUltimaDireccion(cliente) ||
                'Sin direccion'
              }
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TarjetaMetrica
              label="Pedidos"
              value={cliente.ordersCount}
              compact
            />
            <TarjetaMetrica
              label="Gastado total"
              value={formatearDinero(cliente.totalSpent)}
              compact
            />
            <TarjetaMetrica
              label="Ultima compra"
              value={
                cliente.lastOrderAt
                  ? formatearFecha(cliente.lastOrderAt)
                  : 'Sin compras'
              }
              compact
            />
            <TarjetaMetrica
              label="Promedio"
              value={
                cliente.ordersCount
                  ? formatearDinero(cliente.totalSpent / cliente.ordersCount)
                  : '$0'
              }
              compact
            />
          </div>

          <section className="mt-4 rounded-[6px] border border-[#d9e0ea] bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-black text-[#162033] dark:text-white">
                  Historial de compras
                </h3>
                <p className="text-[13px] font-medium text-[#7b8798]">
                  Pedidos realizados por este cliente.
                </p>
              </div>
              <span className="rounded-[4px] bg-[#eef2f7] px-3 py-1 text-[12px] font-black text-[#64748b]">
                {cliente.orders?.length || 0} pedidos
              </span>
            </div>

            <div className="space-y-3">
              {(cliente.orders || []).map((pedido) => (
                <TarjetaPedido key={pedido.id} order={pedido} />
              ))}
              {(!cliente.orders || cliente.orders.length === 0) && (
                <div className="rounded-[6px] border border-dashed border-[#d9e0ea] py-10 text-center">
                  <FiShoppingBag className="mx-auto text-2xl text-[#9aa6b8]" />
                  <p className="mt-2 font-bold text-[#7b8798]">
                    Este cliente aun no tiene compras.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function TarjetaPedido({ order: pedido }) {
  return (
    <article className="rounded-[6px] border border-[#e1e7f0] bg-[#fbfcff] p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-[#26344a] dark:text-white">
            Pedido #{pedido.id.slice(0, 8)}
          </h4>
          <p className="mt-1 flex items-center gap-2 text-[13px] font-medium text-[#7b8798]">
            <FiCalendar /> {formatearFechaYHora(pedido.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[18px] font-black text-[#162033] dark:text-white">
            {formatearDinero(pedido.total)}
          </p>
          <p className="text-[12px] font-bold text-[#7b8798]">
            {traducirEstado(pedido.status)} -{' '}
            {traducirEstado(pedido.paymentStatus)}
          </p>
        </div>
      </div>

      <div className="mt-3 divide-y divide-[#e1e7f0]">
        {(pedido.items || []).map((elemento) => (
          <div
            key={`${pedido.id}-${elemento.productId}`}
            className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#26344a] dark:text-white">
                {elemento.title}
              </p>
              <p className="text-[12px] text-[#7b8798]">
                Cantidad: {elemento.quantity}
              </p>
            </div>
            <p className="font-black text-[#162033] dark:text-white">
              {formatearDinero(
                (elemento.price || elemento.unitPrice || 0) * elemento.quantity,
              )}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TarjetaResumen({
  accent: acento,
  helper,
  icon: icono,
  label: etiqueta,
  progress,
  trend,
  value: valor,
}) {
  return (
    <article className="relative overflow-hidden rounded-[10px] border border-[#d9e0ea] bg-white p-3.5 shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] sm:h-11 sm:w-11 sm:text-[20px]"
          style={{ backgroundColor: `${acento}18`, color: acento }}>
          {icono}
        </div>
        <div className="min-w-0">
          <p className="text-[18px] font-black leading-none text-[#162033] dark:text-white sm:text-[20px]">
            {valor}
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-[#64748b] sm:text-[13px]">
            {etiqueta}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-[#e9eef5]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${acento}, ${acento}88)`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold sm:text-[12px]">
        <span className="truncate text-[#7b8798]">{trend}</span>
        <span className="shrink-0" style={{ color: acento }}>
          {helper}
        </span>
      </div>
    </article>
  );
}

function TarjetaMetrica({ compact = false, label: etiqueta, value: valor }) {
  return (
    <div
      className={`rounded-[10px] border border-[#d9e0ea] bg-white shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-[12px] font-black uppercase text-[#9aa6b8]">
        {etiqueta}
      </p>
      <p
        className={`${compact ? 'text-[18px]' : 'text-[24px]'} mt-2 font-black text-[#162033] dark:text-white`}>
        {valor}
      </p>
    </div>
  );
}

function EstadisticaBreve({ label: etiqueta, value: valor }) {
  return (
    <div className="px-2 py-1.5">
      <p className="truncate text-[14px] font-black text-[#162033] dark:text-white">
        {valor}
      </p>
      <p className="text-[11px] font-medium text-[#7b8798]">{etiqueta}</p>
    </div>
  );
}

function BloqueInformacion({ icon: icono, label: etiqueta, value: valor }) {
  return (
    <div className="rounded-[10px] bg-[#f3f7ff] p-4 dark:bg-slate-900">
      <p className="flex items-center gap-2 text-[12px] font-black uppercase text-[#7b8798]">
        {icono} {etiqueta}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-[#26344a] dark:text-white">
        {valor}
      </p>
    </div>
  );
}

function Avatar({ large = false, name: nombre }) {
  const initials = (nombre || 'CL')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${large ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-sm'} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-main to-[#27c8c2] font-black text-white`}>
      {initials}
    </div>
  );
}

function InsigniaRol({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${isAdmin ? 'bg-blue-50 text-main' : 'bg-emerald-50 text-[#00c48c]'}`}>
      {isAdmin ? 'admin' : 'cliente'}
    </span>
  );
}

function obtenerUltimaDireccion(cliente) {
  const address = cliente.orders?.find(
    (pedido) => pedido.shippingAddress,
  )?.shippingAddress;
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [address.street, address.city, address.country, address.zip]
    .filter(Boolean)
    .join(', ');
}

function obtenerUltimoTelefono(cliente) {
  const address = cliente.orders?.find(
    (pedido) => pedido.shippingAddress?.phone,
  )?.shippingAddress;
  return address?.phone || '';
}

function formatearDinero(valor) {
  return `$${Number(valor || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;
}

function formatearFecha(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleDateString('es-ES');
}

function formatearFechaYHora(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function traducirEstado(estado) {
  const statuses = {
    Pending: 'Pendiente',
    Complete: 'Completado',
    Canceled: 'Cancelado',
  };
  return statuses[estado] || estado || 'Pendiente';
}

export default Clientes;
