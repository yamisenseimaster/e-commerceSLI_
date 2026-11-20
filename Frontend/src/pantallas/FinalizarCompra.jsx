import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CampoEntrada from '../componentes/CampoEntrada';
import ResumenPedido from '../componentes/ResumenPedido';
import Pagos from '../componentes/Pagos';
import { usarCarrito } from '../Contextos/ContextoCarrito';
import Estructura from '../estructura/Estructura';
import { apiPedidos } from '../servicios/api';

const mediosPago = [
  { value: 'Tarjeta', name: 'Tarjeta' },
  { value: 'Transferencia', name: 'Transferencia' },
  { value: 'Efectivo', name: 'Efectivo' },
];

function FinalizarCompra() {
  const { cart: carrito } = usarCarrito();
  const [medioPago, establecerMedioPago] = useState(mediosPago[0].value);
  const [comprobante, establecerComprobante] = useState(null);
  const [guardando, establecerGuardando] = useState(false);
  const intento = useRef(null);

  const simularPago = async (evento) => {
    evento.preventDefault();
    if (guardando || carrito.items.length === 0) return;

    const direccion = Object.fromEntries(new FormData(evento.currentTarget));
    establecerGuardando(true);
    try {
      intento.current ||= crypto.randomUUID();
      const pedido = await apiPedidos.crear(
        { shippingAddress: direccion, paymentMethod: medioPago }, intento.current,
      );
      establecerComprobante(pedido);
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerGuardando(false);
    }
  };

  if (comprobante) {
    return (
      <Estructura>
        <section className="container mx-auto max-w-xl px-4 py-16 text-center dark:text-white">
          <FiCheckCircle aria-hidden="true" className="mx-auto mb-4 text-5xl text-main" />
          <h1 tabIndex={-1} ref={(titulo) => titulo?.focus()} className="font-display text-3xl font-black">
            Pago simulado aprobado
          </h1>
          <p className="my-4">
            Total simulado: <strong>${Number(comprobante.total).toFixed(2)}</strong> · {comprobante.paymentMethod}
          </p>
          <Link to="/orders" className="inline-block rounded-full bg-main px-6 py-3 font-bold text-white">
            Ver mis pedidos
          </Link>
          <Link to="/shop" className="ml-4 inline-block py-3 font-bold">
            Volver a la tienda
          </Link>
        </section>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="min-h-screen bg-[#f7f4ef] text-[#172033] dark:bg-[#101010] dark:text-white">
        <section className="container mx-auto px-3 py-8 sm:px-4 lg:py-12">
          <div className="mb-8 overflow-hidden rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-main">
              Simulación de compra
            </p>
            <h1 className="mt-2 font-display text-[34px] font-black leading-tight text-[#111827] dark:text-white sm:text-[46px]">
              Finalizá tu compra
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] font-semibold leading-7 text-[#667085] dark:text-[#cbd5e1]">
              Usá datos de ejemplo y elegí cómo pagar. El pago es ficticio.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_430px]">
            <form onSubmit={simularPago} className="space-y-5">
              <SeccionCompra
                icon={FiUser}
                step="01"
                title="Datos personales"
                subtitle="Usaremos estos datos para identificar tu pedido.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoEntrada
                    name="firstName"
                    type="text"
                    placeHolder="Juan"
                    label="Nombre"
                  />
                  <CampoEntrada
                    name="lastName"
                    type="text"
                    placeHolder="Perez"
                    label="Apellido"
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <CampoEntrada
                    type="email"
                    name="email"
                    placeHolder="user@gmail.com"
                    label="Correo"
                  />
                  <CampoEntrada
                    type="text"
                    name="phone"
                    placeHolder="0754661424"
                    label="Telefono"
                  />
                </div>
              </SeccionCompra>

              <SeccionCompra
                icon={FiMapPin}
                step="02"
                title="Datos de envio"
                subtitle="Completa la direccion donde quieres recibir la compra.">
                <div className="space-y-4">
                  <CampoEntrada
                    type="text"
                    name="street"
                    placeHolder="Calle 123, piso 1"
                    label="Dirección"
                  />
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <CampoEntrada
                      name="city"
                      type="text"
                      placeHolder="Buenos Aires"
                      label="Ciudad"
                    />
                    <CampoEntrada
                      name="country"
                      type="text"
                      placeHolder="Argentina"
                      label="Pais"
                    />
                    <CampoEntrada
                      name="zip"
                      type="text"
                      placeHolder="23456"
                      label="Codigo postal"
                    />
                  </div>
                  <p className="text-sm font-semibold">Envío a domicilio gratis para la simulación.</p>
                </div>
              </SeccionCompra>

              <SeccionCompra
                icon={FiCreditCard}
                step="03"
                title="Datos de pago"
                subtitle="Elegí el medio de pago para esta simulación.">
                <Pagos
                  methods={mediosPago}
                  selectedMethod={medioPago}
                  onMethodChange={establecerMedioPago}
                />
              </SeccionCompra>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/shop"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-[#d9e0ea] bg-white px-5 text-[14px] font-black text-[#26344a] shadow-sm transition hover:border-main hover:text-main dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white">
                  <FiArrowLeft /> Seguir comprando
                </Link>
                <button
                  type="submit"
                  disabled={guardando || carrito.items.length === 0}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-main px-5 text-[14px] font-black text-white shadow-[0_18px_38px_rgba(0,200,147,0.24)] transition hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:shadow-none">
                  {guardando ? 'Guardando pedido…' : 'Simular pago'}
                  <FiCheckCircle />
                </button>
              </div>
            </form>

            <motion.aside
              className="sticky top-24 overflow-hidden rounded-[24px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.06]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}>
              <ResumenPedido
                order={false}
                shippingCost={0}
              />
            </motion.aside>
          </div>
        </section>
      </div>
    </Estructura>
  );
}

function SeccionCompra({
  children: hijos,
  icon: Icon,
  step,
  subtitle,
  title: titulo,
}) {
  return (
    <motion.section
      className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}>
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-main/10 text-xl text-main ring-1 ring-main/15">
          <Icon />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-main">
            Paso {step}
          </p>
          <h2 className="mt-1 text-[22px] font-black leading-tight text-[#111827] dark:text-white">
            {titulo}
          </h2>
          <p className="mt-1 text-[13px] font-semibold leading-6 text-[#667085] dark:text-[#aeb7c5]">
            {subtitle}
          </p>
        </div>
      </div>
      {hijos}
    </motion.section>
  );
}

export default FinalizarCompra;
