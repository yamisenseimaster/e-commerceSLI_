import React, { useEffect, useState } from 'react';
import CampoEntrada from '../CampoEntrada';
import ModalPrincipal from './ModalPrincipal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { apiAutenticacion as autenticacionApi } from '../../servicios/api';
import { AccesoFacebook, AccesoGoogle } from './AccesoSocial';
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const vacioValores = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: ''
};
function validarRegistro(valores, aceptaTerminos) {
  const errores = {};
  if (valores.name.trim().length < 2) errores.name = 'Escribe tu nombre (al menos 2 caracteres).';
  if (!patronCorreo.test(valores.email.trim())) errores.email = 'Escribe un correo válido.';
  if (valores.password.length < 8 || valores.password.length > 128 || !/[A-Za-zÀ-ÿ]/.test(valores.password) || !/\d/.test(valores.password)) {
    errores.password = 'Usa de 8 a 128 caracteres, con letras y números.';
  }
  if (valores.confirmPassword !== valores.password) errores.confirmPassword = 'Las contraseñas no coinciden.';
  if (!aceptaTerminos) errores.acceptTerms = 'Debes aceptar los términos y la política de privacidad.';
  return errores;
}
function InicioSesion({
  modalAbierto = true,
  establecerModalAbierto,
  onSuccess: alSuccess,
  soloAcceso = false
}) {
  const {
    iniciarSesion: iniciarSesion,
    registrar: registrar,
    solicitarCodigoAcceso: solicitudLoginCodigo,
    iniciarSesionConCodigo: loginConCodigo,
    iniciarSesionSocial: loginConSocial
  } = usarAutenticacion();
  const navegar = useNavigate();
  const [modo, establecerModo] = useState('login');
  const [valores, establecerValores] = useState(vacioValores);
  const [aceptaTerminos, establecerAcceptTerms] = useState(false);
  const [errores, establecerErrors] = useState({});
  const [metodos, establecerMetodos] = useState({
    emailCode: false,
    googleClientId: '',
    facebookAppId: ''
  });
  const [codigoSent, establecerCodigoSent] = useState(false);
  const [enviando, establecerEnviando] = useState(false);
  useEffect(() => {
    if (!modalAbierto || soloAcceso) return;
    autenticacionApi.methods().then(establecerMetodos).catch(() => establecerMetodos({
      emailCode: false,
      googleClientId: '',
      facebookAppId: ''
    }));
  }, [modalAbierto, soloAcceso]);
  useEffect(() => {
    if (modalAbierto) return;
    establecerValores(vacioValores);
    establecerModo('login');
    establecerAcceptTerms(false);
    establecerErrors({});
    establecerCodigoSent(false);
  }, [modalAbierto]);
  const manejarCambio = evento => {
    establecerValores(actual => ({
      ...actual,
      [evento.target.name]: evento.target.value
    }));
    establecerErrors(actual => ({
      ...actual,
      [evento.target.name]: undefined
    }));
  };
  const manejarEnvio = async evento => {
    evento.preventDefault();
    if (modo === 'code') {
      const siguienteErrors = {};
      if (!patronCorreo.test(valores.email.trim())) siguienteErrors.email = 'Escribe un correo válido.';
      if (!/^\d{6}$/.test(valores.code)) siguienteErrors.code = 'Escribe los 6 dígitos del correo.';
      establecerErrors(siguienteErrors);
      if (Object.keys(siguienteErrors).length) return;
    }
    if (modo === 'register') {
      const siguienteErrors = validarRegistro(valores, aceptaTerminos);
      establecerErrors(siguienteErrors);
      if (Object.keys(siguienteErrors).length) return;
    } else if (modo === 'login') {
      const siguienteErrors = {};
      if (!patronCorreo.test(valores.email.trim())) siguienteErrors.email = 'Escribe un correo válido.';
      if (!valores.password) siguienteErrors.password = 'Escribe tu contraseña.';
      establecerErrors(siguienteErrors);
      if (Object.keys(siguienteErrors).length) return;
    }
    establecerEnviando(true);
    try {
      let autenticadoUsuario;
      if (modo === 'register') {
        autenticadoUsuario = await registrar({
          name: valores.name.trim(),
          email: valores.email.trim(),
          password: valores.password,
          confirmPassword: valores.confirmPassword,
          acceptTerms: aceptaTerminos
        });
      } else if (modo === 'code') {
        autenticadoUsuario = await loginConCodigo({
          email: valores.email.trim(),
          code: valores.code,
          name: valores.name.trim(),
          acceptTerms: aceptaTerminos
        });
      } else {
        autenticadoUsuario = await iniciarSesion({
          email: valores.email,
          password: valores.password
        });
      }
      toast.success(modo === 'register' ? 'Cuenta creada' : 'Sesión iniciada');
      const stayAlPagina = alSuccess?.(autenticadoUsuario);
      establecerModalAbierto?.(false);
      if (!soloAcceso && !stayAlPagina) navegar(autenticadoUsuario.role === 'admin' ? '/dashboard' : '/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };
  const manejarSolicitudCodigo = async () => {
    if (!patronCorreo.test(valores.email.trim())) {
      establecerErrors(actual => ({
        ...actual,
        email: 'Escribe un correo válido.'
      }));
      return;
    }
    establecerEnviando(true);
    try {
      const resultado = await solicitudLoginCodigo({
        email: valores.email.trim()
      });
      establecerCodigoSent(true);
      toast.success(resultado.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };
  const switchModo = siguienteModo => {
    establecerModo(siguienteModo);
    establecerValores(actual => ({
      ...actual,
      password: '',
      confirmPassword: '',
      code: ''
    }));
    establecerErrors({});
    establecerCodigoSent(false);
  };
  const manejarSocialCredencial = async (proveedor, credencial) => {
    if (!aceptaTerminos || enviando) return;
    establecerEnviando(true);
    try {
      const autenticadoUsuario = await loginConSocial(proveedor, {
        ...credencial,
        acceptTerms: aceptaTerminos
      });
      toast.success('Sesión iniciada');
      const stayAlPagina = alSuccess?.(autenticadoUsuario);
      establecerModalAbierto?.(false);
      if (!soloAcceso && !stayAlPagina) navegar(autenticadoUsuario.role === 'admin' ? '/dashboard' : '/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };
  const accesoSocialConfigurado = Boolean(metodos.googleClientId || metodos.facebookAppId);
  const formulario = (
      <div className="scrollbar-invisible mx-auto max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-[#dce5e3] bg-white p-6 text-left text-[#172033] shadow-xl dark:border-[#303735] dark:bg-[#1b1d1c] dark:text-white sm:p-9">
        <h2 className="mb-2 pr-9 text-3xl font-black text-[#172033] dark:text-white">
          {modo === 'login' ? 'Iniciar sesión' : modo === 'register' ? 'Crear cuenta' : 'Acceder con código'}
        </h2>
        <p className="mb-6 text-sm text-[#667085] dark:text-[#a6b6af]">{soloAcceso ? 'Accede con tu cuenta de administrador de RePlay.' : modo === 'login' ? 'Accede a tu cuenta de RePlay.' : modo === 'register' ? 'Completa tus datos para empezar.' : 'Te enviaremos un código de 6 dígitos por correo.'}</p>
        <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-5 text-left">
          {modo === 'register' && <CampoEntrada name="name" value={valores.name} onChange={manejarCambio} label="Nombre" type="text" placeHolder="Nombre y apellido" autoComplete="name" maxLength={160} error={errores.name} />}
          <CampoEntrada name="email" value={valores.email} onChange={manejarCambio} label="Correo" type="email" placeHolder="correo@ejemplo.com" autoComplete="email" maxLength={254} error={errores.email} />
          
          {modo === 'code' && <>
              <button type="button" disabled={enviando} onClick={manejarSolicitudCodigo} className="w-full rounded-xl border border-main px-4 py-3 text-sm font-bold text-main transition hover:bg-main/10 disabled:opacity-60">
                {codigoSent ? 'Reenviar código' : 'Enviar código a mi correo'}
              </button>
              {codigoSent && <p className="-mt-3 text-xs text-[#526176] dark:text-[#a6b6af]">Revisa tu bandeja de entrada. El código vence en 10 minutos.</p>}
              <CampoEntrada name="code" value={valores.code} onChange={manejarCambio} label="Código de acceso" type="text" placeHolder="000000" autoComplete="one-time-code" maxLength={6} error={errores.code} />
              <p className="text-xs leading-5 text-[#667085] dark:text-[#a6b6af]">Si aún no tienes cuenta, escribe tu nombre y acepta las condiciones para crearla con el código.</p>
              <CampoEntrada name="name" value={valores.name} onChange={manejarCambio} label="Nombre (solo para cuenta nueva)" type="text" placeHolder="Nombre y apellido" autoComplete="name" maxLength={160} required={false} error={errores.name} />
            </>}
          {modo !== 'code' && <CampoEntrada name="password" value={valores.password} onChange={manejarCambio} label="Contraseña" type="password" placeHolder={modo === 'register' ? '8 o más caracteres, letras y números' : 'Tu contraseña'} autoComplete={modo === 'register' ? 'new-password' : 'current-password'} maxLength={128} error={errores.password} />}
          {modo === 'register' && <>
              <CampoEntrada name="confirmPassword" value={valores.confirmPassword} onChange={manejarCambio} label="Repetir contraseña" type="password" placeHolder="Vuelve a escribir tu contraseña" autoComplete="new-password" maxLength={128} error={errores.confirmPassword} />
            
            </>}
          {(modo === 'register' || modo === 'code' || accesoSocialConfigurado) && <div>
              <div className="flex items-start gap-3 text-[13px] font-medium leading-5 text-[#526176] dark:text-[#c4d0cc]">
                <input type="checkbox" aria-label="Aceptar términos y política de privacidad" checked={aceptaTerminos} onChange={evento => {
              establecerAcceptTerms(evento.target.checked);
              establecerErrors(actual => ({
                ...actual,
                acceptTerms: undefined
              }));
            }} aria-invalid={Boolean(errores.acceptTerms)} aria-describedby={errores.acceptTerms ? 'acceptTerms-error' : undefined} className="mt-1 h-4 w-4 shrink-0 accent-[#00b894]" />
                <span>He leído y acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-main underline">Términos y condiciones</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-main underline">Política de privacidad</a>{modo === 'code' || modo === 'login' ? ' si se crea una cuenta nueva.' : '.'}</span>
              </div>
              {errores.acceptTerms && <p id="acceptTerms-error" role="alert" className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">{errores.acceptTerms}</p>}
            </div>}
          <button disabled={enviando} type="submit" className="w-full rounded-xl bg-main py-3 text-center font-bold text-white transition hover:bg-subMain disabled:opacity-60">
            
            {enviando ? 'Espera por favor...' : modo === 'login' ? 'Iniciar sesión' : modo === 'register' ? 'Registrarme' : 'Ingresar con código'}
          </button>
          {!soloAcceso && <button type="button" onClick={() => switchModo(modo === 'login' ? 'register' : 'login')} className="text-sm font-semibold text-main underline">
            
            {modo === 'login' ? '¿Necesitas una cuenta? Regístrate' : modo === 'register' ? '¿Ya tienes cuenta? Inicia sesión' : 'Volver a iniciar sesión con contraseña'}
          </button>}
        </form>
        {!soloAcceso && modo !== 'code' && <>
            <div className="my-5 flex items-center gap-3 text-xs font-bold text-[#88949f] before:h-px before:flex-1 before:bg-[#dce5e3] after:h-px after:flex-1 after:bg-[#dce5e3]">o continúa con</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {metodos.googleClientId && (aceptaTerminos ? <AccesoGoogle clientId={metodos.googleClientId} onCredential={manejarSocialCredencial} onError={toast.error} /> : <button type="button" disabled className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">Google</button>)}
              {!metodos.googleClientId && <button type="button" disabled title="Pendiente de configurar Google" className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">Google</button>}
              {metodos.facebookAppId ? <AccesoFacebook appId={metodos.facebookAppId} version={metodos.facebookGraphVersion} onCredential={manejarSocialCredencial} onError={toast.error} disabled={!aceptaTerminos || enviando} /> : <button type="button" disabled title="Pendiente de configurar Facebook" className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">Facebook</button>}
            </div>
            {accesoSocialConfigurado && !aceptaTerminos && <p className="mt-2 text-center text-xs text-[#667085] dark:text-[#a6b6af]">Acepta las condiciones para continuar con Google o Facebook.</p>}
            <button type="button" disabled={!metodos.emailCode} onClick={() => switchModo('code')} className="mt-4 w-full text-center text-sm font-bold text-main hover:underline disabled:cursor-not-allowed disabled:text-[#88949f] disabled:no-underline">Ingresar con código de acceso</button>
            {!accesoSocialConfigurado && !metodos.emailCode && <p className="mt-2 text-center text-xs text-[#88949f]">Google, Facebook y el código se activan cuando se configuren sus credenciales.</p>}
          </>}
      </div>
  );
  if (soloAcceso) return formulario;

  return (
    <ModalPrincipal modalAbierto={modalAbierto} establecerModalAbierto={establecerModalAbierto} panelClassName="max-w-[440px]">
      {formulario}
    </ModalPrincipal>
  );
}
export default InicioSesion;
