import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiAutenticacion as autenticacionApi } from '../servicios/api';
const ContextoAutenticacion = createContext();
function ProveedorAutenticacion({
  children: hijos
}) {
  const [usuario, establecerUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('authUser');
      return guardado && localStorage.getItem('authToken') ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });
  const [verificandoSesion, establecerVerificacionSesion] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      establecerVerificacionSesion(false);
      return;
    }
    autenticacionApi.me().then(establecerUsuario).catch(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      establecerUsuario(null);
    }).finally(() => establecerVerificacionSesion(false));
  }, []);
  const guardarSesion = useCallback(sesion => {
    localStorage.setItem('authToken', sesion.token);
    localStorage.setItem('authUser', JSON.stringify(sesion.user));
    establecerUsuario(sesion.user);
  }, []);
  const iniciarSesion = useCallback(async credenciales => {
    const sesion = await autenticacionApi.iniciarSesion(credenciales);
    guardarSesion(sesion);
    return sesion.user;
  }, [guardarSesion]);
  const registrar = useCallback(async valores => {
    const sesion = await autenticacionApi.registrar(valores);
    guardarSesion(sesion);
    return sesion.user;
  }, [guardarSesion]);
  const solicitudLoginCodigo = useCallback(valores => autenticacionApi.solicitarCodigo(valores), []);
  const loginConCodigo = useCallback(async valores => {
    const sesion = await autenticacionApi.verificarCodigo(valores);
    guardarSesion(sesion);
    return sesion.user;
  }, [guardarSesion]);
  const loginConSocial = useCallback(async (proveedor, valores) => {
    const sesion = await autenticacionApi[proveedor](valores);
    guardarSesion(sesion);
    return sesion.user;
  }, [guardarSesion]);
  const actualizarPerfil = useCallback(async valores => {
    const actualizadoUsuario = await autenticacionApi.actualizarPerfil(valores);
    localStorage.setItem('authUser', JSON.stringify(actualizadoUsuario));
    establecerUsuario(actualizadoUsuario);
    return actualizadoUsuario;
  }, []);
  const subirAvatar = useCallback(async urlDatos => {
    const actualizadoUsuario = await autenticacionApi.subirAvatar(urlDatos);
    localStorage.setItem('authUser', JSON.stringify(actualizadoUsuario));
    establecerUsuario(actualizadoUsuario);
    return actualizadoUsuario;
  }, []);
  const cambiarContrasena = useCallback(async valores => {
    const sesion = await autenticacionApi.cambiarContrasena(valores);
    guardarSesion(sesion);
    return sesion;
  }, [guardarSesion]);
  const cerrarSesion = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (token) autenticacionApi.cerrarSesion(token).catch(() => {});
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
  const valor = useMemo(() => ({
    user: usuario,
    verificandoSesion: verificandoSesion,
    estaAutenticado: Boolean(usuario),
    iniciarSesion: iniciarSesion,
    registrar: registrar,
    solicitarCodigoAcceso: solicitudLoginCodigo,
    iniciarSesionConCodigo: loginConCodigo,
    iniciarSesionSocial: loginConSocial,
    actualizarPerfil: actualizarPerfil,
    subirAvatar: subirAvatar,
    cambiarContrasena: cambiarContrasena,
    cerrarSesion: cerrarSesion
  }), [usuario, verificandoSesion, iniciarSesion, registrar, solicitudLoginCodigo, loginConCodigo, loginConSocial, actualizarPerfil, subirAvatar, cambiarContrasena, cerrarSesion]);
  return <ContextoAutenticacion.Provider value={valor}>{hijos}</ContextoAutenticacion.Provider>;
}
export { ProveedorAutenticacion };
function usarAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error("Este contexto debe usarse dentro de su proveedor.");
  }
  return contexto;
}
export { usarAutenticacion };
