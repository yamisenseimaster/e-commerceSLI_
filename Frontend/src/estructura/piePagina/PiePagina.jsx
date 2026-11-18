import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiShield, FiShoppingBag } from 'react-icons/fi';

function PiePagina() {
  const Links = [
    {
      title: 'Empresa',
      decorative: true,
      links: [
        {
          name: 'Nosotros',
        },
        {
          name: 'FAQ',
        },
        {
          name: 'Politica',
          link: '/privacy',
        },
        {
          name: 'Condiciones',
          link: '/terms',
        },
      ],
    },
    {
      title: 'Categorias',
      links: [
        {
          link: '/category/Lunch',
          name: 'Almuerzo',
        },
        {
          link: '/category/Salad',
          name: 'Ensaladas',
        },
        {
          link: '/category/Breakfast',
          name: 'Desayuno',
        },
        {
          link: '/category/Dinner',
          name: 'Cena',
        },
      ],
    },
  ];

  const trustItems = [
    { icon: FiShoppingBag, text: 'Tienda digital' },
    { icon: FiShield, text: 'Compra segura' },
    { icon: FiMapPin, text: 'Proyecto local' },
  ];

  return (
    <footer className="border-t border-black/5 bg-[#f7f4ef] px-3 py-5 text-[#111827] dark:border-white/[0.06] dark:bg-[#111212] dark:text-white">
      <div className="container mx-auto">
        <div className="overflow-hidden rounded-[22px] bg-white/65 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl dark:bg-white/[0.06] dark:ring-white/[0.08]">
          <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[1.15fr_0.85fr_0.85fr] lg:px-9 lg:py-8">
            <div className="max-w-md">
              <Link
                to="/"
                className="inline-flex items-center text-[28px] font-black tracking-normal">
                Merca<span className="text-main">dito</span>
              </Link>
              <p className="mt-3 max-w-sm text-[14px] font-semibold leading-7 text-[#596579] dark:text-[#cbd5e1]">
                Tienda digital para vender productos.
              </p>
            </div>

            {Links.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-[13px] font-black uppercase tracking-[0.18em] text-main">
                  {group.title}
                </h3>
                <ul className="grid gap-3 text-[14px] font-bold sm:grid-cols-2 lg:grid-cols-1">
                  {group.links.map((elemento) => (
                    <li key={elemento.link || elemento.name}>
                      {!elemento.link ? (
                        <span
                          className="inline-flex cursor-default items-center gap-2 text-[#526176] dark:text-[#cbd5e1]"
                          aria-disabled="true">
                          <span className="h-1.5 w-1.5 rounded-full bg-main/70" />
                          {elemento.name}
                        </span>
                      ) : (
                        <Link
                          to={elemento.link}
                          className="inline-flex items-center gap-2 text-[#526176] transition hover:translate-x-1 hover:text-main dark:text-[#cbd5e1] dark:hover:text-main">
                          <span className="h-1.5 w-1.5 rounded-full bg-main/70" />
                          {elemento.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[#e6ebf2] px-5 py-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
            <div className="flex flex-wrap gap-2">
              {trustItems.map((elemento) => (
                <span
                  key={elemento.text}
                  className="inline-flex items-center gap-2 rounded-full bg-[#eef7f4] px-3 py-2 text-[12px] font-black text-[#2f6b5f] dark:bg-white/[0.07] dark:text-[#d1fae5]">
                  <elemento.icon />
                  {elemento.text}
                </span>
              ))}
            </div>
            <p className="text-[12px] font-bold text-[#7b8798] dark:text-[#9ca3af]">
              © 2026 Mercadito
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;
