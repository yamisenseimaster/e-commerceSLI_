import React from 'react';
import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../Contextos/ContextoAutenticacion';

function RutaProtegida({
  children: hijos,
  adminOnly: soloAdministrador = false,
  customerRedirect: redirigirCliente = false,
}) {
  const {
    user: usuario,
    isAuthenticated: estaAutenticado,
    checkingSession: verificandoSesion,
  } = usarAutenticacion();

  if (verificandoSesion) {
    return <div className="p-10 font-semibold">Comprobando sesión...</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  if (soloAdministrador && usuario?.role !== 'admin') {
    return <Navigate to="/orders" replace />;
  }

  if (redirigirCliente && usuario?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return hijos;
}

export default RutaProtegida;
