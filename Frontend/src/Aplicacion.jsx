import React, { Suspense, lazy } from 'react';
import PantallaInicio from './pantallas/PantallaInicio';
import { enlaceSucursales } from './datos/navegacion';
import { Routes, Route } from 'react-router-dom';
import DesplazarAlInicio from './DesplazarAlInicio';
import { ProveedorVentanas } from './Contextos/ContextoVentanas';
import RutaProtegida from './componentes/RutaProtegida';
import CargaInicial from './componentes/CargaInicial';

const Tienda = lazy(() => import('./pantallas/Tienda'));
const Sucursales = lazy(() => import('./pantallas/Sucursales'));
const PaginaCategoria = lazy(() => import('./pantallas/PaginaCategoria'));
const PaginaProducto = lazy(() => import('./pantallas/PaginaProducto'));
const FinalizarCompra = lazy(() => import('./pantallas/FinalizarCompra'));
const PantallaPedido = lazy(() => import('./pantallas/PantallaPedido'));
const Administracion = lazy(
  () => import('./pantallas/Administracion/Administracion'),
);
const Pedidos = lazy(() => import('./pantallas/Administracion/Pedidos'));
const ActualizarPerfil = lazy(
  () => import('./pantallas/Administracion/ActualizarPerfil'),
);
const Contrasena = lazy(() => import('./pantallas/Administracion/Contrasena'));
const ProductosAdministracion = lazy(
  () => import('./pantallas/Administracion/ProductosAdministracion'),
);
const DetalleProducto = lazy(
  () => import('./pantallas/Administracion/DetalleProducto'),
);
const Clientes = lazy(() => import('./pantallas/Administracion/Clientes'));
const Calendario = lazy(() => import('./pantallas/Administracion/Calendario'));
const PaginaNoEncontrada = lazy(() => import('./pantallas/PaginaNoEncontrada'));
const PaginaLegal = lazy(() => import('./pantallas/PaginaLegal'));

function Aplicacion() {
  return (
    <ProveedorVentanas>
      <CargaInicial />
      <DesplazarAlInicio>
        <Suspense fallback={<CargadorRuta />}>
          <Routes>
            <Route path="/" element={<PantallaInicio />} />
            <Route path="/shop" element={<Tienda />} />
            <Route path={enlaceSucursales.to} element={<Sucursales />} />
            <Route path="/category/:category" element={<PaginaCategoria />} />
            <Route path="/products/:productId" element={<PaginaProducto />} />
            <Route
              path="/checkout"
              element={
                <RutaProtegida>
                  <FinalizarCompra />
                </RutaProtegida>
              }
            />
            <Route path="/order" element={<PantallaPedido />} />
            <Route
              path="/dashboard"
              element={
                <RutaProtegida customerRedirect>
                  <Administracion />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RutaProtegida adminOnly>
                  <ProductosAdministracion />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/products/:productId"
              element={
                <RutaProtegida adminOnly>
                  <DetalleProducto />
                </RutaProtegida>
              }
            />
            <Route
              path="/customers"
              element={
                <RutaProtegida adminOnly>
                  <Clientes />
                </RutaProtegida>
              }
            />
            <Route
              path="/calendar"
              element={
                <RutaProtegida adminOnly>
                  <Calendario />
                </RutaProtegida>
              }
            />
            <Route
              path="/orders"
              element={
                <RutaProtegida>
                  <Pedidos />
                </RutaProtegida>
              }
            />
            <Route
              path="/profile"
              element={
                <RutaProtegida>
                  <ActualizarPerfil />
                </RutaProtegida>
              }
            />
            <Route path="/about" element={<PaginaLegal />} />
            <Route path="/faq" element={<PaginaLegal />} />
            <Route path="/terms" element={<PaginaLegal />} />
            <Route path="/privacy" element={<PaginaLegal />} />
            <Route
              path="/password"
              element={
                <RutaProtegida>
                  <Contrasena />
                </RutaProtegida>
              }
            />
            <Route path="*" element={<PaginaNoEncontrada />} />
          </Routes>
        </Suspense>
      </DesplazarAlInicio>
    </ProveedorVentanas>
  );
}

function CargadorRuta() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center bg-[#f7f4ef] dark:bg-[#111111]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-main/20 border-t-main" />
    </div>
  );
}

export default Aplicacion;
