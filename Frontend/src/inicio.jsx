import React from 'react';
import ReactDOM from 'react-dom/client';
import './inicio.css';
import Aplicacion from './Aplicacion';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorAutenticacion } from './Contextos/ContextoAutenticacion';
import { ProveedorProductos } from './Contextos/ContextoProductos';
import { ProveedorTema } from './Contextos/ContextoTema';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
const raiz = ReactDOM.createRoot(document.getElementById('root'));
raiz.render(
  <React.StrictMode>
    <ProveedorTema>
      <ProveedorAutenticacion>
        <ProveedorProductos>
          <BrowserRouter>
            <Aplicacion />
          </BrowserRouter>
        </ProveedorProductos>
      </ProveedorAutenticacion>
    </ProveedorTema>
  </React.StrictMode>
);
