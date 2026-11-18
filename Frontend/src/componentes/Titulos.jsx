import React from 'react';

function Titulos({ title: titulo, Icon }) {
  return (
    <div className="w-full flex sm:gap-8 gap-4 items-center">
      <Icon className="sm:w-6 sm:h-6 w-4 h-4 text-main" />
      <h2 className="sm:text-xl text-lg font-bold text-[#172033] dark:text-[#f4f4f5]">
        {titulo}
      </h2>
    </div>
  );
}

export default Titulos;
