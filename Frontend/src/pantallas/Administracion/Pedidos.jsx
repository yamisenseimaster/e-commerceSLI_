import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiDownload,
  FiEdit2,
  FiEye,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import BarraLateral from './BarraLateral';
import { apiAdministracion, apiPedidos, apiPagos } from '../../servicios/api';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';

const pageSizes = [5, 10, 15];
const paymentOptions = ['Pending', 'Authorized', 'Paid', 'Failed'];
const orderOptions = [
  'Pending',
  'Processing',
  'Shipped',
  'Complete',
  'Canceled',
];

function Pedidos() {
  const { user: usuario } = usarAutenticacion();
  const [pedidos, establecerPedidos] = useState([]);
  const [cargando, establecerCargando] = useState(true);
  const [consulta, establecerConsulta] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [tamanoPagina, establecerTamanoPagina] = useState(5);
  const [pagina, establecerPagina] = useState(1);
  const [pedidoSeleccionado, establecerPedidoSeleccionado] = useState(null);
  const [modoModal, establecerModoModal] = useState(null);
  const [editValues, setEditValues] = useState({
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash',
  });
  const [enviando, establecerEnviando] = useState(false);
  const [payingOrder, setPayingOrder] = useState(null);

  const isAdmin = usuario?.role === 'admin';

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      'session_id',
    );
    const verification = sessionId
      ? apiPagos
          .verificar(sessionId)
          .then((pedido) => {
            toast.info(
              pedido.paymentStatus === 'Paid'
                ? 'Pago confirmado'
                : 'El pago sigue pendiente de confirmacion',
            );
            window.history.replaceState({}, '', '/orders');
          })
          .catch((error) => toast.error(error.message))
      : Promise.resolve();
    verification
      .then(() => apiPedidos.listar())
      .then((datos) => establecerPedidos(ordenarPedidos(datos)))
      .catch((error) =>
        toast.error(error.message || 'No se pudieron cargar los pedidos'),
      )
      .finally(() => establecerCargando(false));
  }, []);

  const payOrder = async (pedido) => {
    setPayingOrder(pedido.id);
    try {
      const pago = await apiPagos.crearIntento({ orderId: pedido.id });
      window.location.assign(pago.checkoutUrl);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPayingOrder(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const busqueda = consulta.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const matchesSearch =
        !busqueda ||
        [
          pedido.id,
          pedido.paymentMethod,
          pedido.status,
          pedido.paymentStatus,
          pedido.shippingAddress?.email,
          pedido.shippingAddress?.firstName,
          pedido.shippingAddress?.lastName,
        ]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(busqueda));
      const matchesStatus =
        statusFilter === 'all' ||
        pedido.status === statusFilter ||
        pedido.paymentStatus === statusFilter;
      const orderDate = fechaParaCampo(pedido.createdAt);
      const orderMonth = orderDate.slice(0, 7);
      const matchesDate = !dateFilter || orderDate === dateFilter;
      const matchesMonth = !monthFilter || orderMonth === monthFilter;
      return matchesSearch && matchesStatus && matchesDate && matchesMonth;
    });
  }, [dateFilter, monthFilter, pedidos, consulta, statusFilter]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filteredOrders.length / tamanoPagina),
  );
  const visibleOrders = filteredOrders.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina,
  );

  const openView = (pedido) => {
    establecerPedidoSeleccionado(pedido);
    establecerModoModal('view');
  };

  const openEdit = (pedido) => {
    establecerPedidoSeleccionado(pedido);
    setEditValues({
      status: pedido.status || 'Pending',
      paymentStatus: pedido.paymentStatus || 'Pending',
      paymentMethod: pedido.paymentMethod || 'Cash',
    });
    establecerModoModal('edit');
  };

  const openDelete = (pedido) => {
    establecerPedidoSeleccionado(pedido);
    establecerModoModal('delete');
  };

  const cerrarModal = () => {
    if (enviando) return;
    establecerPedidoSeleccionado(null);
    establecerModoModal(null);
  };

  const openFilterModal = () => {
    establecerModoModal('filter');
  };

  const clearDateFilters = () => {
    setDateFilter('');
    setMonthFilter('');
    setStatusFilter('all');
    establecerPagina(1);
  };

  const handleUpdate = async (evento) => {
    evento.preventDefault();
    if (!pedidoSeleccionado || !isAdmin) return;
    establecerEnviando(true);

    try {
      const guardado = await apiAdministracion.actualizarPedido(
        pedidoSeleccionado.id,
        editValues,
      );
      establecerPedidos((actual) =>
        ordenarPedidos(
          actual.map((pedido) =>
            pedido.id === guardado.id ? guardado : pedido,
          ),
        ),
      );
      toast.success('Pedido actualizado');
      cerrarModal();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el pedido');
    } finally {
      establecerEnviando(false);
    }
  };

  const manejarEliminacion = async () => {
    if (!pedidoSeleccionado || !isAdmin) return;
    establecerEnviando(true);

    try {
      await apiAdministracion.eliminarPedido(pedidoSeleccionado.id);
      establecerPedidos((actual) =>
        actual.filter((pedido) => pedido.id !== pedidoSeleccionado.id),
      );
      toast.success('Pedido eliminado');
      cerrarModal();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el pedido');
    } finally {
      establecerEnviando(false);
    }
  };

  const exportOrders = () => {
    const filas = [
      ['Pedido', 'Fecha', 'Pago', 'Total', 'Metodo', 'Estado', 'Cliente'],
      ...filteredOrders.map((pedido) => [
        etiquetaPedido(pedido),
        formatearFechaYHora(pedido.createdAt),
        traducirPago(pedido.paymentStatus),
        formatearDinero(pedido.total),
        traducirMetodo(pedido.paymentMethod),
        traducirEstadoPedido(pedido.status),
        nombreCliente(pedido),
      ]),
    ];

    const csv = filas
      .map((fila) =>
        fila.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'lista-de-pedidos.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BarraLateral title="Lista de pedidos" eyebrow="Tienda">
      <section className="rounded-[6px] border border-[#d9e0ea] bg-white p-5 shadow-sm shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-black text-[#162033] dark:text-white">
              Todos los pedidos
            </h2>
            <p className="text-[13px] font-medium text-[#7b8798]">
              Gestiona los pedidos de tus clientes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 w-[270px] items-center overflow-hidden rounded-[5px] border border-[#d9e0ea] bg-[#fbfcff] text-[#9aa6b8] dark:border-slate-700 dark:bg-slate-950">
              <span className="flex h-full w-11 items-center justify-center border-r border-[#d9e0ea] dark:border-slate-700">
                <FiSearch />
              </span>
              <input
                value={consulta}
                onChange={(evento) => {
                  establecerConsulta(evento.target.value);
                  establecerPagina(1);
                }}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] font-medium text-[#26344a] outline-none placeholder:text-[#a9b4c4] dark:text-white"
                placeholder="Ordenes de busqueda..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(evento) => {
                setStatusFilter(evento.target.value);
                establecerPagina(1);
              }}
              className="h-10 rounded-[5px] border border-[#d9e0ea] bg-white px-3 text-sm font-bold text-[#26344a] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="all">Todos</option>
              {orderOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {traducirEstadoPedido(estado)}
                </option>
              ))}
              {paymentOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {traducirPago(estado)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={openFilterModal}
              className="flex h-10 items-center gap-2 rounded-[5px] bg-main px-4 text-sm font-black text-white transition hover:bg-subMain">
              <FiFilter /> Filtrar
            </button>
            <button
              type="button"
              onClick={exportOrders}
              className="flex h-10 items-center gap-2 rounded-[5px] bg-[#27c8c2] px-4 text-sm font-black text-white transition hover:bg-[#16aaa4]">
              <FiDownload /> Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-[14px]">
            <thead className="bg-[#eef2f7] text-[12px] font-black text-[#26344a] dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-4 py-4">Identificacion del pedido</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Estado del pago</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Metodo de pago</th>
                <th className="px-4 py-4">Estado del pedido</th>
                <th className="px-4 py-4 text-center">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e0ea] bg-white dark:divide-slate-800 dark:bg-slate-900">
              {cargando && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center font-bold text-[#7b8798]">
                    Cargando pedidos...
                  </td>
                </tr>
              )}
              {!cargando &&
                visibleOrders.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className="transition hover:bg-[#f8fbff] dark:hover:bg-slate-800/60">
                    <td className="px-4 py-4 font-black text-[#26344a] dark:text-white">
                      {etiquetaPedido(pedido)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#26344a] dark:text-white">
                        {formatearFecha(pedido.createdAt)}
                      </p>
                      <p className="text-[12px] text-[#7b8798]">
                        {formatearHora(pedido.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <InsigniaEstado
                        type="payment"
                        value={pedido.paymentStatus}
                      />
                    </td>
                    <td className="px-4 py-4 font-bold text-[#26344a] dark:text-white">
                      {formatearDinero(pedido.total)}
                    </td>
                    <td className="px-4 py-4 text-[#26344a] dark:text-slate-200">
                      {traducirMetodo(pedido.paymentMethod)}
                    </td>
                    <td className="px-4 py-4">
                      <InsigniaEstado type="order" value={pedido.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <BotonAccion
                          color="text-main"
                          label="Ver"
                          onClick={() => openView(pedido)}>
                          <FiEye />
                        </BotonAccion>
                        {!isAdmin &&
                          pedido.paymentMethod === 'Stripe' &&
                          pedido.paymentStatus !== 'Paid' &&
                          pedido.status !== 'Canceled' && (
                            <button
                              type="button"
                              disabled={Boolean(payingOrder)}
                              onClick={() => payOrder(pedido)}
                              className="font-bold text-main disabled:opacity-50">
                              {payingOrder === pedido.id
                                ? 'Abriendo...'
                                : 'Pagar'}
                            </button>
                          )}
                        <BotonAccion
                          color="text-main"
                          label="Editar"
                          onClick={() => openEdit(pedido)}
                          disabled={!isAdmin}>
                          <FiEdit2 />
                        </BotonAccion>
                        <BotonAccion
                          color="text-flash"
                          label="Eliminar"
                          onClick={() => openDelete(pedido)}
                          disabled={!isAdmin}>
                          <FiTrash2 />
                        </BotonAccion>
                      </div>
                    </td>
                  </tr>
                ))}
              {!cargando && visibleOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center font-bold text-[#7b8798]">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={tamanoPagina}
              onChange={(evento) => {
                establecerTamanoPagina(Number(evento.target.value));
                establecerPagina(1);
              }}
              className="h-10 rounded-[5px] border border-[#d9e0ea] bg-white px-3 text-sm font-medium text-[#26344a] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
            <p className="text-sm font-medium text-[#7b8798]">
              Mostrando del{' '}
              {filteredOrders.length === 0
                ? 0
                : (pagina - 1) * tamanoPagina + 1}{' '}
              al {Math.min(pagina * tamanoPagina, filteredOrders.length)} de{' '}
              {filteredOrders.length} entradas
            </p>
          </div>

          <div className="flex items-center gap-1">
            <BotonPagina
              disabled={pagina === 1}
              onClick={() => establecerPagina(1)}>
              «
            </BotonPagina>
            <BotonPagina
              disabled={pagina === 1}
              onClick={() =>
                establecerPagina((actual) => Math.max(1, actual - 1))
              }>
              ‹
            </BotonPagina>
            {Array.from({ length: totalPaginas })
              .slice(0, 4)
              .map((_, indice) => {
                const valor = indice + 1;
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => establecerPagina(valor)}
                    className={`h-9 min-w-9 rounded-[4px] px-3 text-sm font-bold ${pagina === valor ? 'bg-main text-white' : 'border border-[#d9e0ea] bg-white text-[#64748b]'}`}>
                    {valor}
                  </button>
                );
              })}
            <BotonPagina
              disabled={pagina === totalPaginas}
              onClick={() =>
                establecerPagina((actual) => Math.min(totalPaginas, actual + 1))
              }>
              ›
            </BotonPagina>
            <BotonPagina
              disabled={pagina === totalPaginas}
              onClick={() => establecerPagina(totalPaginas)}>
              »
            </BotonPagina>
          </div>
        </div>
      </section>

      {pedidoSeleccionado && modoModal === 'view' && (
        <ModalPedido
          title={`Pedido ${etiquetaPedido(pedidoSeleccionado)}`}
          onClose={cerrarModal}>
          <DetallePedido order={pedidoSeleccionado} />
        </ModalPedido>
      )}

      {modoModal === 'filter' && (
        <ModalPedido title="Filtrar pedidos" onClose={cerrarModal} width={460}>
          <div className="space-y-4">
            <label className="block text-sm font-black text-[#26344a] dark:text-white">
              Ver pedidos de un dia exacto
              <input
                type="date"
                value={dateFilter}
                onChange={(evento) => {
                  setDateFilter(evento.target.value);
                  establecerPagina(1);
                }}
                className="mt-2 h-11 w-full rounded-[5px] border border-[#d9e0ea] bg-white px-3 text-sm font-bold text-[#26344a] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="block text-sm font-black text-[#26344a] dark:text-white">
              Ver pedidos de un mes
              <input
                type="month"
                value={monthFilter}
                onChange={(evento) => {
                  setMonthFilter(evento.target.value);
                  establecerPagina(1);
                }}
                className="mt-2 h-11 w-full rounded-[5px] border border-[#d9e0ea] bg-white px-3 text-sm font-bold text-[#26344a] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <div className="rounded-[6px] bg-[#f3f7ff] p-3 text-sm font-bold text-[#64748b]">
              Resultado actual: {filteredOrders.length} pedidos
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e7f0] pt-4">
              <button
                type="button"
                onClick={clearDateFilters}
                className="h-10 rounded-[5px] border border-[#d9e0ea] px-4 text-sm font-black text-[#26344a]">
                Limpiar
              </button>
              <button
                type="button"
                onClick={cerrarModal}
                className="h-10 rounded-[5px] bg-main px-4 text-sm font-black text-white">
                Aplicar filtro
              </button>
            </div>
          </div>
        </ModalPedido>
      )}

      {pedidoSeleccionado && modoModal === 'edit' && (
        <ModalPedido
          title={`Editar ${etiquetaPedido(pedidoSeleccionado)}`}
          onClose={cerrarModal}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <CampoSeleccion
              label="Estado del pago"
              name="paymentStatus"
              options={
                pedidoSeleccionado.paymentMethod === 'Cash'
                  ? paymentOptions
                  : [pedidoSeleccionado.paymentStatus]
              }
              value={editValues.paymentStatus}
              onChange={setEditValues}
              translate={traducirPago}
            />
            <CampoSeleccion
              label="Estado del pedido"
              name="status"
              options={orderOptions}
              value={editValues.status}
              onChange={setEditValues}
              translate={traducirEstadoPedido}
            />
            <p className="text-sm font-bold">
              Metodo de pago: {traducirMetodo(pedidoSeleccionado.paymentMethod)}
            </p>
            <div className="flex justify-end gap-3 border-t border-[#e1e7f0] pt-4">
              <button
                type="button"
                onClick={cerrarModal}
                className="h-10 rounded-[5px] border border-[#d9e0ea] px-4 text-sm font-black text-[#26344a]">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="h-10 rounded-[5px] bg-main px-4 text-sm font-black text-white disabled:opacity-60">
                {enviando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </ModalPedido>
      )}

      {pedidoSeleccionado && modoModal === 'delete' && (
        <ModalPedido title="Eliminar pedido" onClose={cerrarModal} width={430}>
          <div className="rounded-[6px] bg-red-50 p-4 text-sm font-bold text-red-700">
            Se eliminara el pedido{' '}
            <span className="font-black">
              {etiquetaPedido(pedidoSeleccionado)}
            </span>
            . Esta accion no se puede deshacer.
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={cerrarModal}
              className="h-10 rounded-[5px] border border-[#d9e0ea] px-4 text-sm font-black text-[#26344a]">
              Cancelar
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={manejarEliminacion}
              className="flex h-10 items-center gap-2 rounded-[5px] bg-flash px-4 text-sm font-black text-white disabled:opacity-60">
              <FiTrash2 /> {enviando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </ModalPedido>
      )}
    </BarraLateral>
  );
}

function ModalPedido({
  children: hijos,
  onClose: alCerrar,
  title: titulo,
  width = 620,
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
        className="relative z-[1] w-full overflow-hidden rounded-[8px] bg-white shadow-2xl dark:bg-slate-900"
        style={{ maxWidth: width }}>
        <header className="flex items-center justify-between border-b border-[#e1e7f0] px-5 py-4 dark:border-slate-800">
          <h3 className="text-[20px] font-black text-[#162033] dark:text-white">
            {titulo}
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f7ff] text-[#64748b]">
            <FiX />
          </button>
        </header>
        <div className="scrollbar-invisible max-h-[70vh] overflow-y-auto p-5">
          {hijos}
        </div>
      </section>
    </div>
  );
}

function DetallePedido({ order: pedido }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Informacion label="Cliente" value={nombreCliente(pedido)} />
        <Informacion
          label="Email"
          value={pedido.shippingAddress?.email || 'Sin email'}
        />
        <Informacion
          label="Telefono"
          value={pedido.shippingAddress?.phone || 'Sin telefono'}
        />
        <Informacion
          label="Direccion"
          value={formatearDireccion(pedido.shippingAddress)}
        />
        <Informacion label="Pago" value={traducirPago(pedido.paymentStatus)} />
        <Informacion
          label="Estado"
          value={traducirEstadoPedido(pedido.status)}
        />
      </div>

      <div className="rounded-[6px] border border-[#d9e0ea]">
        {(pedido.items || []).map((elemento) => (
          <div
            key={`${pedido.id}-${elemento.productId}`}
            className="flex items-center justify-between gap-3 border-b border-[#e1e7f0] px-4 py-3 last:border-b-0">
            <div>
              <p className="font-black text-[#26344a]">{elemento.title}</p>
              <p className="text-sm text-[#7b8798]">
                Cantidad: {elemento.quantity}
              </p>
            </div>
            <p className="font-black text-[#162033]">
              {formatearDinero(
                Number(elemento.unitPrice ?? elemento.price ?? 0) *
                  Number(elemento.quantity || 0),
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampoSeleccion({
  label: etiqueta,
  name: nombre,
  onChange: alCambiar,
  options: opciones,
  translate,
  value: valor,
}) {
  return (
    <label className="block text-sm font-black text-[#26344a] dark:text-white">
      {etiqueta}
      <select
        value={valor}
        onChange={(evento) =>
          alCambiar((actual) => ({ ...actual, [nombre]: evento.target.value }))
        }
        className="mt-2 h-11 w-full rounded-[5px] border border-[#d9e0ea] bg-white px-3 text-sm font-bold text-[#26344a] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        {opciones.map((option) => (
          <option key={option} value={option}>
            {translate(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Informacion({ label: etiqueta, value: valor }) {
  return (
    <div className="rounded-[6px] bg-[#f3f7ff] p-3">
      <p className="text-[11px] font-black uppercase text-[#9aa6b8]">
        {etiqueta}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#26344a]">
        {valor}
      </p>
    </div>
  );
}

function BotonAccion({
  children: hijos,
  color,
  disabled: deshabilitado,
  label: etiqueta,
  onClick: alHacerClic,
}) {
  return (
    <button
      type="button"
      disabled={deshabilitado}
      title={etiqueta}
      onClick={alHacerClic}
      className={`text-[16px] transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 ${color}`}>
      {hijos}
    </button>
  );
}

function InsigniaEstado({ type, value: valor }) {
  const pago = {
    Paid: 'border-cyan-200 bg-cyan-50 text-[#27c8c2]',
    Authorized: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    Pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    Failed: 'border-pink-200 bg-pink-50 text-pink-600',
  };
  const pedido = {
    Shipped: 'border-sky-200 bg-sky-50 text-sky-600',
    Processing: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    Pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    Complete: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    Canceled: 'border-pink-200 bg-pink-50 text-pink-600',
  };
  const etiqueta =
    type === 'payment' ? traducirPago(valor) : traducirEstadoPedido(valor);
  const classes = type === 'payment' ? pago[valor] : pedido[valor];
  return (
    <span
      className={`inline-flex rounded-[4px] border px-2 py-1 text-[11px] font-black ${classes || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {etiqueta}
    </span>
  );
}

function BotonPagina({
  children: hijos,
  disabled: deshabilitado,
  onClick: alHacerClic,
}) {
  return (
    <button
      type="button"
      disabled={deshabilitado}
      onClick={alHacerClic}
      className="h-9 min-w-9 rounded-[4px] border border-[#d9e0ea] bg-[#f3f6fa] px-3 text-sm font-bold text-[#64748b] disabled:opacity-50">
      {hijos}
    </button>
  );
}

function ordenarPedidos(pedidos) {
  return [...pedidos].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

function etiquetaPedido(pedido) {
  return `#${String(pedido.id || '')
    .slice(0, 8)
    .toUpperCase()}`;
}

function nombreCliente(pedido) {
  const address = pedido.shippingAddress || {};
  return (
    [address.firstName, address.lastName].filter(Boolean).join(' ') ||
    address.email ||
    'Cliente'
  );
}

function formatearDireccion(address) {
  if (!address) return 'Sin direccion';
  if (typeof address === 'string') return address;
  return (
    [address.street, address.city, address.country, address.zip]
      .filter(Boolean)
      .join(', ') || 'Sin direccion'
  );
}

function formatearDinero(valor) {
  return `$${Number(valor || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatearFecha(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatearHora(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fechaParaCampo(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function formatearFechaYHora(valor) {
  if (!valor) return '-';
  return `${formatearFecha(valor)} ${formatearHora(valor)}`;
}

function traducirPago(estado) {
  const labels = {
    Paid: 'Pagado',
    Authorized: 'En espera de autorizacion',
    Pending: 'Pendiente',
    Failed: 'Pago fallido',
  };
  return labels[estado] || estado || 'Pendiente';
}

function traducirEstadoPedido(estado) {
  const labels = {
    Pending: 'Pendiente',
    Processing: 'Procesamiento',
    Shipped: 'Enviado',
    Complete: 'Entregado',
    Canceled: 'Cancelado',
  };
  return labels[estado] || estado || 'Pendiente';
}

function traducirMetodo(method) {
  const labels = {
    Cash: 'Efectivo',
    Stripe: 'Tarjeta de credito',
    PayPal: 'Paypal',
    Crypto: 'Cripto',
    Visa: 'Visa',
    Mastercard: 'Tarjeta maestra',
  };
  return labels[method] || method || 'Efectivo';
}

export default Pedidos;
