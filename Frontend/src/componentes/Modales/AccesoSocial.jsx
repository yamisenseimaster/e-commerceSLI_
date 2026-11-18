import { useEffect, useRef, useState } from 'react';

const pendingScripts = new Map();

function loadScript(url) {
  if (pendingScripts.has(url)) return pendingScripts.get(url);
  const promise = new Promise((resolver, rechazar) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = resolver;
    script.onerror = () =>
      rechazar(new Error('No se pudo cargar el proveedor de acceso'));
    document.head.appendChild(script);
  });
  pendingScripts.set(url, promise);
  promise.catch(() => pendingScripts.delete(url));
  return promise;
}

function AccesoGoogle({
  clientId,
  onCredential: alRecibirCredencial,
  onError: alFallar,
}) {
  const target = useRef(null);
  const callback = useRef(alRecibirCredencial);
  callback.current = alRecibirCredencial;

  useEffect(() => {
    let activo = true;
    loadScript('https://accounts.google.com/gsi/client?hl=es')
      .then(() => {
        if (!activo || !target.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (respuesta) =>
            callback.current('google', { credential: respuesta.credential }),
        });
        target.current.replaceChildren();
        window.google.accounts.id.renderButton(target.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'es',
          width: 160,
        });
      })
      .catch(() => {
        if (activo) alFallar('No se pudo cargar Google. Intenta nuevamente.');
      });
    return () => {
      activo = false;
    };
  }, [clientId, alFallar]);

  return (
    <div
      ref={target}
      className="flex min-h-11 items-center justify-center overflow-hidden rounded-xl bg-white"
    />
  );
}
export { AccesoGoogle };

function AccesoFacebook({
  appId,
  version,
  onCredential: alRecibirCredencial,
  onError: alFallar,
  disabled: deshabilitado,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let activo = true;
    loadScript('https://connect.facebook.net/es_LA/sdk.js')
      .then(() => {
        if (!activo || !window.FB) return;
        window.FB.init({ appId, cookie: false, xfbml: false, version });
        setReady(true);
      })
      .catch(() => {
        if (activo) alFallar('No se pudo cargar Facebook. Intenta nuevamente.');
      });
    return () => {
      activo = false;
    };
  }, [appId, version, alFallar]);

  const handleClick = () => {
    window.FB.login(
      (respuesta) => {
        const credencial = respuesta?.authResponse?.accessToken;
        if (credencial)
          alRecibirCredencial('facebook', { accessToken: credencial });
      },
      { scope: 'public_profile,email' },
    );
  };

  return (
    <button
      type="button"
      disabled={deshabilitado || !ready}
      onClick={handleClick}
      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-bold text-[#26344a] shadow-sm transition hover:border-[#1877f2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#303735]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] font-black text-white">
        f
      </span>{' '}
      Facebook
    </button>
  );
}
export { AccesoFacebook };
