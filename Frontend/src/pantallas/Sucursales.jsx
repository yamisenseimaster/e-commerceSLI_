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
    const nodo = contenedor.current;
    if (!nodo || nodo._leaflet_id) return;

    const instancia = L.map(nodo, {
      maxBounds: [[-24.65, -67.22], [-21.77, -64.14]],
      maxBoundsViscosity: 1,
      minZoom: 8,
      maxZoom: 17,
      zoomControl: false,
    }).fitBounds(puntos, { padding: [30, 40] });

    mapa.current = instancia;

    L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(instancia);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instancia);

    marcadores.current = sucursales.map(({ localidad, punto }, indice) =>
      L.marker(punto, {
        title: localidad,
        alt: localidad,
        icon: L.divIcon({
          className:
            'flex items-center justify-center rounded-full border-2 border-white bg-teal-800 font-bold text-white shadow-md',
          html: String(indice + 1),
          iconSize: [32, 32],
        }),
      })
        .addTo(instancia)
        .bindTooltip(localidad)
        .on('click', () => enfocar(indice))
    );

    return () => {
      instancia.remove();
      mapa.current = null;
      if (nodo) delete nodo._leaflet_id;
    };
  }, []);

  function enfocar(indice) {
    seleccionar(indice);
    if (mapa.current) {
      mapa.current.setView(puntos[indice], 14);
    }
    if (marcadores.current[indice]) {
      marcadores.current[indice].openTooltip();
    }
  }

  function verTodas() {
    seleccionar(null);
    buscar('');
    marcadores.current.forEach(marcador => marcador.closeTooltip());
    if (mapa.current) {
      mapa.current.fitBounds(puntos, { padding: [30, 40] });
    }
  }

  const coincidencias = sucursales.filter(({ localidad }) =>
    localidad.toLowerCase().includes(consulta.trim().toLowerCase())
  );

  return (
    <Estructura>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#e2f6ee] via-[#f5faed] to-[#fdf3cf] text-[#111827] dark:from-[#12241e] dark:via-[#141916] dark:to-[#1d1a11] dark:text-white">
        <section className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-black text-[#0f3d2e] dark:text-white">
            Sucursales en Jujuy
          </h1>
          <p className="mb-6 mt-2 text-sm font-medium text-[#3b594d] dark:text-neutral-300">
            Ubicaciones de ejemplo de Mercadito para el proyecto universitario.
          </p>

          <div className="grid gap-5 md:grid-cols-[minmax(240px,320px)_1fr]">
            <div>
              <label htmlFor="localidad" className="mb-2 block text-sm font-bold text-[#0f3d2e] dark:text-white">
                Buscar por localidad
              </label>
              <input
                id="localidad"
                type="search"
                value={consulta}
                onChange={evento => buscar(evento.target.value)}
                placeholder="Por ejemplo, Tilcara"
                className="w-full rounded-xl border border-[#9adbc3] bg-white/95 p-3 text-sm shadow-2xs outline-none focus:border-main dark:border-neutral-700 dark:bg-neutral-900"
              />

              <ul className="my-4 divide-y divide-[#e3f3ec] overflow-hidden rounded-xl border border-[#9adbc3] bg-white/95 shadow-xs dark:divide-neutral-800 dark:border-neutral-700 dark:bg-neutral-900">
                {coincidencias.map(sucursal => {
                  const indice = sucursales.indexOf(sucursal);
                  return (
                    <li key={sucursal.localidad}>
                      <button
                        type="button"
                        aria-pressed={activa === indice}
                        onClick={() => enfocar(indice)}
                        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#eaf9f3] aria-pressed:bg-[#fef7dc] dark:hover:bg-teal-950 dark:aria-pressed:bg-teal-950"
                      >
                        <FiMapPin className="shrink-0 text-main" />
                        <span className="flex-1">
                          <strong className="block text-[#0d3326] dark:text-white">{sucursal.localidad}</strong>
                          <small className="block text-[#527366] dark:text-neutral-400">{sucursal.zona}</small>
                        </span>
                        <FiChevronRight className="text-main/70" />
                      </button>
                    </li>
                  );
                })}
                {!coincidencias.length && (
                  <li className="p-4 text-sm text-[#3b594d] dark:text-neutral-300">
                    Sin sucursales para esa localidad.
                  </li>
                )}
              </ul>

              <button
                type="button"
                onClick={verTodas}
                className="text-sm font-bold text-[#0f583e] underline hover:text-main dark:text-[#8de2c3]"
              >
                Ver todas en el mapa
              </button>
            </div>

            <div
              ref={contenedor}
              aria-label="Mapa de sucursales en Jujuy"
              role="region"
              className="relative isolate z-0 h-[360px] overflow-hidden rounded-2xl border-2 border-[#9adbc3] shadow-sm dark:border-neutral-700 md:h-[500px]"
            />
          </div>
        </section>
      </div>
    </Estructura>
  );
}
