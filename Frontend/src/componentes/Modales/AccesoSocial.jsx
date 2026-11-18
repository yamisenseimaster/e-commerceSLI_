import { useEffect, useRef, useState } from 'react';
const pendienteScripts = new Map();
function cargarScript(url) {
  if (pendienteScripts.has(url)) return pendienteScripts.get(url);
  const promesa = new Promise((resolver, rechazar) => {
    const guion = document.createElement('script');
    guion.src = url;
    guion.async = true;
    guion.onload = resolver;
    guion.onerror = () => rechazar(new Error('No se pudo cargar el proveedor de acceso'));
    document.head.appendChild(guion);
  });
  pendienteScripts.set(url, promesa);
  promesa.catch(() => pendienteScripts.delete(url));
  return promesa;
}
function AccesoGoogle({
  clientId: clienteId,
  onCredential: alCredencial,
  onError: alError
}) {
  const destino = useRef(null);
  const retorno = useRef(alCredencial);
  retorno.current = alCredencial;
  useEffect(() => {
    let activo = true;
    cargarScript('https://accounts.google.com/gsi/client?hl=es').then(() => {
      if (!activo || !destino.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clienteId,
        callback: respuesta => retorno.current('google', {
          credential: respuesta.credential
        })
      });
      destino.current.replaceChildren();
      window.google.accounts.id.renderButton(destino.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        locale: 'es',
        width: 160
      });
    }).catch(() => {
      if (activo) alError('No se pudo cargar Google. Intenta nuevamente.');
    });
    return () => {
      activo = false;
    };
  }, [clienteId, alError]);
  return <div ref={destino} className="flex min-h-11 items-center justify-center overflow-hidden rounded-xl bg-white" />;
}
export { AccesoGoogle };
function AccesoFacebook({
  appId: idAplicacion,
  version,
  onCredential: alCredencial,
  onError: alError,
  disabled: deshabilitado
}) {
  const [listo, establecerReady] = useState(false);
  useEffect(() => {
    let activo = true;
    cargarScript('https://connect.facebook.net/es_LA/sdk.js').then(() => {
      if (!activo || !window.FB) return;
      window.FB.init({
        appId: idAplicacion,
        cookie: false,
        xfbml: false,
        version
      });
      establecerReady(true);
    }).catch(() => {
      if (activo) alError('No se pudo cargar Facebook. Intenta nuevamente.');
    });
    return () => {
      activo = false;
    };
  }, [idAplicacion, version, alError]);
  const manejarClic = () => {
    window.FB.iniciarSesion(respuesta => {
      const token = respuesta?.authResponse?.accessToken;
      if (token) alCredencial('facebook', {
        accessToken: token
      });
    }, {
      scope: 'public_profile,email'
    });
  };
  return <button type="button" disabled={deshabilitado || !listo} onClick={manejarClic} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-bold text-[#26344a] shadow-sm transition hover:border-[#1877f2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#303735]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] font-black text-white">f</span> Facebook
    </button>;
}
export { AccesoFacebook };
