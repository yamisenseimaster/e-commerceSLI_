import React from 'react';

function CampoEntrada({
  placeHolder,
  type,
  label: etiqueta,
  name: nombre,
  value: valor,
  onChange: alCambiar,
  onBlur,
  disabled: deshabilitado,
  error,
  autoComplete,
  minLength,
  maxLength,
  required = true,
}) {
  return (
    <div className="text-sm">
      <label
        htmlFor={nombre}
        className="font-black text-[#526176] dark:text-[#d7dde7]">
        {etiqueta}
      </label>
      <input
        id={nombre}
        required={required}
        name={nombre}
        type={type}
        value={valor}
        onChange={alCambiar}
        onBlur={onBlur}
        disabled={deshabilitado}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${nombre}-error` : undefined}
        placeholder={placeHolder}
        className={`mt-2 h-12 w-full rounded-[14px] border bg-white/90 px-4 text-[14px] font-semibold text-[#26344a] outline-none transition placeholder:text-[#a9b4c4] focus:ring-4 disabled:bg-[#eef2f7] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-[#6b7280] ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#d9e0ea] focus:border-main focus:ring-main/10 dark:border-white/[0.08]'}`}
      />

      {error && (
        <p
          id={`${nombre}-error`}
          role="alert"
          className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default CampoEntrada;
