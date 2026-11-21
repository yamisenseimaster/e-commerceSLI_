import React, { useEffect, useState } from 'react';
import CampoEntrada from '../CampoEntrada';
import ModalPrincipal from './ModalPrincipal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
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
  } = usarAutenticacion();
  const navegar = useNavigate();
  const [modo, establecerModo] = useState('login');
  const [valores, establecerValores] = useState(emptyValues);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [enviando, establecerEnviando] = useState(false);

  useEffect(() => {
    if (modalAbierto) return;
    establecerValores(emptyValues);
    establecerModo('login');
    setAcceptTerms(false);
    setErrors({});
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

  const switchMode = (nextMode) => {
    establecerModo(nextMode);
    establecerValores((actual) => ({
      ...actual,
      password: '',
      confirmPassword: '',
    }));
    setErrors({});
  };

  return (
    <ModalPrincipal
      modalOpen={modalAbierto}
      setModalOpen={establecerModalAbierto}
      panelClassName="max-w-[440px]">
      <div className="scrollbar-invisible mx-auto max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-[#dce5e3] bg-white p-6 text-left text-[#172033] shadow-xl dark:border-[#303735] dark:bg-[#1b1d1c] dark:text-white sm:p-9">
        <h2 className="mb-2 pr-9 text-3xl font-black text-[#172033] dark:text-white">
          {modo === 'login'
            ? 'Iniciar sesión'
            : 'Crear cuenta'}
        </h2>
        <p className="mb-6 text-sm text-[#667085] dark:text-[#a6b6af]">
          {modo === 'login'
            ? 'Accede a tu cuenta de Mercadito.'
            : 'Completa tus datos para empezar.'}
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
          {modo === 'register' && (
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
                  </a>.
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
                : 'Registrarme'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(modo === 'login' ? 'register' : 'login')}
            className="text-sm font-semibold text-main underline">
            {modo === 'login'
              ? '¿Necesitas una cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </ModalPrincipal>
  );
}

export default InicioSesion;
