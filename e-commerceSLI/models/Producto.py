class Producto:
    def __init__(
        self, nombre, marca, precio, descripcion, tiene_descuento=False, id=None
    ):
        self.id = id
        self.nombre = nombre
        self.marca = marca
        self._precio = precio
        self.descripcion = descripcion
        self.tiene_descuento = tiene_descuento
        self._stock_por_sucursal = {}  # {id_sucursal, cantidad}

    def agregar_stock_por_sucursal(self, id_sucursal, cantidad):
        if cantidad < 0:
            raise ValueError("Número ingresado menor a uno.")

        stock_actual = self._stock_por_sucursal.get(id_sucursal, 0)
        self._stock_por_sucursal[id_sucursal] = stock_actual + cantidad

    def descontar_stock_por_sucursal(self, id_sucursal, cantidad):
        stock_actual = self._stock_por_sucursal.get(id_sucursal, 0)
        if stock_actual < cantidad:
            raise ValueError("No puede retirar más productos que el stock disponible.")

        self._stock_por_sucursal[id_sucursal] = stock_actual - cantidad

    def obtener_stock_por_sucursal(self, id_sucursal):
        return self._stock_por_sucursal.get(id_sucursal, 0)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "marca": self.marca,
            "precio": self.precio,
            "stock": self._stock_por_sucursal.copy(),
            "descripcion": self.descripcion,
            "tiene_descuento": self.tiene_descuento,
        }

    @property
    def precio(self):
        return self._precio

    @precio.setter
    def precio(self, nuevo_precio):
        if nuevo_precio > 0:
            self._precio = nuevo_precio

    @property
    def stock_total(self):
        return sum(self._stock_por_sucursal.values())
