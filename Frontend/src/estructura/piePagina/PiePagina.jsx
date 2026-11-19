import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiShield, FiShoppingBag } from 'react-icons/fi';

function PiePagina() {
  const Links = [
    {
      title: 'Empresa',
      links: [
        {
          name: 'Nosotros',
          link: '/about',
        },
        {
          name: 'FAQ',
          link: '/faq',
        },
        {
          name: 'Política',
          link: '/privacy',
        },
        {
          name: 'Condiciones',
          link: '/terms',
        },
      ],
    },
    {
      title: 'Categorías',
      links: [
        {
          link: '/category/Lunch',
          name: 'Almuerzo',
        },
        {
          link: '/category/Breakfast',
          name: 'Desayuno',
        },
        {
          link: '/category/Juices',
          name: 'Jugos',
        },
        {
          link: '/category/Fruits',
          name: 'Frutas',
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
    <footer className="border-t border-[#bce3d4] bg-gradient-to-b from-[#d9f3e8] to-[#c4ebdb] px-3 py-7 text-[#111827] dark:border-white/[0.06] dark:from-[#121a17] dark:to-[#0d1411] dark:text-white">
      <div className="container mx-auto">
        <div className="overflow-hidden rounded-[24px] bg-white/85 shadow-[0_24px_60px_rgba(16,82,58,0.12)] ring-1 ring-white backdrop-blur-2xl dark:bg-[#19221e]/90 dark:ring-white/[0.08]">
          <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[1.15fr_0.85fr_0.85fr] lg:px-9 lg:py-8">
            <div className="max-w-md">
              <Link
                to="/"
                className="inline-flex items-center text-[28px] font-black tracking-normal">
                Merca<span className="text-main">dito</span>
              </Link>
              <p className="mt-3 max-w-sm text-[14px] font-semibold leading-7 text-[#475569] dark:text-[#cbd5e1]">
                Tu tienda digital de confianza con productos frescos, bebidas y almacén listos para pedir fácil y rápido.
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
                      <Link
                        to={elemento.link}
                        className="inline-flex items-center gap-2 text-[#475569] transition hover:translate-x-1 hover:text-main dark:text-[#cbd5e1] dark:hover:text-main">
                        <span className="h-2 w-2 rounded-full bg-main" />
                        {elemento.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[#d8ece4] bg-[#f4fbf8]/80 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
            <div className="flex flex-wrap gap-2">
              {trustItems.map((elemento) => (
                <span
                  key={elemento.text}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d6f3e7] px-3.5 py-2 text-[12px] font-black text-[#14533c] dark:bg-white/[0.08] dark:text-[#d1fae5]">
                  <elemento.icon />
                  {elemento.text}
                </span>
              ))}
            </div>
            <p className="text-[12px] font-bold text-[#526461] dark:text-[#9ca3af]">
              © 2026 Mercadito
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;