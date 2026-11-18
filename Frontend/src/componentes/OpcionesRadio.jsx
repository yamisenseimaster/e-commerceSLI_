import React from 'react';
import { FiTruck } from 'react-icons/fi';

function OpcionesRadio({
  checked: marcado = false,
  cost,
  label: etiqueta,
  name: nombre = 'shippingOption',
  onChange: alCambiar,
  text: texto,
  time,
  value: valor,
}) {
  return (
    <div>
      <label
        className={`block cursor-pointer rounded-[18px] border p-4 transition ${
          marcado
            ? 'border-main bg-main/10 shadow-[0_18px_35px_rgba(0,200,147,0.13)]'
            : 'border-[#d9e0ea] bg-white/76 hover:border-main/50 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:border-main/50'
        }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${marcado ? 'bg-main text-white' : 'bg-[#f3f7ff] text-main dark:bg-white/[0.08]'}`}>
              <FiTruck />
            </span>
            <div className="min-w-0">
              <h6 className="text-[14px] font-black text-[#172033] dark:text-white">
                {etiqueta || valor}
              </h6>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-[#7b8798] dark:text-[#aeb7c5]">
                {time} · {texto || valor}
              </p>
              <p className="mt-2 text-[15px] font-black text-main">
                ${Number(cost || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <input
            checked={marcado}
            name={nombre}
            onChange={alCambiar}
            type="radio"
            value={valor}
            className="mt-1 h-5 w-5 border-[#cfd9e8] text-main focus:ring-main"
          />
        </div>
      </label>
    </div>
  );
}

export default OpcionesRadio;
