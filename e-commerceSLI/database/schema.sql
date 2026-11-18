CREATE TABLE IF NOT EXISTS personas (
    id_persona INTEGER PRIMARY KEY AUTOINCREMENT, 
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    fecha_nacimiento TEXT,
    email TEXT UNIQUE NOT NULL,
    genero TEXT,
    rol TEXT NOT NULL CHECK (rol IN("administrador", "vendedor", "cliente")),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    img TEXT
);

CREATE TABLE IF NOT EXISTS sucursales(
    id_sucursal INTEGER PRIMARY KEY AUTOINCREMENT, 
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos(
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT, 
    nombre_prod TEXT NOT NULL,
    marca TEXT NOT NULL,
    precio REAL NOT NULL,
    descripcion TEXT,
    tiene_descuento BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_por_sucursal(
    id_producto INTEGER NOT NULL,
    id_sucursal INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0 CHECK(cantidad >=0),
    PRIMARY KEY(id_producto, id_sucursal),
    FOREIGN KEY(id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY(id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE CASCADE
);