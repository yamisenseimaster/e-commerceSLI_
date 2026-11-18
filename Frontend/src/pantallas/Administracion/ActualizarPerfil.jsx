import React, { useEffect, useRef, useState } from 'react';
import {
  FiCamera,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import BarraLateral from './BarraLateral';
import { usarAutenticacion } from '../../Contextos/ContextoAutenticacion';

const ORIGEN_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');
const fieldClass =
  'mt-2 w-full rounded-xl border border-[#dce5e3] bg-white px-4 py-3 text-sm font-medium text-[#182a29] outline-none transition focus:border-main focus:ring-2 focus:ring-main/15 dark:border-[#343b39] dark:bg-[#202321] dark:text-white';

function ActualizarPerfil() {
  const {
    user: usuario,
    updateProfile: actualizarPerfil,
    uploadAvatar: subirAvatar,
  } = usarAutenticacion();
  const fileInput = useRef(null);
  const [valores, establecerValores] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [subiendo, establecerSubiendo] = useState(false);

  useEffect(() => {
    establecerValores({
      name: usuario?.name || '',
      phone: usuario?.phone || '',
    });
  }, [usuario?.name, usuario?.phone]);

  const handlePhoto = async (evento) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      toast.error('Selecciona una imagen JPG, PNG o WebP');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 5 MB');
      return;
    }
    establecerSubiendo(true);
    try {
      const dataUrl = await new Promise((resolver, rechazar) => {
        const lector = new FileReader();
        lector.onload = () => resolver(lector.result);
        lector.onerror = () => rechazar(new Error('No se pudo leer la imagen'));
        lector.readAsDataURL(archivo);
      });
      await subirAvatar(dataUrl);
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      toast.error(error.message);
    } finally {
      establecerSubiendo(false);
    }
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setSaving(true);
    try {
      await actualizarPerfil({
        name: valores.name.trim(),
        phone: valores.phone.trim(),
      });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const avatar = usuario?.avatar ? `${ORIGEN_API}${usuario.avatar}` : null;
  const role = usuario?.role === 'admin' ? 'Administrador' : 'Cliente';

  return (
    <BarraLateral title="Mi perfil" eyebrow="Cuenta">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-[#dce5e3] bg-white shadow-sm dark:border-[#303735] dark:bg-[#1b1d1c]">
          <div className="h-28 bg-gradient-to-r from-[#073d35] via-[#087c67] to-[#00b894] sm:h-36" />
          <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={subiendo}
                className="group relative -mt-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#e4f7f1] text-3xl font-black text-[#087c67] shadow-md disabled:opacity-60 dark:border-[#1b1d1c] dark:bg-[#12362f] sm:h-28 sm:w-28"
                aria-label="Cambiar foto de perfil"
                title="Cambiar foto de perfil">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (usuario?.name?.charAt(0) || 'U').toUpperCase()
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <FiCamera />
                </span>
              </button>
              <div className="min-w-0 pb-1">
                <h2 className="truncate text-xl font-black text-[#182a29] dark:text-white sm:text-2xl">
                  {usuario?.name || 'Mi cuenta'}
                </h2>
                <p className="text-sm text-[#687b76] dark:text-[#a6b6af]">
                  {role} · {usuario?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={subiendo}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#b9ddd1] px-4 text-sm font-bold text-[#087c67] transition hover:bg-[#eaf8f3] disabled:opacity-60 dark:border-[#285849] dark:text-[#62d9b1] dark:hover:bg-[#12362f]">
              <FiCamera />{' '}
              {subiendo
                ? 'Subiendo foto...'
                : avatar
                  ? 'Cambiar foto'
                  : 'Subir foto'}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhoto}
              aria-label="Seleccionar foto de perfil"
            />
          </div>
        </section>

        <form
          onSubmit={manejarEnvio}
          className="rounded-2xl border border-[#dce5e3] bg-white p-5 shadow-sm dark:border-[#303735] dark:bg-[#1b1d1c] sm:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-black text-[#182a29] dark:text-white">
              Información personal
            </h3>
            <p className="mt-1 text-sm text-[#687b76] dark:text-[#a6b6af]">
              Actualiza los datos de tu cuenta.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-[#314840] dark:text-[#d7e5dd]">
              <span className="inline-flex items-center gap-2">
                <FiUser /> Nombre
              </span>
              <input
                className={fieldClass}
                name="name"
                value={valores.name}
                onChange={(evento) =>
                  establecerValores((actual) => ({
                    ...actual,
                    name: evento.target.value,
                  }))
                }
                required
                maxLength={160}
                autoComplete="name"
              />
            </label>
            <label className="text-sm font-bold text-[#314840] dark:text-[#d7e5dd]">
              <span className="inline-flex items-center gap-2">
                <FiPhone /> Teléfono
              </span>
              <input
                className={fieldClass}
                name="phone"
                value={valores.phone}
                onChange={(evento) =>
                  establecerValores((actual) => ({
                    ...actual,
                    phone: evento.target.value,
                  }))
                }
                type="tel"
                maxLength={40}
                autoComplete="tel"
                placeholder="Tu número de teléfono"
              />
            </label>
            <label className="text-sm font-bold text-[#314840] dark:text-[#d7e5dd]">
              <span className="inline-flex items-center gap-2">
                <FiMail /> Correo
              </span>
              <input
                className={`${fieldClass} cursor-not-allowed opacity-70`}
                value={usuario?.email || ''}
                type="email"
                disabled
              />
            </label>
            <div className="text-sm font-bold text-[#314840] dark:text-[#d7e5dd]">
              <span className="inline-flex items-center gap-2">
                <FiShield /> Rol de la cuenta
              </span>
              <div className="mt-2 flex min-h-[46px] items-center rounded-xl border border-[#c8eadf] bg-[#edf9f4] px-4 font-semibold text-[#087c67] dark:border-[#285849] dark:bg-[#12362f] dark:text-[#62d9b1]">
                {role}
              </div>
            </div>
          </div>
          <div className="mt-7 flex justify-end border-t border-[#e5eeea] pt-5 dark:border-[#303735]">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-main px-6 text-sm font-bold text-white transition hover:bg-subMain disabled:opacity-60 sm:w-auto">
              <FiSave /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </BarraLateral>
  );
}

export default ActualizarPerfil;
