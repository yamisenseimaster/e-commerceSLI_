import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { apiCarrito } from '../servicios/api';
import { usarAutenticacion } from './ContextoAutenticacion';

const ContextoCarrito = createContext();

function ProveedorCarrito({ children: hijos }) {
  const { isAuthenticated: estaAutenticado, user: usuario } =
    usarAutenticacion();
  const [carrito, establecerCarrito] = useState({ items: [], total: 0 });

  const recargarCarrito = useCallback(async () => {
    if (!estaAutenticado) {
      establecerCarrito({ items: [], total: 0 });
      return;
    }

    const datos = await apiCarrito.obtener();
    establecerCarrito(datos);
  }, [estaAutenticado, usuario?.id]);

  useEffect(() => {
    recargarCarrito().catch(() => establecerCarrito({ items: [], total: 0 }));
  }, [recargarCarrito]);

  const agregarAlCarrito = useCallback(
    async (idProducto, cantidad = 1) => {
      if (!estaAutenticado) {
        toast.error('Inicia sesion para agregar productos al carrito', {
          toastId: 'login-required-cart',
        });
        return null;
      }

      const datos = await apiCarrito.agregar({
        productId: idProducto,
        quantity: cantidad,
      });
      establecerCarrito(datos);
      toast.success('Producto agregado al carrito', {
        toastId: `cart-add-${idProducto}`,
      });
      return datos;
    },
    [estaAutenticado],
  );

  const actualizarCantidad = useCallback(async (idProducto, cantidad) => {
    const datos = await apiCarrito.actualizar(idProducto, cantidad);
    establecerCarrito(datos);
    return datos;
  }, []);

  const quitarDelCarrito = useCallback(
    async (idProducto) => {
      await apiCarrito.eliminar(idProducto);
      await recargarCarrito();
    },
    [recargarCarrito],
  );

  const cantidadArticulos = carrito.items.reduce(
    (suma, elemento) => suma + elemento.quantity,
    0,
  );

  const valor = useMemo(
    () => ({
      cart: carrito,
      itemCount: cantidadArticulos,
      addToCart: agregarAlCarrito,
      updateQuantity: actualizarCantidad,
      removeFromCart: quitarDelCarrito,
      refreshCart: recargarCarrito,
    }),
    [
      carrito,
      cantidadArticulos,
      agregarAlCarrito,
      actualizarCantidad,
      quitarDelCarrito,
      recargarCarrito,
    ],
  );

  return (
    <ContextoCarrito.Provider value={valor}>{hijos}</ContextoCarrito.Provider>
  );
}
export { ProveedorCarrito };

function usarCarrito() {
  const context = useContext(ContextoCarrito);

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }

  return context;
}
export { usarCarrito };
