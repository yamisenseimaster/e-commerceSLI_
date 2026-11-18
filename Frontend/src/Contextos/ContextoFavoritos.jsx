import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { usarAutenticacion } from './ContextoAutenticacion';

const ContextoFavoritos = createContext();
const CLAVE_ANTERIOR = 'replayFavoriteProductsV1';
const EVENTO_FAVORITOS_REQUIERE_SESION = 'favorites-login-required';
export { EVENTO_FAVORITOS_REQUIERE_SESION };

function leerFavoritos(claveAlmacenamiento) {
  if (!claveAlmacenamiento) return [];

  try {
    let guardado = localStorage.getItem(claveAlmacenamiento);
    if (guardado === null) {
      // Conserva los favoritos anteriores para la primera cuenta que inicie sesión.
      guardado = localStorage.getItem(CLAVE_ANTERIOR);
      if (guardado !== null) {
        localStorage.setItem(claveAlmacenamiento, guardado);
        localStorage.removeItem(CLAVE_ANTERIOR);
      }
    }
    const ids = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

function ProveedorFavoritos({ children: hijos }) {
  const { user: usuario } = usarAutenticacion();
  const userId = usuario?.id ?? usuario?._id ?? usuario?.email;
  const claveAlmacenamiento = userId
    ? `replayFavoriteProductsV2:${userId}`
    : null;
  const [revision, setRevision] = useState(0);
  const idsFavoritos = useMemo(
    () => leerFavoritos(claveAlmacenamiento),
    [claveAlmacenamiento, revision],
  );

  const persistFavorites = useCallback(
    (nextIds) => {
      if (!claveAlmacenamiento) return;
      localStorage.setItem(claveAlmacenamiento, JSON.stringify(nextIds));
      setRevision((actual) => actual + 1);
    },
    [claveAlmacenamiento],
  );

  const toggleFavorite = useCallback(
    (producto) => {
      const idProducto = obtenerIdProducto(producto);
      if (!idProducto) return;
      if (!claveAlmacenamiento) {
        window.dispatchEvent(
          new CustomEvent(EVENTO_FAVORITOS_REQUIERE_SESION, {
            detail: { product: producto },
          }),
        );
        return;
      }

      const exists = idsFavoritos.includes(idProducto);
      const nextIds = exists
        ? idsFavoritos.filter((identificador) => identificador !== idProducto)
        : [idProducto, ...idsFavoritos];
      persistFavorites(nextIds);

      const toastId = `favorite-${idProducto}`;
      const mensaje = exists
        ? 'Producto quitado de favoritos'
        : 'Producto agregado a favoritos';
      const type = exists ? 'info' : 'success';
      if (toast.isActive(toastId)) {
        toast.update(toastId, { render: mensaje, type, autoClose: 2100 });
      } else {
        toast(mensaje, { toastId, type });
      }
    },
    [idsFavoritos, persistFavorites, claveAlmacenamiento],
  );

  const addFavorite = useCallback(
    (producto) => {
      const idProducto = obtenerIdProducto(producto);
      if (
        !claveAlmacenamiento ||
        !idProducto ||
        idsFavoritos.includes(idProducto)
      )
        return;
      persistFavorites([idProducto, ...idsFavoritos]);
      toast.success('Producto agregado a favoritos', {
        toastId: `favorite-${idProducto}`,
      });
    },
    [idsFavoritos, persistFavorites, claveAlmacenamiento],
  );

  const removeFavorite = useCallback(
    (idProducto) => {
      persistFavorites(
        idsFavoritos.filter(
          (identificador) => identificador !== String(idProducto),
        ),
      );
    },
    [idsFavoritos, persistFavorites],
  );

  const clearFavorites = useCallback(() => {
    persistFavorites([]);
  }, [persistFavorites]);

  const valor = useMemo(
    () => ({
      favoriteCount: idsFavoritos.length,
      favoriteIds: idsFavoritos,
      addFavorite,
      clearFavorites,
      isFavorite: (idProducto) => idsFavoritos.includes(String(idProducto)),
      removeFavorite,
      toggleFavorite,
    }),
    [addFavorite, clearFavorites, idsFavoritos, removeFavorite, toggleFavorite],
  );

  return (
    <ContextoFavoritos.Provider value={valor}>
      {hijos}
    </ContextoFavoritos.Provider>
  );
}
export { ProveedorFavoritos };

function usarFavoritos() {
  const context = useContext(ContextoFavoritos);

  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }

  return context;
}
export { usarFavoritos };

function obtenerIdProducto(producto) {
  return String(producto?.id || producto?._id || '');
}
