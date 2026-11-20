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

CREATE TABLE IF NOT EXISTS sesiones_panel (
    huella TEXT PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES personas(id_persona),
    vence INTEGER NOT NULL
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

CREATE TABLE IF NOT EXISTS fichas_catalogo (
    id_producto INTEGER PRIMARY KEY REFERENCES productos(id_producto) ON DELETE CASCADE,
    clave TEXT NOT NULL UNIQUE,
    datos TEXT NOT NULL,
    creado TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS configuracion_catalogo (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    sucursal INTEGER NOT NULL REFERENCES sucursales(id_sucursal)
);
CREATE TABLE IF NOT EXISTS imagenes_catalogo (
    clave TEXT PRIMARY KEY, tipo TEXT NOT NULL, contenido BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY NOT NULL,
    cliente INTEGER REFERENCES personas(id_persona) ON DELETE SET NULL,
    creado TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    estado TEXT NOT NULL DEFAULT 'Pending',
    estado_pago TEXT NOT NULL DEFAULT 'Pending',
    metodo TEXT NOT NULL DEFAULT 'Cash',
    total REAL NOT NULL CHECK(total >= 0),
    direccion TEXT NOT NULL DEFAULT '{}',
    articulos TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS eventos_calendario (
    id TEXT PRIMARY KEY NOT NULL,
    datos TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carrito (
    persona INTEGER NOT NULL REFERENCES personas(id_persona) ON DELETE CASCADE,
    producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK(cantidad > 0),
    PRIMARY KEY (persona, producto)
);
