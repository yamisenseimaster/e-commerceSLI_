import React, { useMemo, useState } from 'react';
import Filtro from '../componentes/Filtro';
import Productos from '../componentes/Productos';
import Estructura from '../estructura/Estructura';
import Cabecera from './../componentes/Cabecera';
import { useParams } from 'react-router-dom';
import { usarProductos } from '../Contextos/ContextoProductos';
import BuscadorProductos from '../componentes/BuscadorProductos';
import { buscarProductos } from '../utilidades/busquedaProductos';
import { traducirCategoria } from '../utilidades/localizacion';

function PaginaCategoria() {
  let { category: categoria } = useParams();
  const { products: productos, loading: cargando } = usarProductos();
  const [consulta, establecerConsulta] = useState('');

  const Datas = useMemo(
    () =>
      buscarProductos(
        productos.filter((producto) => producto.type === categoria),
        consulta,
      ),
    [categoria, productos, consulta],
  );

  return (
    <Estructura>
      <div className="min-h-screen bg-[#f7f4ef] py-6 text-[#111827] dark:bg-[#111111] dark:text-[#f4f4f5]">
        <div className="container mx-auto px-4">
          <section className="mb-6 rounded-[24px] bg-white p-5 shadow-sm dark:bg-[#181818] sm:p-7">
            <Cabecera title={traducirCategoria(categoria)} />
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Filtro total={Datas?.length} />
              <BuscadorProductos
                className="h-11 w-full lg:max-w-[380px]"
                onChange={establecerConsulta}
                onSubmit={establecerConsulta}
                placeholder={`Buscar en ${traducirCategoria(categoria)}...`}
                searchScope={categoria}
                value={consulta}
              />
            </div>
          </section>
          <div className="grid sm:mt-10 mt-6 xl:grid-cols-4 2xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {cargando && <p className="font-semibold">Cargando productos...</p>}
            {!cargando &&
              Datas.map((p) => <Productos bg={true} key={p._id} product={p} />)}
            {!cargando && Datas.length === 0 && (
              <div className="col-span-full rounded-[16px] border border-dashed border-[#d9e0ea] bg-white px-6 py-12 text-center shadow-sm dark:border-[#303030] dark:bg-[#181818]">
                <p className="text-[18px] font-black">
                  No hay productos en esta busqueda.
                </p>
                <p className="mt-2 text-sm font-medium text-[#7b8798]">
                  Cambia el texto o vuelve a la tienda para elegir otra
                  categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Estructura>
  );
}

export default PaginaCategoria;
