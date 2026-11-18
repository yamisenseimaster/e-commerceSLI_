import React, { useEffect, useState } from 'react';
import CampoEntrada from '../CampoEntrada';
import ModalPrincipal from './ModalPrincipal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';
import { apiAutenticacion } from '../../servicios/api';
import { AccesoFacebook, AccesoGoogle } from './AccesoSocial';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: '',
};

function validateRegistration(valores, acceptTerms) {
  const errors = {};
  if (valores.name.trim().length < 2)
    errors.name = 'Escribe tu nombre (al menos 2 caracteres).';
  if (!emailPattern.test(valores.email.trim()))
    errors.email = 'Escribe un correo válido.';
  if (
    valores.password.length < 8 ||
    valores.password.length > 128 ||
    !/[A-Za-zÀ-ÿ]/.test(valores.password) ||
    !/\d/.test(valores.password)
  ) {
    errors.password = 'Usa de 8 a 128 caracteres, con letras y números.';
  }
  if (valores.confirmPassword !== valores.password)
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  if (!acceptTerms)
    errors.acceptTerms =
      'Debes aceptar los términos y la política de privacidad.';
  return errors;
}

function InicioSesion({
  modalOpen: modalAbierto,
  setModalOpen: establecerModalAbierto,
  onSuccess: alCompletar,
}) {
  const {
    login: iniciarSesion,
    register: registrar,
    requestLoginCode: solicitarCodigoAcceso,
    loginWithCode: iniciarSesionConCodigo,
    loginWithSocial: iniciarSesionSocial,
  } = usarAutenticacion();
  const navegar = useNavigate();
  const [modo, establecerModo] = useState('login');
  const [valores, establecerValores] = useState(emptyValues);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [methods, setMethods] = useState({
    emailCode: false,
    googleClientId: '',
    facebookAppId: '',
  });
  const [codeSent, setCodeSent] = useState(false);
  const [enviando, establecerEnviando] = useState(false);

  useEffect(() => {
    if (!modalAbierto) return;
    apiAutenticacion
      .metodos()
      .then(setMethods)
      .catch(() =>
        setMethods({ emailCode: false, googleClientId: '', facebookAppId: '' }),
      );
  }, [modalAbierto]);

  useEffect(() => {
    if (modalAbierto) return;
    establecerValores(emptyValues);
    establecerModo('login');
    setAcceptTerms(false);
    setErrors({});
    setCodeSent(false);
  }, [modalAbierto]);

  const manejarCambio = (evento) => {
    establecerValores((actual) => ({
      ...actual,
      [evento.target.name]: evento.target.value,
    }));
    setErrors((actual) => ({ ...actual, [evento.target.name]: undefined }));
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (modo === 'code') {
      const nextErrors = {};
      if (!emailPattern.test(valores.email.trim()))
        nextErrors.email = 'Escribe un correo válido.';
      if (!/^\d{6}$/.test(valores.code))
        nextErrors.code = 'Escribe los 6 dígitos del correo.';
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
    }
    if (modo === 'register') {
      const nextErrors = validateRegistration(valores, acceptTerms);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
    } else if (modo === 'login') {
      const nextErrors = {};
      if (!emailPattern.test(valores.email.trim()))
        nextErrors.email = 'Escribe un correo válido.';
      if (!valores.password) nextErrors.password = 'Escribe tu contraseña.';
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
    }
    establecerEnviando(true);

    try {
      let loggedUser;

      if (modo === 'register') {
        loggedUser = await registrar({
          name: valores.name.trim(),
          email: valores.email.trim(),
          password: valores.password,
          confirmPassword: valores.confirmPassword,
          acceptTerms,
        });
      } else if (modo === 'code') {
        loggedUser = await iniciarSesionConCodigo({
          email: valores.email.trim(),
          code: valores.code,
          name: valores.name.trim(),
          acceptTerms,
        });
      } else {
        loggedUser = await iniciarSesion({
          email: valores.email,
          password: valores.password,
        });
      }

      toast.success(modo === 'register' ? 'Cuenta creada' : 'Sesión iniciada');
      const stayOnPage = alCompletar?.(loggedUser);
      establecerModalAbierto(false);
      if (!stayOnPage)
        navegar(loggedUser.role === 'admin' ? '/dashboard' : '/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };

  const handleRequestCode = async () => {
    if (!emailPattern.test(valores.email.trim())) {
      setErrors((actual) => ({
        ...actual,
        email: 'Escribe un correo válido.',
      }));
      return;
    }
    establecerEnviando(true);
    try {
      const resultado = await solicitarCodigoAcceso({
        email: valores.email.trim(),
      });
      setCodeSent(true);
      toast.success(resultado.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };

  const switchMode = (nextMode) => {
    establecerModo(nextMode);
    establecerValores((actual) => ({
      ...actual,
      password: '',
      confirmPassword: '',
      code: '',
    }));
    setErrors({});
    setCodeSent(false);
  };

  const handleSocialCredential = async (proveedor, credential) => {
    if (!acceptTerms || enviando) return;
    establecerEnviando(true);
    try {
      const loggedUser = await iniciarSesionSocial(proveedor, {
        ...credential,
        acceptTerms,
      });
      toast.success('Sesión iniciada');
      const stayOnPage = alCompletar?.(loggedUser);
      establecerModalAbierto(false);
      if (!stayOnPage)
        navegar(loggedUser.role === 'admin' ? '/dashboard' : '/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerEnviando(false);
    }
  };

  const socialConfigured = Boolean(
    methods.googleClientId || methods.facebookAppId,
  );

  return (
    <ModalPrincipal
      modalOpen={modalAbierto}
      setModalOpen={establecerModalAbierto}
      panelClassName="max-w-[440px]">
      <div className="scrollbar-invisible mx-auto max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-[#dce5e3] bg-white p-6 text-left text-[#172033] shadow-xl dark:border-[#303735] dark:bg-[#1b1d1c] dark:text-white sm:p-9">
        <h2 className="mb-2 pr-9 text-3xl font-black text-[#172033] dark:text-white">
          {modo === 'login'
            ? 'Iniciar sesión'
            : modo === 'register'
              ? 'Crear cuenta'
              : 'Acceder con código'}
        </h2>
        <p className="mb-6 text-sm text-[#667085] dark:text-[#a6b6af]">
          {modo === 'login'
            ? 'Accede a tu cuenta de Mercadito.'
            : modo === 'register'
              ? 'Completa tus datos para empezar.'
              : 'Te enviaremos un código de 6 dígitos por correo.'}
        </p>
        <form
          onSubmit={manejarEnvio}
          noValidate
          className="flex flex-col gap-5 text-left">
          {modo === 'register' && (
            <CampoEntrada
              name="name"
              value={valores.name}
              onChange={manejarCambio}
              label="Nombre"
              type="text"
              placeHolder="Nombre y apellido"
              autoComplete="name"
              maxLength={160}
              error={errors.name}
            />
          )}
          <CampoEntrada
            name="email"
            value={valores.email}
            onChange={manejarCambio}
            label="Correo"
            type="email"
            placeHolder="correo@ejemplo.com"
            autoComplete="email"
            maxLength={254}
            error={errors.email}
          />

          {modo === 'code' && (
            <>
              <button
                type="button"
                disabled={enviando}
                onClick={handleRequestCode}
                className="w-full rounded-xl border border-main px-4 py-3 text-sm font-bold text-main transition hover:bg-main/10 disabled:opacity-60">
                {codeSent ? 'Reenviar código' : 'Enviar código a mi correo'}
              </button>
              {codeSent && (
                <p className="-mt-3 text-xs text-[#526176] dark:text-[#a6b6af]">
                  Revisa tu bandeja de entrada. El código vence en 10 minutos.
                </p>
              )}
              <CampoEntrada
                name="code"
                value={valores.code}
                onChange={manejarCambio}
                label="Código de acceso"
                type="text"
                placeHolder="000000"
                autoComplete="one-time-code"
                maxLength={6}
                error={errors.code}
              />
              <p className="text-xs leading-5 text-[#667085] dark:text-[#a6b6af]">
                Si aún no tienes cuenta, escribe tu nombre y acepta las
                condiciones para crearla con el código.
              </p>
              <CampoEntrada
                name="name"
                value={valores.name}
                onChange={manejarCambio}
                label="Nombre (solo para cuenta nueva)"
                type="text"
                placeHolder="Nombre y apellido"
                autoComplete="name"
                maxLength={160}
                required={false}
                error={errors.name}
              />
            </>
          )}
          {modo !== 'code' && (
            <CampoEntrada
              name="password"
              value={valores.password}
              onChange={manejarCambio}
              label="Contraseña"
              type="password"
              placeHolder={
                modo === 'register'
                  ? '8 o más caracteres, letras y números'
                  : 'Tu contraseña'
              }
              autoComplete={
                modo === 'register' ? 'new-password' : 'current-password'
              }
              maxLength={128}
              error={errors.password}
            />
          )}
          {modo === 'register' && (
            <>
              <CampoEntrada
                name="confirmPassword"
                value={valores.confirmPassword}
                onChange={manejarCambio}
                label="Repetir contraseña"
                type="password"
                placeHolder="Vuelve a escribir tu contraseña"
                autoComplete="new-password"
                maxLength={128}
                error={errors.confirmPassword}
              />
            </>
          )}
          {(modo === 'register' || modo === 'code' || socialConfigured) && (
            <div>
              <div className="flex items-start gap-3 text-[13px] font-medium leading-5 text-[#526176] dark:text-[#c4d0cc]">
                <input
                  type="checkbox"
                  aria-label="Aceptar términos y política de privacidad"
                  checked={acceptTerms}
                  onChange={(evento) => {
                    setAcceptTerms(evento.target.checked);
                    setErrors((actual) => ({
                      ...actual,
                      acceptTerms: undefined,
                    }));
                  }}
                  aria-invalid={Boolean(errors.acceptTerms)}
                  aria-describedby={
                    errors.acceptTerms ? 'acceptTerms-error' : undefined
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#00b894]"
                />
                <span>
                  He leído y acepto los{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-main underline">
                    Términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-main underline">
                    Política de privacidad
                  </a>
                  {modo === 'code' || modo === 'login'
                    ? ' si se crea una cuenta nueva.'
                    : '.'}
                </span>
              </div>
              {errors.acceptTerms && (
                <p
                  id="acceptTerms-error"
                  role="alert"
                  className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  {errors.acceptTerms}
                </p>
              )}
            </div>
          )}
          <button
            disabled={enviando}
            type="submit"
            className="w-full rounded-xl bg-main py-3 text-center font-bold text-white transition hover:bg-subMain disabled:opacity-60">
            {enviando
              ? 'Espera por favor...'
              : modo === 'login'
                ? 'Iniciar sesión'
                : modo === 'register'
                  ? 'Registrarme'
                  : 'Ingresar con código'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(modo === 'login' ? 'register' : 'login')}
            className="text-sm font-semibold text-main underline">
            {modo === 'login'
              ? '¿Necesitas una cuenta? Regístrate'
              : modo === 'register'
                ? '¿Ya tienes cuenta? Inicia sesión'
                : 'Volver a iniciar sesión con contraseña'}
          </button>
        </form>
        {modo !== 'code' && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs font-bold text-[#88949f] before:h-px before:flex-1 before:bg-[#dce5e3] after:h-px after:flex-1 after:bg-[#dce5e3]">
              o continúa con
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {methods.googleClientId &&
                (acceptTerms ? (
                  <AccesoGoogle
                    clientId={methods.googleClientId}
                    onCredential={handleSocialCredential}
                    onError={toast.error}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">
                    Google
                  </button>
                ))}
              {!methods.googleClientId && (
                <button
                  type="button"
                  disabled
                  title="Pendiente de configurar Google"
                  className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">
                  Google
                </button>
              )}
              {methods.facebookAppId ? (
                <AccesoFacebook
                  appId={methods.facebookAppId}
                  version={methods.facebookGraphVersion}
                  onCredential={handleSocialCredential}
                  onError={toast.error}
                  disabled={!acceptTerms || enviando}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  title="Pendiente de configurar Facebook"
                  className="h-11 rounded-xl border border-[#d9e0ea] bg-white text-sm font-bold text-[#26344a] opacity-50 dark:border-[#303735]">
                  Facebook
                </button>
              )}
            </div>
            {socialConfigured && !acceptTerms && (
              <p className="mt-2 text-center text-xs text-[#667085] dark:text-[#a6b6af]">
                Acepta las condiciones para continuar con Google o Facebook.
              </p>
            )}
            <button
              type="button"
              disabled={!methods.emailCode}
              onClick={() => switchMode('code')}
              className="mt-4 w-full text-center text-sm font-bold text-main hover:underline disabled:cursor-not-allowed disabled:text-[#88949f] disabled:no-underline">
              Ingresar con código de acceso
            </button>
            {!socialConfigured && !methods.emailCode && (
              <p className="mt-2 text-center text-xs text-[#88949f]">
                Google, Facebook y el código se activan cuando se configuren sus
                credenciales.
              </p>
            )}
          </>
        )}
      </div>
    </ModalPrincipal>
  );
}

export default InicioSesion;
