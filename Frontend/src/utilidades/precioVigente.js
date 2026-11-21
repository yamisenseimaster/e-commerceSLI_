export function precioVigente(producto) {
  const habitual = producto?.price ?? 0;
  return Number(producto?.flashSale ? (producto.salePrice ?? habitual) : habitual);
}
