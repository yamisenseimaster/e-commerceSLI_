import React, { useRef, useState } from 'react';
import { DialogTitle } from '@headlessui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { A11y, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import ModalPrincipal from './Modales/ModalPrincipal';

const promociones = [
  {
    titulo: 'Billetera digital',
    descuento: 20,
    dia: 'Jueves',
    tope: '$10.000',
    tono: 'verde',
  },
  {
    titulo: 'Tarjeta de crédito',
    descuento: 15,
    dia: 'Viernes',
    tope: '$12.000',
    tono: 'azul',
  },
  {
    titulo: 'Tarjeta de débito',
    descuento: 10,
    dia: 'Lunes y martes',
    tope: '$8.000',
    tono: 'uva',
  },
  {
    titulo: 'Pago con QR',
    descuento: 25,
    dia: 'Miércoles',
    tope: '$15.000',
    tono: 'azul',
  },
  {
    titulo: 'Club del Mercadito',
    descuento: 15,
    dia: 'Sábados',
    tope: '$6.000',
    tono: 'verde',
  },
  {
    titulo: 'Compra con tarjeta prepaga',
    descuento: 10,
    dia: 'Domingos',
    tope: '$5.000',
    tono: 'uva',
  },
];

const tonos = {
  verde: {
    borde: 'border-[#25705e]',
    cabecera: 'bg-[#185847]',
    cifra: 'text-[#185847] dark:text-[#8de2c3]',
  },
  azul: {
    borde: 'border-[#37647a]',
    cabecera: 'bg-[#244e60]',
    cifra: 'text-[#244e60] dark:text-[#a1cfe4]',
  },
  uva: {
    borde: 'border-[#795568]',
    cabecera: 'bg-[#684557]',
    cifra: 'text-[#684557] dark:text-[#edb8d5]',
  },
};

function CarruselPromociones() {
  const [seleccionada, establecerSeleccionada] = useState(null);
  const carrusel = useRef(null);
  const estiloFlecha =
    'mb-7 grid h-10 place-items-center rounded-sm text-[#185847] hover:bg-[#dcebe4] focus-visible:outline-2 focus-visible:outline-main dark:text-[#8de2c3] dark:hover:bg-white/10';

  return (
    <section
      aria-labelledby="titulo-promociones"
      className="my-4 border-y border-[#dce5e3] bg-[#edf5f2] py-5 dark:border-[#303c36] dark:bg-[#17231e]">
      <div className="container mx-auto px-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2
            id="titulo-promociones"
            className="font-display text-xl font-black">
            Promociones y medios de pago
          </h2>
          <p className="text-xs font-medium text-[#526461] dark:text-[#b1c7c1]">
            Ejemplos sin vigencia comercial
          </p>
        </div>
        <div className="grid grid-cols-[24px_minmax(0,1fr)_24px] items-center gap-1 sm:grid-cols-[32px_minmax(0,1fr)_32px] sm:gap-2">
          <button
            type="button"
            aria-label="Promoción anterior"
            className={estiloFlecha}
            onClick={() => carrusel.current?.slidePrev()}>
            <FiChevronLeft aria-hidden="true" />
          </button>
          <Swiper
            onSwiper={(instancia) => {
              carrusel.current = instancia;
            }}
            modules={[A11y, Pagination]}
            a11y={{
              paginationBulletMessage:
                'Ir a la posición {{index}} del carrusel',
              slideLabelMessage: '{{index}} de {{slidesLength}}',
            }}
            pagination={{ clickable: true }}
            rewind
            spaceBetween={12}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="w-full min-w-0 !overflow-hidden !pb-7 [--swiper-pagination-bottom:0px] [--swiper-pagination-color:#185847] dark:[--swiper-pagination-bullet-inactive-color:#c5d4cd] dark:[--swiper-pagination-color:#8de2c3] [&_.swiper-slide]:!h-auto">
            {promociones.map((promocion) => {
              const estilo = tonos[promocion.tono];
              return (
                <SwiperSlide key={promocion.titulo}>
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-sm border bg-white dark:bg-[#1b211e] ${estilo.borde}`}>
                    <h3
                      className={`px-3 py-2 text-center text-sm font-bold text-white ${estilo.cabecera}`}>
                      {promocion.titulo}
                    </h3>
                    <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
                      <p
                        className={`shrink-0 font-black leading-none ${estilo.cifra}`}>
                        <span className="text-4xl sm:text-5xl">
                          {promocion.descuento}
                          <span className="text-2xl">%</span>
                        </span>
                        <span className="mt-1 block text-[11px]">
                          DE REINTEGRO
                        </span>
                      </p>
                      <div className="text-right text-sm">
                        <p className="font-bold">{promocion.dia}</p>
                        <p className="mt-1 text-xs text-[#526461] dark:text-[#b1c7c1]">
                          Tope de {promocion.tope}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => establecerSeleccionada(promocion)}
                      aria-label={`Ver condiciones de ${promocion.titulo}`}
                      className="mx-auto mb-3 px-2 py-1 text-xs font-semibold text-[#415b53] underline underline-offset-2 hover:text-[#185847] dark:text-[#b1c7c1] dark:hover:text-[#8de2c3]">
                      Ver condiciones
                    </button>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <button
            type="button"
            aria-label="Promoción siguiente"
            className={estiloFlecha}
            onClick={() => carrusel.current?.slideNext()}>
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <ModalPrincipal
        modalOpen={Boolean(seleccionada)}
        setModalOpen={() => establecerSeleccionada(null)}
        panelClassName="max-w-md">
        <div className="rounded-md bg-white p-6 text-left text-[#172033] dark:bg-[#1b211e] dark:text-white">
          <DialogTitle className="pr-10 text-lg font-black">
            {seleccionada?.titulo}
          </DialogTitle>
          <p className="mt-3 text-sm">
            Ejemplo de {seleccionada?.descuento}% de reintegro los{' '}
            {seleccionada?.dia.toLowerCase()}, con tope de {seleccionada?.tope}{' '}
            por compra.
          </p>
          <p className="mt-3 text-sm text-[#526461] dark:text-[#b1c7c1]">
            Promoción de demostración. No aplica a compras.
          </p>
        </div>
      </ModalPrincipal>
    </section>
  );
}

export default CarruselPromociones;
