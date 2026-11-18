import React, { useState, useMemo, useCallback, createContext } from 'react';

// Crear el contexto para las ventanas.
const ContextoBarraLateral = createContext();
export { ContextoBarraLateral };

const ProveedorVentanas = ({ children: hijos }) => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleCartDrawer = useCallback(
    () => setCartDrawerOpen((open) => !open),
    [],
  );
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const toggleMobileDrawer = useCallback(
    () => setMobileDrawerOpen((open) => !open),
    [],
  );
  const closeMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);

  const valor = useMemo(
    () => ({
      cartDrawerOpen,
      toggleCartDrawer,
      closeCartDrawer,
      mobileDrawerOpen,
      toggleMobileDrawer,
      closeMobileDrawer,
    }),

    [
      cartDrawerOpen,
      toggleCartDrawer,
      closeCartDrawer,
      mobileDrawerOpen,
      toggleMobileDrawer,
      closeMobileDrawer,
    ],
  );

  return (
    <ContextoBarraLateral.Provider value={valor}>
      {hijos}
    </ContextoBarraLateral.Provider>
  );
};
export { ProveedorVentanas };
