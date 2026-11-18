import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiAutenticacion } from '../servicios/api';

const ContextoAutenticacion = createContext();

function ProveedorAutenticacion({ children: hijos }) {
  const [usuario, establecerUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('authUser');
      return guardado && localStorage.getItem('authToken')
        ? JSON.parse(guardado)
        : null;
    } catch {
      return null;
    }
  });
  const [verificandoSesion, establecerVerificandoSesion] = useState(true);

  useEffect(() => {
    const credencial = localStorage.getItem('authToken');

    if (!credencial) {
      establecerVerificandoSesion(false);
      return;
    }

    apiAutenticacion
      .consultarPerfil()
      .then(establecerUsuario)
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        establecerUsuario(null);
      })
      .finally(() => establecerVerificandoSesion(false));
  }, []);

  const guardarSesion = useCallback((sesion) => {
    localStorage.setItem('authToken', sesion.token);
    localStorage.setItem('authUser', JSON.stringify(sesion.user));
    establecerUsuario(sesion.user);
  }, []);

  const iniciarSesion = useCallback(
    async (credenciales) => {
      const sesion = await apiAutenticacion.iniciarSesion(credenciales);
      guardarSesion(sesion);
      return sesion.user;
    },
    [guardarSesion],
  );

  const registrar = useCallback(
    async (valores) => {
      const sesion = await apiAutenticacion.registrar(valores);
      guardarSesion(sesion);
      return sesion.user;
    },
    [guardarSesion],
  );

  const solicitarCodigoAcceso = useCallback(
    (valores) => apiAutenticacion.solicitarCodigo(valores),
    [],
  );

  const iniciarSesionConCodigo = useCallback(
    async (valores) => {
      const sesion = await apiAutenticacion.verificarCodigo(valores);
      guardarSesion(sesion);
      return sesion.user;
    },
    [guardarSesion],
  );

  const iniciarSesionSocial = useCallback(
    async (proveedor, valores) => {
      const sesion = await apiAutenticacion[proveedor](valores);
      guardarSesion(sesion);
      return sesion.user;
    },
    [guardarSesion],
  );

  const actualizarPerfil = useCallback(async (valores) => {
    const usuarioActualizado = await apiAutenticacion.actualizarPerfil(valores);
    localStorage.setItem('authUser', JSON.stringify(usuarioActualizado));
    establecerUsuario(usuarioActualizado);
    return usuarioActualizado;
  }, []);

  const subirAvatar = useCallback(async (dataUrl) => {
    const usuarioActualizado = await apiAutenticacion.subirAvatar(dataUrl);
    localStorage.setItem('authUser', JSON.stringify(usuarioActualizado));
    establecerUsuario(usuarioActualizado);
    return usuarioActualizado;
  }, []);

  const cambiarContrasena = useCallback(
    async (valores) => {
      const sesion = await apiAutenticacion.cambiarContrasena(valores);
      guardarSesion(sesion);
      return sesion;
    },
    [guardarSesion],
  );

  const cerrarSesion = useCallback(() => {
    apiAutenticacion.cerrarSesion().catch(() => {});
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    establecerUsuario(null);
  }, []);

  useEffect(() => {
    const limpiarSesion = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      establecerUsuario(null);
    };
    window.addEventListener('auth-expired', limpiarSesion);
    return () => window.removeEventListener('auth-expired', limpiarSesion);
  }, []);

  const valor = useMemo(
    () => ({
      user: usuario,
      checkingSession: verificandoSesion,
      isAuthenticated: Boolean(usuario),
      login: iniciarSesion,
      register: registrar,
      requestLoginCode: solicitarCodigoAcceso,
      loginWithCode: iniciarSesionConCodigo,
      loginWithSocial: iniciarSesionSocial,
      updateProfile: actualizarPerfil,
      uploadAvatar: subirAvatar,
      changePassword: cambiarContrasena,
      logout: cerrarSesion,
    }),
    [
      usuario,
      verificandoSesion,
      iniciarSesion,
      registrar,
      solicitarCodigoAcceso,
      iniciarSesionConCodigo,
      iniciarSesionSocial,
      actualizarPerfil,
      subirAvatar,
      cambiarContrasena,
      cerrarSesion,
    ],
  );

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {hijos}
    </ContextoAutenticacion.Provider>
  );
}
export { ProveedorAutenticacion };

function usarAutenticacion() {
  const context = useContext(ContextoAutenticacion);

  if (!context) {
    throw new Error(
      'usarAutenticacion debe usarse dentro de ProveedorAutenticacion',
    );
  }

  return context;
}
export { usarAutenticacion };
