class Sucursal:
    def __init__(self, nombre, direccion, codigo_postal, id=None):
        self.id = id
        self.nombre = nombre
        self.direccion = direccion
        self.codigo_postal = codigo_postal

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "codigo_postal": self.codigo_postal,
        }
        