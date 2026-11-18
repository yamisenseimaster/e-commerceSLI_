import os
import sqlite3

# Ruta absoluta al archivo de la base de datos dentro de la carpeta 'database'
DB_PATH = os.path.join(os.path.dirname(__file__), "mercadito.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    # Permite acceder a las columnas por nombre (ej: fila['nombre'])
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Crea las tablas ejecutando el schema.sql si no existen."""
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            script = f.read()
        conn = get_db_connection()
        conn.executescript(script)
        conn.commit()
        conn.close()