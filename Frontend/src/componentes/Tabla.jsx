import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoEye } from 'react-icons/go';
import { RiDeleteBinLine } from 'react-icons/ri';
import { apiPedidos } from '../servicios/api';
import { usarAutenticacion } from '../Contextos/ContextoAutenticacion';

function Tabla({ number }) {
  const { isAuthenticated: estaAutenticado } = usarAutenticacion();
  const [pedidos, establecerPedidos] = useState([]);
  const [cargando, establecerCargando] = useState(false);
  const Cabecera = 'text-xs font-semibold px-6 py-2 uppercase';
  const Text = 'px-5 text-sm py-3 leading-6 whitespace-nowrap';
  const badge = ' py-1 px-2 rounded-full text-xs font-semibold';

  useEffect(() => {
    if (!estaAutenticado) return;

    establecerCargando(true);
    apiPedidos
      .listar()
      .then(establecerPedidos)
      .catch(() => establecerPedidos([]))
      .finally(() => establecerCargando(false));
  }, [estaAutenticado]);

  const OrdersDash = pedidos?.slice(0, number);

  const Rows = ({ order: pedido }, number) => {
    return (
      <tr key={pedido.id}>
        <td className={`${Text} font-medium`}>{pedido.id.slice(0, 8)}</td>
        <td className={`${Text} text-center`}>
          {new Date(pedido.createdAt).toLocaleDateString('es-ES')}
        </td>

        <td className={`${Text} text-center`}>{pedido.paymentMethod}</td>
        <td className={`${Text} text-center`}>
          {pedido.status === 'Complete' && (
            <span className={`${badge} text-subMain bg-green-100`}>
              Completado
            </span>
          )}
          {pedido.status === 'Pending' && (
            <span className={`${badge} text-star bg-orange-100`}>
              Pendiente
            </span>
          )}
          {pedido.status === 'Canceled' && (
            <span className={`${badge} text-flash bg-red-100`}>Cancelado</span>
          )}
        </td>
        <td className={`${Text} font-bold text-center`}>${pedido.total}.00</td>
        <td className={`${Text} float-right flex gap-2`}>
          {!number && (
            <button className="border text-flash border-flash rounded flex-colo w-6 h-6">
              <RiDeleteBinLine />
            </button>
          )}

          <Link
            to={`/order`}
            className="border text-main border-main rounded flex-colo w-6 h-6">
            <GoEye />
          </Link>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full relative overflow-hidden overflow-x-scroll">
      <table className="table-auto min-w-full border border-deepest divide-y divide-gray-200">
        <thead>
          <tr className="bg-deepest">
            <th scope="col" className={`${Cabecera} text-left`}>
              ID
            </th>
            <th scope="col" className={`${Cabecera} text-center`}>
              Fecha
            </th>

            <th scope="col" className={`${Cabecera} text-center`}>
              Metodo
            </th>
            <th scope="col" className={`${Cabecera} text-center`}>
              Estado
            </th>
            <th scope="col" className={`${Cabecera} text-center`}>
              Total
            </th>
            <th scope="col" className={`${Cabecera} text-end`}>
              Accion
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-deepest">
          {cargando && (
            <tr>
              <td className={Text} colSpan={6}>
                Cargando pedidos...
              </td>
            </tr>
          )}
          {!cargando &&
            (number
              ? OrdersDash.map((pedido) => Rows({ order: pedido }, number))
              : pedidos.map((pedido) => Rows({ order: pedido }, number)))}
          {!cargando && pedidos.length === 0 && (
            <tr>
              <td className={Text} colSpan={6}>
                No se encontraron pedidos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tabla;
