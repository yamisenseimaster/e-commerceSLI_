from contextlib import closing
from hashlib import sha256
from secrets import token_urlsafe
from time import time

import click
from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database.db import get_db_connection, init_db
from routes.productos import guardar_imagen

autenticacion = Blueprint("autenticacion", __name__, url_prefix="/api")


@autenticacion.cli.command("crear-administrador")
def crear_administrador():
    """Prepara la cuenta de administrador local."""
    init_db()
    click.echo("Administrador de la exposición preparado.")


def perfil(persona):
    # Estos campos mantienen el formato que consume el panel existente.
    return {"id": persona["id_persona"], "name": persona["nombre"],
            "email": persona["email"], "role": "admin", "phone": persona["telefono"], "avatar": persona["img"]}


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
    if (request.path.startswith("/api/admin/") or request.path == "/api/orders") and consultar_administrador() is None:
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


@autenticacion.patch("/auth/me")
@autenticacion.post("/auth/me/avatar")
@autenticacion.patch("/auth/me/password")
def editar_cuenta():
    persona = consultar_administrador()
    if persona is None:
        return jsonify(error="Iniciá sesión para continuar."), 401
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return jsonify(error="Solicitud inválida."), 400
    identificador = persona["id_persona"]
    with closing(get_db_connection()) as conexion, conexion:
        if request.path.endswith("/password"):
            nueva = datos.get("newPassword")
            actual = datos.get("currentPassword")
            if not isinstance(nueva, str) or not 8 <= len(nueva) <= 256:
                return jsonify(error="Usá entre 8 y 256 caracteres."), 400
            if not isinstance(actual, str) or not check_password_hash(persona["password_hash"], actual):
                return jsonify(error="La contraseña actual es incorrecta."), 400
            cambio = conexion.execute("UPDATE personas SET password_hash=? WHERE id_persona=? AND password_hash=?",
                                      (generate_password_hash(nueva), identificador, persona["password_hash"]))
            if not cambio.rowcount:
                return jsonify(error="La contraseña ya cambió. Iniciá sesión nuevamente."), 409
            conexion.execute("DELETE FROM sesiones_panel WHERE id_persona=?", (identificador,))
            credencial = token_urlsafe(32)
            conexion.execute("INSERT INTO sesiones_panel VALUES (?,?,?)", (huella(credencial), identificador, int(time()) + 28800))
            return jsonify(data={"token": credencial, "user": perfil(persona)})
        if request.path.endswith("/avatar"):
            url = guardar_imagen(5)
            conexion.execute("UPDATE personas SET img=? WHERE id_persona=?", (url, identificador))
        else:
            nombre, telefono = datos.get("name"), datos.get("phone", "")
            if not isinstance(nombre, str) or not 1 <= len(nombre.strip()) <= 150 or not isinstance(telefono, str) or len(telefono) > 50:
                return jsonify(error="Revisá el nombre y el teléfono."), 400
            conexion.execute("UPDATE personas SET nombre=?, telefono=? WHERE id_persona=?", (nombre.strip(), telefono.strip(), identificador))
        return jsonify(data=perfil(conexion.execute("SELECT * FROM personas WHERE id_persona=?", (identificador,)).fetchone()))
