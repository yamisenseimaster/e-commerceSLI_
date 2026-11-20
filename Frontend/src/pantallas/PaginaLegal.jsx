import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Estructura from '../estructura/Estructura';

const pages = {
  '/about': {
    label: 'Nosotros',
    title: 'Sobre Mercadito',
    intro:
      'Somos una tienda digital pensada para acercarte productos frescos, alimentos de almacén, bebidas y artículos para el hogar de manera simple, rápida y segura.',
    sections: [
      [
        'Nuestra misión',
        'Facilitar tus compras diarias combinando la cercanía del comercio de barrio con la comodidad de pedir desde tu celular o computadora, con precios claros y stock actualizado.',
      ],
      [
        'Qué ofrecemos',
        'Trabajamos con categorías seleccionadas —desde comidas listas, desayunos y frutas frescas hasta infusiones, lácteos, bebidas y productos de limpieza— para que resuelvas todo en un solo pedido.',
      ],
      [
        'Atención y compromiso',
        'Nos enfocamos en preparar cada orden con cuidado y brindarte soporte directo ante cualquier consulta sobre tus productos, envíos o retiro por sucursal.',
      ],
    ],
  },
  '/faq': {
    label: 'FAQ',
    title: 'Preguntas frecuentes',
    intro:
      'Respuestas rápidas a las consultas más habituales sobre compras, entregas y uso de tu cuenta en Mercadito.',
    sections: [
      [
        '¿Cómo realizo un pedido?',
        'Explora la tienda o filtra por categoría, agrega los productos que necesites al carrito y haz clic en finalizar compra. Necesitarás iniciar sesión para confirmar tus datos de entrega.',
      ],
      [
        '¿Puedo retirar mi compra en una sucursal?',
        'Sí. En la sección Sucursales puedes consultar nuestras ubicaciones disponibles y coordinar el retiro o envío según tu zona.',
      ],
      [
        '¿Qué pasa si un producto figura sin stock?',
        'Cuando un artículo llega a cero unidades disponibles se marca automáticamente como sin stock. Puedes guardarlo en tus favoritos para revisarlo más adelante cuando se reponga.',
      ],
      [
        '¿Cómo actualizo mis datos o contraseña?',
        'Una vez que inicies sesión, ingresa al menú de tu cuenta para editar tu perfil, dirección de entrega o cambiar tu contraseña de acceso.',
      ],
    ],
  },
  '/privacy': {
    label: 'Política',
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
  '/terms': {
    label: 'Condiciones',
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
};

function PaginaLegal() {
  const { pathname } = useLocation();
  const pagina = pages[pathname] || pages['/about'];

  return (
    <Estructura>
      <div className="min-h-[70vh] bg-[#f7f4ef] px-4 py-12 text-[#172033] dark:bg-[#111111] dark:text-white">
        <article className="mx-auto max-w-3xl rounded-3xl border border-[#dce5e3] bg-white p-6 shadow-sm dark:border-[#303735] dark:bg-[#1b1d1c] sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="text-sm font-bold text-main hover:underline">
              ← Volver a la tienda
            </Link>

            <nav aria-label="Secciones institucionales" className="flex flex-wrap gap-2">
              {Object.entries(pages).map(([ruta, item]) => (
                <Link
                  key={ruta}
                  to={ruta}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    pathname === ruta
                      ? 'bg-main text-white'
                      : 'bg-[#f7f4ef] text-[#526176] hover:text-main dark:bg-[#252827] dark:text-[#c4d0cc]'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <h1 className="mt-6 text-3xl font-black sm:text-4xl">
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