import axios from 'axios';
import { traducirCatalogo } from '../utilidades/localizacion';

const URL_API = import.meta.env.VITE_API_URL || '/api';

const cliente = axios.create({
  baseURL: URL_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

cliente.interceptors.request.use((configuracion) => {
  const credencial = localStorage.getItem('authToken');

  if (credencial) {
    configuracion.headers.Authorization = `Bearer ${credencial}`;
  }

  return configuracion;
}, undefined, { synchronous: true });

class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.status = estado;
  }
}
export { ErrorApi };

async function solicitarApi(ruta, opciones = {}) {
  try {
    const respuesta = await cliente.request({
      url: ruta,
      method: opciones.method || 'GET',
      data: opciones.body ? JSON.parse(opciones.body) : opciones.data,
      headers: opciones.headers,
    });

    return respuesta.status === 204
      ? null
      : traducirCatalogo(respuesta.data?.data);
  } catch (error) {
    const estado = error.response?.status || 500;
    if (
      estado === 401 &&
      !ruta.startsWith('/auth/login') &&
      !ruta.startsWith('/auth/register')
    ) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    const mensaje =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'La solicitud fallo';
    throw new ErrorApi(mensaje, estado);
  }
}
export { solicitarApi };

const apiProductos = {
  listar: (parametros = {}) => {
    const busqueda = new URLSearchParams();

    Object.entries(parametros).forEach(([clave, valor]) => {
      if (valor) busqueda.set(clave, valor);
    });

    const sufijo = busqueda.toString() ? `?${busqueda}` : '';
    return solicitarApi(`/products${sufijo}`);
  },
};
export { apiProductos };

const apiAutenticacion = {
  metodos: () => solicitarApi('/auth/methods'),
  solicitarCodigo: (cuerpo) =>
    solicitarApi('/auth/code/request', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  verificarCodigo: (cuerpo) =>
    solicitarApi('/auth/code/verify', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  google: (cuerpo) =>
    solicitarApi('/auth/social/google', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  facebook: (cuerpo) =>
    solicitarApi('/auth/social/facebook', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  cerrarSesion: () => solicitarApi('/auth/logout', { method: 'POST' }),
  iniciarSesion: (cuerpo) =>
    solicitarApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  registrar: (cuerpo) =>
    solicitarApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  consultarPerfil: () => solicitarApi('/auth/me'),
  actualizarPerfil: (cuerpo) =>
    solicitarApi('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(cuerpo),
    }),
  subirAvatar: (dataUrl) =>
    solicitarApi('/auth/me/avatar', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    }),
  cambiarContrasena: (cuerpo) =>
    solicitarApi('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(cuerpo),
    }),
};
export { apiAutenticacion };

const apiCarrito = {
  obtener: () => solicitarApi('/cart'),
  agregar: (cuerpo) =>
    solicitarApi('/cart/items', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  actualizar: (idProducto, cantidad) =>
    solicitarApi(`/cart/items/${idProducto}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: cantidad }),
    }),
  eliminar: (idProducto) =>
    solicitarApi(`/cart/items/${idProducto}`, {
      method: 'DELETE',
    }),
};
export { apiCarrito };

const apiPedidos = {
  listar: () => solicitarApi('/orders'),
  crear: (cuerpo, clave) =>
    solicitarApi('/orders', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
      headers: { 'Idempotency-Key': clave },
    }),
};
export { apiPedidos };

const apiPagos = {
  configuracion: () => solicitarApi('/payments/config'),
  verificar: (sessionId) =>
    solicitarApi('/payments/verify', { method: 'POST', data: { sessionId } }),
  crearIntento: (cuerpo) =>
    solicitarApi('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
};
export { apiPagos };

const apiConversaciones = {
  estado: () => solicitarApi('/chat/status'),
  listar: (busqueda = '') => {
    const consulta = busqueda ? `?search=${encodeURIComponent(busqueda)}` : '';
    return solicitarApi(`/chat/conversations${consulta}`);
  },
  crearConversacion: (cuerpo) =>
    solicitarApi('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  eliminarConversacion: (conversationId) =>
    solicitarApi(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    }),
  mensajes: (conversationId) =>
    solicitarApi(`/chat/conversations/${conversationId}/messages`),
  enviarMensaje: (conversationId, cuerpo) =>
    solicitarApi(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  enviarAdjunto: (conversationId, cuerpo) =>
    solicitarApi(`/chat/conversations/${conversationId}/media`, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  simularMensajeEntrante: (conversationId, cuerpo) =>
    solicitarApi(`/chat/conversations/${conversationId}/incoming`, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  marcarLeidos: (conversationId) =>
    solicitarApi(`/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
    }),
};
export { apiConversaciones };

const apiAdministracion = {
  estadisticas: () => solicitarApi('/admin/stats'),
  clientes: () => solicitarApi('/admin/customers'),
  eliminarCliente: (identificador) =>
    solicitarApi(`/admin/customers/${identificador}`, {
      method: 'DELETE',
    }),
  actualizarPedido: (identificador, cuerpo) =>
    solicitarApi(`/admin/orders/${identificador}`, {
      method: 'PUT',
      body: JSON.stringify(cuerpo),
    }),
  eliminarPedido: (identificador) =>
    solicitarApi(`/admin/orders/${identificador}`, {
      method: 'DELETE',
    }),
  subirImagenProducto: (cuerpo) =>
    solicitarApi('/admin/uploads/products', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  crearProducto: (cuerpo) =>
    solicitarApi('/admin/products', {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  actualizarProducto: (identificador, cuerpo) =>
    solicitarApi(`/admin/products/${identificador}`, {
      method: 'PUT',
      body: JSON.stringify(cuerpo),
    }),
  eliminarProducto: (identificador) =>
    solicitarApi(`/admin/products/${identificador}`, {
      method: 'DELETE',
    }),
};
export { apiAdministracion };
