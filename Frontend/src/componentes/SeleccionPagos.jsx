import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import React, { useMemo, useState } from 'react';
import { CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { FaRegCreditCard } from 'react-icons/fa';
import ModalBilleteras from './Modales/ConectarBilletera';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_6pRNASCoBOKtIshFeQd4XMUh';
const stripePromise = loadStripe(stripePublishableKey);

export const PayPal = () => {
  const initialOptions = {
    'client-id': 'test',
    currency: 'USD',
    intent: 'capture',
  };
  return (
    <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e6ebf2] bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.05]">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons />
      </PayPalScriptProvider>
    </div>
  );
};

export const Bitcoin = () => {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  return (
    <div className="mt-4">
      <ModalBilleteras
        modalOpen={modalAbierto}
        setModalOpen={establecerModalAbierto}
      />
      <button
        onClick={() => {
          establecerModalAbierto(!modalAbierto);
        }}
        type="button"
        className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full bg-main px-4 text-sm font-black text-white shadow-[0_12px_26px_rgba(0,200,147,0.20)] transition hover:bg-subMain">
        <FaRegCreditCard /> Conectar billetera
      </button>
    </div>
  );
};

export const Stripe = () => {
  const useOptions = () => {
    const options = useMemo(
      () => ({
        style: {
          invalid: {
            color: '#FF1E1E',
          },
        },
      }),
      [],
    );

    return options;
  };

  const opciones = useOptions();

  return (
    <div className="mt-4 rounded-[18px] border border-[#e6ebf2] bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05]">
      <Elements stripe={stripePromise}>
        <label>
          <CardElement
            options={opciones}
            className="rounded-[14px] bg-[#f8fbff] px-4 py-4 text-black shadow-inner dark:bg-white"
          />
        </label>
      </Elements>
    </div>
  );
};
