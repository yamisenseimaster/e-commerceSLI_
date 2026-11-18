import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Estructura from '../estructura/Estructura';

const pages = {
  '/terms': {
    title: 'Términos y condiciones',
    intro:
      'Estas condiciones describen el uso de Mercadito. Léelas antes de crear una cuenta o realizar un pedido.',
    sections: [
      [
        'Cuenta',
        'Para comprar o guardar favoritos debes proporcionar datos correctos y mantener segura tu contraseña. Eres responsable de la actividad realizada desde tu cuenta.',
      ],
      [
        'Productos y pedidos',
        'Los precios, la disponibilidad y las condiciones de entrega se muestran antes de confirmar el pedido. Si detectas un error en tu pedido, escríbenos para que podamos revisarlo.',
      ],
      [
        'Uso del sitio',
        'Utiliza la tienda de forma lícita y evita interferir con su funcionamiento o acceder a cuentas ajenas. Podemos limitar el acceso cuando sea necesario para proteger el servicio.',
      ],
    ],
  },
  '/privacy': {
    title: 'Política de privacidad',
    intro:
      'Explicamos qué datos usa Mercadito para ofrecer la cuenta y gestionar los pedidos.',
    sections: [
      [
        'Datos que proporcionas',
        'Al registrarte recibimos tu nombre, correo y contraseña. Al usar la tienda también puedes proporcionar teléfono, dirección de entrega, foto de perfil y datos de tus pedidos.',
      ],
      [
        'Para qué se usan',
        'Usamos esos datos para iniciar sesión, administrar tu cuenta, procesar pedidos, responder consultas y proteger el servicio. Los favoritos se guardan en este navegador por cuenta.',
      ],
      [
        'Pagos',
        'Cuando eliges un proveedor de pago, los datos necesarios para completar la operación pueden enviarse a ese proveedor. Revisa sus condiciones antes de pagar.',
      ],
    ],
  },
};

function PaginaLegal() {
  const { pathname } = useLocation();
  const pagina = pages[pathname] || pages['/terms'];

  return (
    <Estructura>
      <div className="min-h-[70vh] bg-[#f7f4ef] px-4 py-12 text-[#172033] dark:bg-[#111111] dark:text-white">
        <article className="mx-auto max-w-3xl rounded-3xl border border-[#dce5e3] bg-white p-6 shadow-sm dark:border-[#303735] dark:bg-[#1b1d1c] sm:p-10">
          <Link to="/" className="text-sm font-bold text-main hover:underline">
            ← Volver a la tienda
          </Link>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            {pagina.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#526176] dark:text-[#c4d0cc]">
            {pagina.intro}
          </p>
          <div className="mt-8 space-y-7">
            {pagina.sections.map(([titulo, content]) => (
              <section key={titulo}>
                <h2 className="text-lg font-black">{titulo}</h2>
                <p className="mt-2 text-sm leading-7 text-[#526176] dark:text-[#c4d0cc]">
                  {content}
                </p>
              </section>
            ))}
          </div>
          <p className="mt-9 border-t border-[#e6ece9] pt-5 text-xs text-[#667085] dark:border-[#303735] dark:text-[#a6b6af]">
            Última actualización: 30 de octubre de 2026.
          </p>
        </article>
      </div>
    </Estructura>
  );
}

export default PaginaLegal;
