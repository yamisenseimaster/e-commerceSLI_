class Venta:
    def __init__(
        self, persona_cliente, sucursal, medio_pago, detalles=None, fecha=None, id=None
    ):
        self.id = id
        self.persona_cliente = persona_cliente
        self.sucursal = sucursal
        self.medio_pago = medio_pago
        self.fecha = fecha
        self.detalles = detalles if detalles is not None else []

    def agregar_detalle(self, detalle):
        self.detalles.append(detalle)

    @property
    def total(self):
        return sum(d.subtotal for d in self.detalles)
    
    

    def to_dict(self):
        return {
            "id": self.id,
            "cliente": self.persona_cliente.to_dict(),  # Convertimos la Persona a dict
            "sucursal": self.sucursal.to_dict(),        # Convertimos la Sucursal a dict
            "medio_pago": self.medio_pago,
            "fecha": self.fecha,
            "total": self.total,
            "detalles": [d.to_dict() for d in self.detalles]  # Convertimos cada DetalleVenta
        }
