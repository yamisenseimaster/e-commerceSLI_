import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiProductos } from '../servicios/api';
import DatosProductos from '../datos/catalogoInicial.json';
import { traducirCatalogo } from '../utilidades/localizacion';

const ContextoProductos = createContext();

function ProveedorProductos({ children: hijos }) {
  const [productos, establecerProductos] = useState(() =>
    traducirCatalogo(DatosProductos),
  );
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState(null);

  useEffect(() => {
    apiProductos
      .listar()
      .then((datos) => {
        establecerProductos(datos);
        establecerError(null);
      })
      .catch((fallo) => {
        establecerError(fallo.message);
      })
      .finally(() => establecerCargando(false));
  }, []);

  const valor = useMemo(
    () => ({
      products: productos,
      setProducts: establecerProductos,
      loading: cargando,
      error,
    }),
    [productos, cargando, error],
  );

  return (
    <ContextoProductos.Provider value={valor}>
      {hijos}
    </ContextoProductos.Provider>
  );
}
export { ProveedorProductos };

function usarProductos() {
  const context = useContext(ContextoProductos);

  if (!context) {
    throw new Error('usarProductos debe usarse dentro de ProveedorProductos');
  }

  return context;
}
export { usarProductos };
