import { traducirCategoria } from './localizacion.js';

export function normalizarBusqueda(texto) {
  return String(texto)
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function puntuarProducto(producto, consulta) {
  const titulo = normalizarBusqueda(producto.title || '');
  if (titulo === consulta) return 5;
  if (titulo.startsWith(consulta)) return 4;
  if (titulo.split(/\s+/).some((palabra) => palabra.startsWith(consulta)))
    return 3;
  if (titulo.includes(consulta)) return 2;

  return [
    producto.type,
    traducirCategoria(producto.type),
    producto.slug,
    producto.brand,
    producto.marca,
    producto.description,
    ...(producto.tags || producto.tag || []),
  ].some((campo) => campo && normalizarBusqueda(campo).includes(consulta))
    ? 1
    : 0;
}

export function buscarProductos(productos, texto) {
  const consulta = normalizarBusqueda(texto.trim());
  if (!consulta) return productos;

  return productos
    .map((producto) => ({
      producto,
      puntos: puntuarProducto(producto, consulta),
    }))
    .filter(({ puntos }) => puntos > 0)
    .sort((primero, segundo) => segundo.puntos - primero.puntos)
    .map(({ producto }) => producto);
}
