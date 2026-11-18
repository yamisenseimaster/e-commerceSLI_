import React, { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InicioSesion from './componentes/Modales/InicioSesion';
import { usarAutenticacion } from './Contextos/ContextoAutenticacion';
import DesplazarAlInicio from './DesplazarAlInicio';
import RutaProtegida from './componentes/RutaProtegida';
const PanelAdministracion = lazy(() => import('./pantallas/Administracion/Administracion'));
const Pedidos = lazy(() => import('./pantallas/Administracion/Pedidos'));
const ActualizarPerfil = lazy(() => import('./pantallas/Administracion/ActualizarPerfil'));
const Contrasena = lazy(() => import('./pantallas/Administracion/Contrasena'));
const ProductosAdministracion = lazy(() => import('./pantallas/Administracion/ProductosAdministracion'));
const DetalleProducto = lazy(() => import('./pantallas/Administracion/DetalleProducto'));
const Clientes = lazy(() => import('./pantallas/Administracion/Clientes'));
const Calendario = lazy(() => import('./pantallas/Administracion/Calendario'));
const Conversaciones = lazy(() => import('./pantallas/Administracion/Conversaciones'));
function AccesoAdministracion() {
  const { user: usuario, verificandoSesion, cerrarSesion } = usarAutenticacion();

  if (verificandoSesion) return <CargadorRuta />;
  if (usuario?.role === 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8 dark:bg-[#141414]">
      <ToastContainer position="top-center" />
      {usuario ? (
        <section className="max-w-md rounded-2xl bg-white p-8 text-slate-900 shadow dark:bg-[#1b1d1c] dark:text-white">
          <h1 className="mb-3 text-2xl font-bold">Acceso de administración</h1>
          <p>Esta cuenta no tiene permisos de administrador.</p>
          <button type="button" onClick={cerrarSesion} className="mt-5 rounded-xl bg-main px-4 py-3 font-bold text-white">
            Usar otra cuenta
          </button>
        </section>
      ) : (
        <InicioSesion soloAcceso />
      )}
    </main>
  );
}

function Aplicacion() {
  return (
    <>
      <DesplazarAlInicio>
        <Suspense fallback={<CargadorRuta />}>
          <Routes>
            <Route path="/" element={<AccesoAdministracion />} />
            <Route element={<RutaProtegida soloAdministrador><Outlet /></RutaProtegida>}>
              <Route path="/dashboard" element={<PanelAdministracion />} />
              <Route path="/admin/products" element={<ProductosAdministracion />} />
              <Route path="/admin/products/:productId" element={<DetalleProducto />} />
              <Route path="/customers" element={<Clientes />} />
              <Route path="/calendar" element={<Calendario />} />
              <Route path="/chat" element={<Conversaciones />} />
              <Route path="/orders" element={<Pedidos />} />
              <Route path="/profile" element={<ActualizarPerfil />} />
              <Route path="/password" element={<Contrasena />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </DesplazarAlInicio>
    </>
  );
}
function CargadorRuta() {
  return <div className="flex min-h-[55vh] items-center justify-center bg-[#f7f4ef] dark:bg-[#111111]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-main/20 border-t-main" />
    </div>;
}
export default Aplicacion;
