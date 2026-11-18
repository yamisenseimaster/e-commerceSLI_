import React from 'react';

function Pagos({ methods = [], selectedMethod, onMethodChange }) {
  const seleccionado = methods.find(
    (method) => method.value === selectedMethod,
  );
  return (
    <div>
      <label className="block text-sm font-bold" htmlFor="payment-method">
        Metodo de pago
      </label>
      <select
        id="payment-method"
        value={selectedMethod}
        onChange={(evento) => onMethodChange(evento.target.value)}
        disabled={!methods.length}
        className="mt-2 min-h-[58px] w-full rounded-[18px] border border-[#d9e0ea] bg-white px-4 text-sm font-bold dark:border-white/10 dark:bg-[#171717] dark:text-white">
        {methods.length ? (
          methods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.name}
            </option>
          ))
        ) : (
          <option value="Cash">Cargando metodos de pago...</option>
        )}
      </select>
      {seleccionado && (
        <p className="mt-3 text-sm text-[#667085] dark:text-slate-300">
          {seleccionado.description}
        </p>
      )}
    </div>
  );
}

export default Pagos;
