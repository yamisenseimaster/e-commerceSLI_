import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiProductos } from '../servicios/api';
const ContextoProductos = createContext();
function ProveedorProductos({
  children: hijos
}) {
  const [productos, establecerProductos] = useState([]);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState(null);
  useEffect(() => {
    apiProductos.listar().then(datos => {
      establecerProductos(datos);
      establecerError(null);
    }).catch(error => {
      establecerError(error.message);
    }).finally(() => establecerCargando(false));
  }, []);
  const valor = useMemo(() => ({
    products: productos,
    establecerProductos: establecerProductos,
    loading: cargando,
    error
  }), [productos, cargando, error]);
  return <ContextoProductos.Provider value={valor}>
      {hijos}
    </ContextoProductos.Provider>;
}
export { ProveedorProductos };
function usarProductos() {
  const contexto = useContext(ContextoProductos);
  if (!contexto) {
    throw new Error("Este contexto debe usarse dentro de su proveedor.");
  }
  return contexto;
}
export { usarProductos };
