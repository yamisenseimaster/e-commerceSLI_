import React from 'react';
import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../Contextos/ContextoAutenticacion';
function RutaProtegida({
  children: hijos,
  soloAdministrador = false
}) {
  const {
    user: usuario,
    estaAutenticado: estaAutenticado,
    verificandoSesion: verificandoSesion
  } = usarAutenticacion();
  if (verificandoSesion) {
    return <div className="p-10 font-semibold">Comprobando sesión...</div>;
  }
  if (!estaAutenticado || (soloAdministrador && usuario?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  return hijos;
}
export default RutaProtegida;
