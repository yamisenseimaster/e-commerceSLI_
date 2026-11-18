import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CampoEntrada from '../../componentes/CampoEntrada';
import BarraLateral from './BarraLateral';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
function Contrasena() {
  const {
    cambiarContrasena: cambiarContrasena
  } = usarAutenticacion();
  const [valores, establecerValores] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [enviando, establecerEnviando] = useState(false);
  const manejarCambio = evento => {
    establecerValores(actual => ({
      ...actual,
      [evento.target.name]: evento.target.value
    }));
  };
  const manejarEnvio = async evento => {
    evento.preventDefault();
    if (valores.newPassword !== valores.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    establecerEnviando(true);
    try {
      await cambiarContrasena({
        currentPassword: valores.currentPassword,
        newPassword: valores.newPassword
      });
      establecerValores({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Contrasena actualizada');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };
  return <BarraLateral>
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Cambiar contrasena</h2>
        <CampoEntrada name="currentPassword" value={valores.currentPassword} onChange={manejarCambio} type="password" placeHolder="*******" label="Contrasena actual" />
        
        <CampoEntrada name="newPassword" value={valores.newPassword} onChange={manejarCambio} type="password" placeHolder="Minimo 8 caracteres" label="Nueva contrasena" />
        
        <CampoEntrada name="confirmPassword" value={valores.confirmPassword} onChange={manejarCambio} type="password" placeHolder="Repite la nueva contrasena" label="Confirmar contrasena" />
        
        <div className="flex justify-end items-center my-4">
          <button disabled={enviando} className="bg-main sm:w-auto w-full font-medium text-white py-3 px-6 rounded disabled:opacity-60">
            
            {enviando ? 'Actualizando...' : 'Cambiar contrasena'}
          </button>
        </div>
      </form>
    </BarraLateral>;
}
export default Contrasena;
