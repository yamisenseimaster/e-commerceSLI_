import React from 'react';
import Estructura from '../estructura/Estructura';
import ResumenPedido from '../componentes/ResumenPedido';
import { BiMap } from 'react-icons/bi';
import { MdCloudDownload } from 'react-icons/md';
function PantallaPedido() {
  const OrderInfo = [
    {
      name: '01. Datos personales',
      details: [
        {
          title: 'Nombre completo',
          sub: 'Cliente de ejemplo',
        },
        {
          title: 'Correo',
          sub: 'ecommersiouser@gmail.com',
        },
        {
          title: 'Telefono',
          sub: '+255 754 661 424',
        },
      ],
    },
    {
      name: '02. Datos de envio',
      details: [
        {
          title: 'Direccion',
          sub: 'Calle de ejemplo 123',
        },
        {
          title: 'Ciudad',
          sub: 'Perico',
        },
        {
          title: 'Pais',
          sub: 'Argentina',
        },
        {
          title: 'Código postal',
          sub: '457143',
        },
        {
          title: 'Envio por',
          sub: 'FedEx',
        },
      ],
    },
    {
      name: '03. Datos de pago',
      details: [
        {
          title: 'Metodo de pago',
          sub: 'Stripe',
        },
        {
          title: 'Tarjeta',
          sub: '456 ************** 674',
        },
      ],
    },
  ];

  return (
    <Estructura>
      <div className="bg-deepGray">
        <div className="min-h-screen container mx-auto px-4">
          <div className="lg:grid grid-cols-10 gap-10 items-start py-12">
            <div className="col-span-6 lg:mb-0 mb-10">
              <form className="flex flex-col gap-12">
                {OrderInfo.map((o, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <h2 className="font-semibold text-lg mb-3">{o.name}</h2>
                    {o.details.map((d, indice) => (
                      <div
                        key={indice}
                        className="flex items-center border-b border-gray-200 py-3 justify-between w-full text-gray-500">
                        {d.title}
                        <span className="font-semibold text-black">
                          {d.sub}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex flex-col gap-6">
                  <div className="grid sm:grid-cols-2 gap-4 ">
                    <a
                      rel="noopener noreferrer"
                      href="https://www.fedex.com/en-us/home.html"
                      target="_blank"
                      className="w-full flex-rows gap-3 p-3 rounded text-black border-2 border-main">
                      <BiMap /> Enlace de seguimiento
                    </a>
                    <button
                      type="button"
                      className="w-full  flex-rows gap-3 p-3 hover:bg-subMain transitions rounded text-white bg-main">
                      Descargar recibo <MdCloudDownload />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="sticky flex-colo gap-4 p-6 rounded-md top-28 col-span-4 bg-white border  border-text">
              <ResumenPedido order={true} />
            </div>
          </div>
        </div>
      </div>
    </Estructura>
  );
}

export default PantallaPedido;
