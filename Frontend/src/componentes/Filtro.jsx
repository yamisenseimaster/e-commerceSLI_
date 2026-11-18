import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const Prices = [
  { name: 'Todos' },
  { name: 'Menor a mayor' },
  { name: 'Mayor a menor' },
  { name: 'Orden ascendente' },
  { name: 'Orden descendente' },
];

function Filtro({ total }) {
  const [seleccionado, establecerSeleccionado] = useState(Prices[0]);

  return (
    <div className="flex my-6 justify-between bg-deepest items-center rounded-md border border-transparent p-3 dark:border-[#303030] dark:bg-[#171717]">
      <p className="sm:text-base text-xs text-[#26344a] dark:text-[#f4f4f5]">
        Total <span className="font-bold">{total && total}</span> productos
        encontrados
      </p>
      <Listbox value={seleccionado} onChange={establecerSeleccionado}>
        <div className="relative w-32 sm:w-64">
          <Listbox.Button className="relative bg-white w-full cursor-default rounded-lg py-3 pl-3 pr-10 text-left text-xs text-[#26344a] dark:bg-[#101010] dark:text-[#f4f4f5] dark:border dark:border-[#303030]">
            <span className="block truncate">{seleccionado.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-text"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm dark:bg-[#171717] dark:ring-[#303030]">
              {Prices.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active: activo }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      activo
                        ? 'bg-main text-white'
                        : 'text-black dark:text-[#f4f4f5]'
                    }`
                  }
                  value={person}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}>
                        {person.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-main">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
export { Filtro as default };
