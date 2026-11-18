from werkzeug.security import check_password_hash, generate_password_hash


class Persona:

    def __init__(
        self,
        nombre,
        apellido,
        dni,
        email,
        username,
        password=None,
        password_hash=None,
        rol="cliente",
        fecha_nacimiento=None,
        genero=None,
        img=None,
        id=None,
    ):
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.dni = dni
        self.fecha_nacimiento = fecha_nacimiento
        self.email = email
        self.genero = genero
        self.rol = rol
        self.username = username
        self.img = img

        if password_hash is not None:
            self._password_hash = password_hash
        elif password is not None:
            self.set_password(password)
        else:
            self._password_hash = None

    def set_password(self, password):
        self._password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self._password_hash:
            return False
        return check_password_hash(self._password_hash, password)

    @property
    def password_hash(self):
        return self._password_hash

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni": self.dni,
            "fecha_nacimiento": self.fecha_nacimiento,
            "email": self.email,
            "genero": self.genero,
            "rol": self.rol,
            "img": self.img,
        }