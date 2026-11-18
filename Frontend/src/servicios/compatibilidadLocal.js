// Adapta los componentes anteriores al contrato en español de la API local.
const rutasLocales = {
  '/auth/login': '/autenticacion/ingresar',
  '/auth/me': '/autenticacion/perfil',
  '/auth/logout': '/autenticacion/salir',
  '/auth/methods': '/autenticacion/metodos',
  '/products': '/productos',
  '/admin/products': '/administracion/productos',
  '/admin/uploads/products': '/administracion/imagenes/productos',
  '/admin/stats': '/administracion/estadisticas',
  '/orders': '/pedidos',
  '/admin/customers': '/administracion/clientes'
};
const camposLocales = {
  name: 'nombre', email: 'correo', password: 'contrasena', role: 'rol',
  token: 'credencial', user: 'usuario', title: 'titulo', slug: 'identificador',
  description: 'descripcion', type: 'categoria', image: 'imagen',
  price: 'precio', salePrice: 'precioOferta', discount: 'descuento',
  quantity: 'cantidad', tags: 'etiquetas', flashSale: 'ofertaDestacada',
  createdAt: 'fechaCreacion', dataUrl: 'imagenCodificada', url: 'direccion',
  totalProducts: 'totalProductos', totalCustomers: 'totalClientes',
  totalOrders: 'totalPedidos', pendingOrders: 'pedidosPendientes',
  completeOrders: 'pedidosCompletos', canceledOrders: 'pedidosCancelados',
  revenue: 'ingresos', expenses: 'gastos', profit: 'ganancia',
  emailCode: 'codigoPorCorreo', googleClientId: 'identificadorGoogle',
  facebookAppId: 'identificadorFacebook'
};
const camposAnteriores = Object.fromEntries(
  Object.entries(camposLocales).map(([anterior, local]) => [local, anterior])
);
function convertirCampos(valor, equivalencias) {
  if (Array.isArray(valor)) return valor.map(elemento => convertirCampos(elemento, equivalencias));
  if (!valor || typeof valor !== 'object') return valor;
  return Object.fromEntries(Object.entries(valor).map(([clave, contenido]) => [
    equivalencias[clave] || clave, convertirCampos(contenido, equivalencias)
  ]));
}
export function prepararSolicitudLocal(ruta, datos) {
  const coincidencia = Object.keys(rutasLocales).find(anterior =>
    ruta === anterior || ruta.startsWith(`${anterior}/`) || ruta.startsWith(`${anterior}?`)
  );
  return {
    ruta: coincidencia ? rutasLocales[coincidencia] + ruta.slice(coincidencia.length) : ruta,
    datos: convertirCampos(datos, camposLocales)
  };
}
export function adaptarRespuestaLocal(datos) {
  const resultado = convertirCampos(datos, camposAnteriores);
  if (resultado?.role === 'administrador') resultado.role = 'admin';
  if (resultado?.user?.role === 'administrador') resultado.user.role = 'admin';
  return resultado;
}
