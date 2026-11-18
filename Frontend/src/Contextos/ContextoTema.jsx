import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
const ContextoTema = createContext();
const predeterminadoTema = {
  mode: 'light',
  accent: '#00b894',
  sidebar: 'default'
};
const CLAVE = 'dashboardThemeV2';
function ProveedorTema({
  children: hijos
}) {
  const [tema, establecerTema] = useState(() => {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) return predeterminadoTema;
    try {
      return {
        ...predeterminadoTema,
        ...JSON.parse(guardado),
        accent: predeterminadoTema.accent,
        sidebar: predeterminadoTema.sidebar
      };
    } catch {
      return predeterminadoTema;
    }
  });
  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(tema));
    document.documentElement.dataset.dashboardMode = tema.mode;
    document.documentElement.classList.toggle('dark', tema.mode === 'dark');
    document.documentElement.style.setProperty('--dash-accent', tema.accent);
  }, [tema]);
  const valor = useMemo(() => ({
    theme: tema,
    establecerModo: modo => establecerTema(actual => ({
      ...actual,
      mode: modo
    }))
  }), [tema]);
  return <ContextoTema.Provider value={valor}>{hijos}</ContextoTema.Provider>;
}
export { ProveedorTema };
function usarAjustesTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error("Este contexto debe usarse dentro de su proveedor.");
  }
  return contexto;
}
export { usarAjustesTema };
