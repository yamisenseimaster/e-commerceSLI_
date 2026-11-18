class DetalleVenta:

    def __init__(self, producto, cantidad, precio_unitario, id=None):
        self.id = id
        self.producto = producto  # Instancia de Product
        self.cantidad = cantidad
        self.precio_unitario = precio_unitario

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def to_dict(self):
        return {
            "id": self.id,
            "producto": (
                self.producto.to_dict()
                if hasattr(self.producto, "to_dict")
                else self.producto
            ),
            "cantidad": self.cantidad,
            "precio_unitario": self.precio_unitario,
            "subtotal": self.subtotal,
        }