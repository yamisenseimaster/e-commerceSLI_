import React, { Fragment, useRef } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from '@headlessui/react';
import { IoClose } from 'react-icons/io5';

const ModalPrincipal = ({
  modalOpen: modalAbierto,
  setModalOpen: establecerModalAbierto,
  children: hijos,
  panelClassName = 'max-w-[980px]',
}) => {
  const cancelButtonRef = useRef();

  return (
    <>
      <Transition appear show={modalAbierto} as={Fragment}>
        <Dialog
          as="div"
          className="scrollbar-invisible fixed inset-0 z-30 overflow-y-auto text-center"
          onClose={() => establecerModalAbierto(false)}
          initialFocus={cancelButtonRef}>
          <div className="min-h-screen px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 ">
              <DialogBackdrop className="fixed inset-0 bg-black opacity-60" />
            </Transition.Child>

            {/* Este elemento ayuda a centrar el contenido de la ventana. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <DialogPanel
                className={`relative inline-block w-full align-middle ${panelClassName}`}>
                {hijos}
                <button
                  ref={cancelButtonRef}
                  onClick={() => establecerModalAbierto(false)}
                  type="button"
                  aria-label="Cerrar ventana"
                  className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dce5e3] bg-white text-[#526176] shadow-sm transition hover:bg-[#eaf8f3] hover:text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-main dark:border-[#303735] dark:bg-[#2a2d2b] dark:text-white dark:hover:bg-[#12362f]">
                  <IoClose />
                </button>
              </DialogPanel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default React.memo(ModalPrincipal);
