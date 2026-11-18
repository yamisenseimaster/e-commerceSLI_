import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiChevronRight, FiMapPin } from 'react-icons/fi';
import Estructura from '../estructura/Estructura';

const sucursales = [
  { localidad: 'San Salvador de Jujuy', zona: 'Centro', punto: [-24.185, -65.299] },
  { localidad: 'Tilcara', zona: 'Quebrada', punto: [-23.577, -65.394] },
  { localidad: 'Humahuaca', zona: 'Quebrada', punto: [-23.205, -65.349] },
];
const puntos = sucursales.map(sucursal => sucursal.punto);

export default function Sucursales() {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marcadores = useRef([]);
  const [activa, seleccionar] = useState(null);
  const [consulta, buscar] = useState('');

  useEffect(() => {
    const instancia = L.map(contenedor.current, {
      maxBounds: [[-24.65, -67.22], [-21.77, -64.14]],
      maxBoundsViscosity: 1, minZoom: 8, maxZoom: 17, zoomControl: false,
    }).fitBounds(puntos, { padding: [30, 40] });
    mapa.current = instancia;
    L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(instancia);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instancia);
    marcadores.current = sucursales.map(({ localidad, punto }, indice) =>
      L.marker(punto, {
        title: localidad, alt: localidad,
        icon: L.divIcon({
          className: 'flex items-center justify-center rounded-full border-2 border-white bg-teal-800 font-bold text-white shadow-md',
          html: String(indice + 1), iconSize: [32, 32],
        }),
      }).addTo(instancia).bindTooltip(localidad).on('click', () => enfocar(indice))
    );
    return () => instancia.remove();
  }, []);

  function enfocar(indice) {
    seleccionar(indice);
    mapa.current.setView(puntos[indice], 14);
    marcadores.current[indice].openTooltip();
  }

  function verTodas() {
    seleccionar(null);
    buscar('');
    marcadores.current.forEach(marcador => marcador.closeTooltip());
    mapa.current.fitBounds(puntos, { padding: [30, 40] });
  }

  const coincidencias = sucursales.filter(({ localidad }) =>
    localidad.toLowerCase().includes(consulta.trim().toLowerCase())
  );

  return (
    <Estructura>
      <section className="container mx-auto px-4 py-8 dark:text-white">
        <h1 className="font-display text-3xl font-black">Sucursales en Jujuy</h1>
        <p className="mb-6 mt-2 text-sm">Ubicaciones de ejemplo de Mercadito para el proyecto universitario.</p>
        <div className="grid gap-5 md:grid-cols-[minmax(240px,320px)_1fr]">
          <div>
            <label htmlFor="localidad" className="mb-2 block text-sm font-bold">Buscar por localidad</label>
            <input id="localidad" type="search" value={consulta} onChange={evento => buscar(evento.target.value)}
              placeholder="Por ejemplo, Tilcara" className="w-full rounded border border-slate-300 p-3 text-sm dark:bg-neutral-900" />
            <ul className="my-4 divide-y rounded border border-slate-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              {coincidencias.map(sucursal => {
                const indice = sucursales.indexOf(sucursal);
                return (
                  <li key={sucursal.localidad}>
                    <button type="button" aria-pressed={activa === indice} onClick={() => enfocar(indice)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-teal-50 aria-pressed:bg-teal-50 dark:hover:bg-teal-950 dark:aria-pressed:bg-teal-950">
                      <FiMapPin className="shrink-0 text-main" />
                      <span className="flex-1"><strong>{sucursal.localidad}</strong><small className="block">{sucursal.zona}</small></span>
                      <FiChevronRight />
                    </button>
                  </li>
                );
              })}
              {!coincidencias.length && <li className="p-4 text-sm">Sin sucursales para esa localidad.</li>}
            </ul>
            <button type="button" onClick={verTodas} className="text-sm font-bold underline">Ver todas en el mapa</button>
          </div>
          <div ref={contenedor} aria-label="Mapa de sucursales en Jujuy" role="region"
            className="relative isolate z-0 h-[360px] overflow-hidden rounded border border-slate-200 md:h-[500px]" />
        </div>
      </section>
    </Estructura>
  );
}
