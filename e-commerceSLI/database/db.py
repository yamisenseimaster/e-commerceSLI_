import os
import sqlite3
import json
from pathlib import Path

from werkzeug.security import generate_password_hash

# Ruta absoluta al archivo de la base de datos dentro de la carpeta 'database'
DB_PATH = os.path.join(os.path.dirname(__file__), "mercadito.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    # Permite acceder a las columnas por nombre (ej: fila['nombre'])
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Crea las tablas ejecutando el schema.sql si no existen."""
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            script = f.read()
        conn = get_db_connection()
        conn.executescript(script)
        try:
            with conn:
                conn.execute("BEGIN IMMEDIATE")
                columnas = {fila["name"] for fila in conn.execute("PRAGMA table_info(personas)")}
                if "telefono" not in columnas:
                    conn.execute("ALTER TABLE personas ADD COLUMN telefono TEXT DEFAULT ''")
                if not conn.execute("SELECT 1 FROM configuracion_catalogo").fetchone():
                    preparar_catalogo(conn)
                preparar_administrador_demo(conn)
        finally:
            conn.close()


def preparar_administrador_demo(conexion):
    correo = "admin@mercadito.local"
    clave = "mercadito21"
    cuenta = conexion.execute(
        "SELECT 1 FROM personas WHERE email = ? COLLATE NOCASE",
        (correo,),
    ).fetchone()
    if cuenta is None:
        conexion.execute(
            """INSERT INTO personas (nombre, apellido, dni, email, rol, username, password_hash)
               VALUES ('Administrador', 'Local', 'LOCAL-ADMIN', ?, 'administrador', 'admin_local', ?)""",
            (correo, generate_password_hash(clave)),
        )


def preparar_catalogo(conexion):
    sucursal = conexion.execute("INSERT INTO sucursales(nombre, direccion) VALUES ('Mercadito local', '')").lastrowid
    conexion.execute("INSERT INTO configuracion_catalogo VALUES (1, ?)", (sucursal,))
    if conexion.execute("SELECT 1 FROM productos LIMIT 1").fetchone():
        return
    archivo = Path(__file__).resolve().parents[2] / "Frontend/src/datos/catalogoInicial.json"
    for producto in json.loads(archivo.read_text(encoding="utf-8")):
        identificador = conexion.execute(
            "INSERT INTO productos(nombre_prod, marca, precio, descripcion, tiene_descuento) VALUES (?, '', ?, ?, ?)",
            (producto["title"], producto["price"], producto.get("description", ""), bool(producto.get("discount"))),
        ).lastrowid
        conexion.execute("INSERT INTO stock_por_sucursal VALUES (?, ?, ?)", (identificador, sucursal, producto["quantity"]))
        extras = {campo: producto[campo] for campo in ("image", "slug", "type", "tag", "discount", "salePrice", "flashSale")}
        conexion.execute("INSERT INTO fichas_catalogo(id_producto, clave, datos) VALUES (?, ?, ?)",
                         (identificador, producto["_id"], json.dumps(extras)))
