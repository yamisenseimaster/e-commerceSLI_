import axios from 'axios';
import { prepararSolicitudLocal, adaptarRespuestaLocal } from './compatibilidadLocal';
const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cliente = axios.create({
  baseURL: URL_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});
cliente.interceptors.request.use(configuracion => {
  const token = localStorage.getItem('authToken');
  if (token && !configuracion.headers.Authorization) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }
  return configuracion;
});
class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.status = estado;
  }
}
export { ErrorApi };
async function solicitarApi(ruta, opciones = {}) {
  try {
    const solicitud = prepararSolicitudLocal(ruta, opciones.body ? JSON.parse(opciones.body) : opciones.data);
    const respuesta = await cliente.request({
      url: solicitud.ruta,
      method: opciones.method || 'GET',
      data: solicitud.datos,
      headers: opciones.headers
    });
    return respuesta.status === 204 ? null : adaptarRespuestaLocal(respuesta.data?.datos);
  } catch (error) {
    const estado = error.response?.status || 500;
    if (estado === 401 && !ruta.startsWith('/auth/login') && !ruta.startsWith('/auth/register')) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    const mensaje = error.response?.data?.error || error.response?.data?.detail || 'La solicitud fallo';
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
    const suffix = busqueda.toString() ? `?${busqueda}` : '';
    return solicitarApi(`/products${suffix}`);
  }
};
export { apiProductos };
const apiAutenticacion = {
  methods: () => solicitarApi('/auth/methods'),
  solicitarCodigo: body => solicitarApi('/auth/code/request', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  verificarCodigo: body => solicitarApi('/auth/code/verify', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  google: body => solicitarApi('/auth/social/google', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  facebook: body => solicitarApi('/auth/social/facebook', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  cerrarSesion: token => solicitarApi('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  iniciarSesion: body => solicitarApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  registrar: body => solicitarApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  me: () => solicitarApi('/auth/me'),
  actualizarPerfil: body => solicitarApi('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body)
  }),
  subirAvatar: urlDatos => solicitarApi('/auth/me/avatar', {
    method: 'POST',
    body: JSON.stringify({
      dataUrl: urlDatos
    })
  }),
  cambiarContrasena: body => solicitarApi('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
};
export { apiAutenticacion };
const apiCarrito = {
  get: () => solicitarApi('/cart'),
  add: body => solicitarApi('/cart/items', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  update: (productoId, cantidad) => solicitarApi(`/cart/items/${productoId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      quantity: cantidad
    })
  }),
  remove: productoId => solicitarApi(`/cart/items/${productoId}`, {
    method: 'DELETE'
  })
};
export { apiCarrito };
const apiPedidos = {
  listar: () => solicitarApi('/orders'),
  create: (body, clave) => solicitarApi('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Idempotency-Key': clave
    }
  })
};
export { apiPedidos };
const apiPagos = {
  config: () => solicitarApi('/payments/config'),
  verify: idSesion => solicitarApi('/payments/verify', {
    method: 'POST',
    data: {
      sessionId: idSesion
    }
  }),
  crearIntento: body => solicitarApi('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(body)
  })
};
export { apiPagos };
const apiConversaciones = {
  status: () => solicitarApi('/chat/status'),
  conversations: (busqueda = '') => {
    const consulta = busqueda ? `?search=${encodeURIComponent(busqueda)}` : '';
    return solicitarApi(`/chat/conversations${consulta}`);
  },
  crearConversacion: body => solicitarApi('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  eliminarConversacion: conversacionId => solicitarApi(`/chat/conversations/${conversacionId}`, {
    method: 'DELETE'
  }),
  messages: conversacionId => solicitarApi(`/chat/conversations/${conversacionId}/messages`),
  enviarMensaje: (conversacionId, body) => solicitarApi(`/chat/conversations/${conversacionId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  enviarArchivo: (conversacionId, body) => solicitarApi(`/chat/conversations/${conversacionId}/media`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  simulateIncoming: (conversacionId, body) => solicitarApi(`/chat/conversations/${conversacionId}/incoming`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  marcarLeidos: conversacionId => solicitarApi(`/chat/conversations/${conversacionId}/read`, {
    method: 'PATCH'
  })
};
export { apiConversaciones };
const apiAdministracion = {
  stats: () => solicitarApi('/admin/stats'),
  customers: () => solicitarApi('/admin/customers'),
  eliminarCliente: id => solicitarApi(`/admin/customers/${id}`, {
    method: 'DELETE'
  }),
  actualizarPedido: (id, body) => solicitarApi(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  subirImagenProducto: body => solicitarApi('/admin/uploads/products', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  crearProducto: body => solicitarApi('/admin/products', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  actualizarProducto: (id, body) => solicitarApi(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  eliminarProducto: id => solicitarApi(`/admin/products/${id}`, {
    method: 'DELETE'
  })
};
export { apiAdministracion };
