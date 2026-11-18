import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const ContextoTema = createContext();

const defaultTheme = {
  mode: 'light',
  accent: '#00b894',
  sidebar: 'default',
};

const CLAVE_TEMA = 'dashboardThemeV2';

function ProveedorTema({ children: hijos }) {
  const [tema, establecerTema] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_TEMA);

    if (!guardado) return defaultTheme;

    try {
      return {
        ...defaultTheme,
        ...JSON.parse(guardado),
        accent: defaultTheme.accent,
        sidebar: defaultTheme.sidebar,
      };
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    localStorage.setItem(CLAVE_TEMA, JSON.stringify(tema));
    document.documentElement.dataset.dashboardMode = tema.mode;
    document.documentElement.classList.toggle('dark', tema.mode === 'dark');
    document.documentElement.style.setProperty('--dash-accent', tema.accent);
  }, [tema]);

  const valor = useMemo(
    () => ({
      theme: tema,
      setMode: (modo) =>
        establecerTema((actual) => ({ ...actual, mode: modo })),
    }),
    [tema],
  );

  return <ContextoTema.Provider value={valor}>{hijos}</ContextoTema.Provider>;
}
export { ProveedorTema };

function usarAjustesTema() {
  const context = useContext(ContextoTema);

  if (!context) {
    throw new Error('usarAjustesTema debe usarse dentro de ProveedorTema');
  }

  return context;
}
export { usarAjustesTema };
