import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiMapPin,
  FiShield,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CampoEntrada from '../componentes/CampoEntrada';
import ResumenPedido from '../componentes/ResumenPedido';
import Pagos from '../componentes/Pagos';
import OpcionesRadio from '../componentes/OpcionesRadio';
import { usarCarrito } from '../Contextos/ContextoCarrito';
import Estructura from '../estructura/Estructura';
import { apiPedidos, apiPagos } from '../servicios/api';

function FinalizarCompra() {
  const navegar = useNavigate();
  const { cart: carrito, refreshCart: recargarCarrito } = usarCarrito();
  const [valores, establecerValores] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    country: '',
    zip: '',
  });
  const [medioPago, establecerMedioPago] = useState('Cash');
  const [mediosPago, establecerMediosPago] = useState([]);
  const [opcionesEnvio, establecerOpcionesEnvio] = useState([]);
  const [opcionEnvio, establecerOpcionEnvio] = useState(null);
  const [enviando, establecerEnviando] = useState(false);
  const claveCompra = useRef(null);
  const referenciaEnvio = useRef(false);

  useEffect(() => {
    apiPagos
      .configuracion()
      .then((configuracion) => {
        establecerMediosPago(configuracion.methods);
        establecerOpcionesEnvio(configuracion.shippingOptions);
        establecerOpcionEnvio(configuracion.shippingOptions[0]);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const manejarCambio = (evento) => {
    establecerValores((actual) => ({
      ...actual,
      [evento.target.name]: evento.target.value,
    }));
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (referenciaEnvio.current || !opcionEnvio) return;

    if (carrito.items.length === 0) {
      toast.error('Tu carrito esta vacio');
      return;
    }

    referenciaEnvio.current = true;
    establecerEnviando(true);
    let pedidoCreado;
    claveCompra.current ||= crypto.randomUUID();

    try {
      pedidoCreado = await apiPedidos.crear(
        {
          shippingAddress: { ...valores, shippingProvider: opcionEnvio.value },
          paymentMethod: medioPago,
        },
        claveCompra.current,
      );
      await recargarCarrito();
      if (medioPago === 'Stripe') {
        const pago = await apiPagos.crearIntento({ orderId: pedidoCreado.id });
        window.location.assign(pago.checkoutUrl);
        return;
      }
      toast.success('Pedido creado');
      navegar('/orders');
    } catch (error) {
      toast.error(error.message);
      if (pedidoCreado) navegar('/orders');
    } finally {
      establecerEnviando(false);
      referenciaEnvio.current = false;
    }
  };

  return (
    <Estructura>
      <div className="min-h-screen bg-[#f7f4ef] text-[#172033] dark:bg-[#101010] dark:text-white">
        <section className="container mx-auto px-3 py-8 sm:px-4 lg:py-12">
          <div className="mb-8 overflow-hidden rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-main">
                  Compra segura
                </p>
                <h1 className="mt-2 font-display text-[34px] font-black leading-tight text-[#111827] dark:text-white sm:text-[46px]">
                  Finaliza tu compra
                </h1>
                <p className="mt-3 max-w-2xl text-[14px] font-semibold leading-7 text-[#667085] dark:text-[#cbd5e1]">
                  Confirma tus datos, elige el envio y completa el pedido desde
                  un flujo mas claro y cuidado.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-[18px] bg-[#f3f7f5] p-2 dark:bg-black/20">
                <IndicadorConfianza icon={FiShield} label="Seguro" />
                <IndicadorConfianza icon={FiTruck} label="Envio" />
                <IndicadorConfianza icon={FiCheckCircle} label="Confirmado" />
              </div>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_430px]">
            <form onSubmit={manejarEnvio} className="space-y-5">
              <SeccionCompra
                icon={FiUser}
                step="01"
                title="Datos personales"
                subtitle="Usaremos estos datos para identificar tu pedido.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoEntrada
                    name="firstName"
                    value={valores.firstName}
                    onChange={manejarCambio}
                    type="text"
                    placeHolder="Juan"
                    label="Nombre"
                  />
                  <CampoEntrada
                    name="lastName"
                    value={valores.lastName}
                    onChange={manejarCambio}
                    type="text"
                    placeHolder="Perez"
                    label="Apellido"
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <CampoEntrada
                    type="email"
                    name="email"
                    value={valores.email}
                    onChange={manejarCambio}
                    placeHolder="user@gmail.com"
                    label="Correo"
                  />
                  <CampoEntrada
                    type="text"
                    name="phone"
                    value={valores.phone}
                    onChange={manejarCambio}
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
                    value={valores.street}
                    onChange={manejarCambio}
                    placeHolder="Calle 123, piso 1"
                    label="Dirección"
                  />
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <CampoEntrada
                      name="city"
                      value={valores.city}
                      onChange={manejarCambio}
                      type="text"
                      placeHolder="Buenos Aires"
                      label="Ciudad"
                    />
                    <CampoEntrada
                      name="country"
                      value={valores.country}
                      onChange={manejarCambio}
                      type="text"
                      placeHolder="Argentina"
                      label="Pais"
                    />
                    <CampoEntrada
                      name="zip"
                      value={valores.zip}
                      onChange={manejarCambio}
                      type="text"
                      placeHolder="23456"
                      label="Codigo postal"
                    />
                  </div>
                  <div>
                    <p className="mb-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#8b96a8] dark:text-[#aeb7c5]">
                      Metodo de envio
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {opcionesEnvio.map((option) => (
                        <OpcionesRadio
                          key={option.value}
                          checked={opcionEnvio?.value === option.value}
                          cost={option.cost}
                          label={option.label}
                          name="shippingOption"
                          onChange={() => establecerOpcionEnvio(option)}
                          text={option.text}
                          time={option.time}
                          value={option.value}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SeccionCompra>

              <SeccionCompra
                icon={FiCreditCard}
                step="03"
                title="Datos de pago"
                subtitle="Selecciona como quieres registrar el pago.">
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
                  disabled={
                    enviando || !opcionEnvio || carrito.items.length === 0
                  }
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-main px-5 text-[14px] font-black text-white shadow-[0_18px_38px_rgba(0,200,147,0.24)] transition hover:bg-subMain disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:shadow-none">
                  {enviando ? 'Confirmando...' : 'Confirmar pedido'}{' '}
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
                shippingCost={opcionEnvio?.cost || 0}
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

function IndicadorConfianza({ icon: Icon, label: etiqueta }) {
  return (
    <span className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] bg-white px-3 py-3 text-center text-[11px] font-black text-[#526176] shadow-sm dark:bg-white/[0.07] dark:text-[#d7dde7]">
      <Icon className="text-base text-main" />
      {etiqueta}
    </span>
  );
}

export default FinalizarCompra;
