import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PiePagina from './piePagina/PiePagina';
import PiePaginaMovil from './piePagina/PiePaginaMovil';
// import MobileFooter from './piePagina/PiePaginaMovil';
import BarraNavegacion from './barraNavegacion/BarraNavegacion';
import { usarAjustesTema } from '../Contextos/ContextoTema';
// Estructura común de las páginas.

const Estructura = ({ children: hijos, colorPortada }) => {
  const { theme: tema } = usarAjustesTema();
  const esOscuro = tema.mode === 'dark';

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2100}
        className="app-toast-container"
        toastClassName="app-toast"
        bodyClassName="app-toast-body"
        progressClassName="app-toast-progress"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={2}
        theme={esOscuro ? 'dark' : 'light'}
      />

      <div className="shop-shell min-h-screen font-sans">
        <BarraNavegacion colorPortada={colorPortada} />
        <main className="shop-main bg-transparent">{hijos}</main>
        {/* <PiePaginaMovil /> */}
        <PiePaginaMovil />
        <PiePagina />
      </div>
    </>
  );
};

export default Estructura;
