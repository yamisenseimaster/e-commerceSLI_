from contextlib import closing
from hashlib import sha256
from secrets import token_urlsafe
from time import time
import re

import click
from flask import Blueprint, g, jsonify, request
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
            "email": persona["email"], "role": "admin" if persona["rol"] == "administrador" else "customer",
            "phone": persona["telefono"], "avatar": persona["img"]}


def huella(credencial):
    return sha256(credencial.encode()).hexdigest()


def huella_solicitada():
    esquema, _, credencial = request.headers.get("Authorization", "").partition(" ")
    return huella(credencial) if esquema.lower() == "bearer" and credencial else None


def consultar_usuario():
    with closing(get_db_connection()) as conexion:
        return conexion.execute(
            """SELECT personas.* FROM sesiones_panel JOIN personas USING (id_persona)
               WHERE huella = ? AND vence > ? AND rol IN ('administrador','cliente')""",
            (huella_solicitada(), int(time())),
        ).fetchone()


@autenticacion.before_app_request
def proteger_administracion():
    ruta_admin = request.path.startswith("/api/admin/")
    if ruta_admin or request.path == "/api/orders":
        g.usuario = consultar_usuario()
        if g.usuario is None:
            return jsonify(error="Iniciá sesión para continuar."), 401
        if ruta_admin and g.usuario["rol"] != "administrador":
            return jsonify(error="Se requiere una cuenta de administrador."), 403


def crear_sesion(conexion, persona):
    credencial = token_urlsafe(32)
    ahora = int(time())
    conexion.execute("DELETE FROM sesiones_panel WHERE vence <= ?", (ahora,))
    conexion.execute("INSERT INTO sesiones_panel VALUES (?, ?, ?)",
                     (huella(credencial), persona["id_persona"], ahora + 8 * 3600))
    return jsonify(data={"token": credencial, "user": perfil(persona)})


@autenticacion.post("/auth/register")
def registrar_cliente():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict) or not all(isinstance(datos.get(campo), str)
            for campo in ("name", "email", "password", "confirmPassword")):
        return jsonify(error="Completá el formulario de registro."), 400
    nombre, correo, clave = datos["name"].strip(), datos["email"].strip().lower(), datos["password"]
    if not 2 <= len(nombre) <= 150 or len(correo) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", correo):
        return jsonify(error="Revisá tu nombre y tu correo."), 400
    if not 8 <= len(clave) <= 128 or not re.search(r"[A-Za-zÀ-ÿ]", clave) or not re.search(r"[0-9]", clave):
        return jsonify(error="Usá de 8 a 128 caracteres, con letras y números."), 400
    if datos["confirmPassword"] != clave or datos.get("acceptTerms") is not True:
        return jsonify(error="Confirmá la contraseña y aceptá los términos."), 400
    resumen = generate_password_hash(clave)
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("BEGIN IMMEDIATE")
        if conexion.execute("SELECT 1 FROM personas WHERE email=? COLLATE NOCASE", (correo,)).fetchone():
            return jsonify(error="Ese correo ya tiene una cuenta."), 409
        # El formulario no pide DNI. Reservamos una referencia interna única en ese campo obligatorio.
        referencia = "SIN-DNI-" + token_urlsafe(16)
        identificador = conexion.execute(
            """INSERT INTO personas(nombre, apellido, dni, email, rol, username, password_hash)
               VALUES (?, '', ?, ?, 'cliente', ?, ?)""", (nombre, referencia, correo, referencia, resumen)
        ).lastrowid
        persona = conexion.execute("SELECT * FROM personas WHERE id_persona=?", (identificador,)).fetchone()
        return crear_sesion(conexion, persona), 201


@autenticacion.post("/auth/login")
def iniciar_sesion():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict) or not all(isinstance(datos.get(campo), str) for campo in ("email", "password")):
        return jsonify(error="Ingresá tu correo y contraseña."), 400
    with closing(get_db_connection()) as conexion, conexion:
        persona = conexion.execute(
            "SELECT * FROM personas WHERE email = ? COLLATE NOCASE AND rol IN ('administrador','cliente')",
            (datos["email"].strip(),),
        ).fetchone()
        if not persona or not check_password_hash(persona["password_hash"], datos["password"]):
            return jsonify(error="Correo o contraseña incorrectos."), 401
        return crear_sesion(conexion, persona)


@autenticacion.get("/auth/me")
def consultar_perfil():
    persona = consultar_usuario()
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
    persona = consultar_usuario()
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
            return crear_sesion(conexion, persona)
        if request.path.endswith("/avatar"):
            url = guardar_imagen(5)
            conexion.execute("UPDATE personas SET img=? WHERE id_persona=?", (url, identificador))
        else:
            nombre, telefono = datos.get("name"), datos.get("phone", "")
            if not isinstance(nombre, str) or not 1 <= len(nombre.strip()) <= 150 or not isinstance(telefono, str) or len(telefono) > 50:
                return jsonify(error="Revisá el nombre y el teléfono."), 400
            conexion.execute("UPDATE personas SET nombre=?, telefono=? WHERE id_persona=?", (nombre.strip(), telefono.strip(), identificador))
        return jsonify(data=perfil(conexion.execute("SELECT * FROM personas WHERE id_persona=?", (identificador,)).fetchone()))
