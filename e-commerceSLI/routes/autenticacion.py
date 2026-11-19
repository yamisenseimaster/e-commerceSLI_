from contextlib import closing
from hashlib import sha256
from secrets import token_urlsafe
from time import time

import click
from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database.db import get_db_connection, init_db

autenticacion = Blueprint("autenticacion", __name__, url_prefix="/api")


@autenticacion.cli.command("crear-administrador")
def crear_administrador():
    """Crea la cuenta de prueba y muestra su contraseña una sola vez."""
    init_db()
    correo = "admin@mercadito.local"
    with closing(get_db_connection()) as conexion, conexion:
        if conexion.execute("SELECT 1 FROM personas WHERE email = ?", (correo,)).fetchone():
            raise click.ClickException("La cuenta ya existe.")
        clave = token_urlsafe(15)
        conexion.execute(
            """INSERT INTO personas (nombre, apellido, dni, email, rol, username, password_hash)
               VALUES ('Administrador', 'Local', 'LOCAL-ADMIN', ?, 'administrador', 'admin_local', ?)""",
            (correo, generate_password_hash(clave)),
        )
    click.echo(f"Correo: {correo}\nContraseña: {clave}")


def perfil(persona):
    # Estos campos mantienen el formato que consume el panel existente.
    return {"id": persona["id_persona"], "name": persona["nombre"],
            "email": persona["email"], "role": "admin"}


def huella(credencial):
    return sha256(credencial.encode()).hexdigest()


def huella_solicitada():
    esquema, _, credencial = request.headers.get("Authorization", "").partition(" ")
    return huella(credencial) if esquema.lower() == "bearer" and credencial else None


def consultar_administrador():
    with closing(get_db_connection()) as conexion:
        return conexion.execute(
            """SELECT personas.* FROM sesiones_panel JOIN personas USING (id_persona)
               WHERE huella = ? AND vence > ? AND rol = 'administrador'""",
            (huella_solicitada(), int(time())),
        ).fetchone()


@autenticacion.before_app_request
def proteger_administracion():
    if request.path.startswith("/api/admin/") and consultar_administrador() is None:
        return jsonify(error="Se requiere una sesión de administrador."), 401


@autenticacion.post("/auth/login")
def iniciar_sesion():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict) or not all(isinstance(datos.get(campo), str) for campo in ("email", "password")):
        return jsonify(error="Ingresá tu correo y contraseña."), 400
    with closing(get_db_connection()) as conexion, conexion:
        persona = conexion.execute(
            "SELECT * FROM personas WHERE email = ? COLLATE NOCASE AND rol = 'administrador'",
            (datos["email"].strip(),),
        ).fetchone()
        if not persona or not check_password_hash(persona["password_hash"], datos["password"]):
            return jsonify(error="Correo o contraseña incorrectos."), 401
        credencial = token_urlsafe(32)
        ahora = int(time())
        conexion.execute("DELETE FROM sesiones_panel WHERE vence <= ?", (ahora,))
        conexion.execute("INSERT INTO sesiones_panel VALUES (?, ?, ?)",
                         (huella(credencial), persona["id_persona"], ahora + 8 * 3600))
    return jsonify(data={"token": credencial, "user": perfil(persona)})


@autenticacion.get("/auth/me")
def consultar_perfil():
    persona = consultar_administrador()
    if persona is None:
        return jsonify(error="Iniciá sesión para continuar."), 401
    return jsonify(data=perfil(persona))


@autenticacion.post("/auth/logout")
def cerrar_sesion():
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("DELETE FROM sesiones_panel WHERE huella = ?", (huella_solicitada(),))
    return "", 204
