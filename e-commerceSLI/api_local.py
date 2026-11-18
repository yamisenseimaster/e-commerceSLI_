"""API de prueba local. Conserva el esquema original en tablas independientes."""
import base64
import binascii
import json
import math
import os
import secrets
import sqlite3
import time
from contextlib import closing as cerrar
from datetime import datetime as FechaHora, timezone as ZonaHoraria

from flask import Blueprint as GrupoRutas, jsonify as convertir_json, request as solicitud
from werkzeug.security import check_password_hash as comprobar_clave, generate_password_hash as resumir_clave

from database.db import DB_PATH as RUTA_BASE


def registrar_api(aplicacion, ruta_base=None):
    ruta_base = ruta_base or RUTA_BASE
    servicio = GrupoRutas("api_local", __name__, url_prefix="/api")
    administrador = {"id": 1, "nombre": "Administrador local", "rol": "administrador",
               "correo": os.environ.get("CORREO_ADMINISTRADOR_LOCAL", "admin@local.test")}
    resumen_clave = resumir_clave(os.environ.get("CLAVE_ADMINISTRADOR_LOCAL", "Admin12345"))
    sesiones = {}
    aplicacion.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024

    def conectar():
        conexion = sqlite3.connect(ruta_base)
        conexion.row_factory = sqlite3.Row
        return conexion

    with cerrar(conectar()) as conexion, conexion:
        conexion.execute("""CREATE TABLE IF NOT EXISTS productos_prueba (
            id INTEGER PRIMARY KEY AUTOINCREMENT, datos TEXT NOT NULL)""")

    def respuesta(datos, estado=200):
        return convertir_json(datos=datos), estado

    def error(mensaje, estado=400):
        return convertir_json(error=mensaje), estado

    def cuerpo():
        datos = solicitud.get_json(silent=True)
        if not isinstance(datos, dict):
            raise ValueError("Envía un objeto JSON válido.")
        return datos

    @servicio.errorhandler(ValueError)
    def datos_invalidos(excepcion):
        return error(str(excepcion))

    @aplicacion.after_request
    def permitir_interfaz(respuesta_http):
        if solicitud.headers.get("Origin") in {"http://localhost:3000", "http://127.0.0.1:3000"}:
            respuesta_http.headers["Access-Control-Allow-Origin"] = solicitud.headers["Origin"]
            respuesta_http.headers.add("Vary", "Origin")
            respuesta_http.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            respuesta_http.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return respuesta_http

    @servicio.before_request
    def comprobar_acceso():
        if solicitud.method == "OPTIONS":
            return "", 204
        if solicitud.endpoint in {"api_local.ingresar", "api_local.metodos"}:
            return None
        if solicitud.path == "/api/productos" and solicitud.method == "GET":
            return None
        credencial = solicitud.headers.get("Authorization", "").removeprefix("Bearer ")
        if sesiones.get(credencial, 0) <= time.time():
            sesiones.pop(credencial, None)
            return error("Sesión vencida. Inicia sesión nuevamente.", 401)

    @servicio.get("/autenticacion/metodos")
    def metodos():
        return respuesta({"codigoPorCorreo": False, "identificadorGoogle": "", "identificadorFacebook": ""})

    @servicio.post("/autenticacion/ingresar")
    def ingresar():
        datos = cuerpo()
        correo, clave = datos.get("correo"), datos.get("contrasena")
        if not isinstance(correo, str) or not isinstance(clave, str):
            return error("Correo y contraseña requeridos.")
        if correo.strip().lower() != administrador["correo"].lower() or not comprobar_clave(resumen_clave, clave):
            return error("Correo o contraseña incorrectos.", 401)
        ahora = time.time()
        for credencial in list(sesiones):
            if sesiones[credencial] <= ahora:
                sesiones.pop(credencial)
        credencial = secrets.token_urlsafe(32)
        sesiones[credencial] = ahora + 8 * 3600
        return respuesta({"credencial": credencial, "usuario": administrador})

    @servicio.get("/autenticacion/perfil")
    def perfil():
        return respuesta(administrador)

    @servicio.post("/autenticacion/salir")
    def salir():
        sesiones.pop(solicitud.headers.get("Authorization", "").removeprefix("Bearer "), None)
        return "", 204

    def producto_fila(fila):
        return {**json.loads(fila["datos"]), "id": str(fila["id"])}

    @servicio.get("/productos")
    def productos():
        with cerrar(conectar()) as conexion:
            filas = conexion.execute("SELECT * FROM productos_prueba ORDER BY id DESC").fetchall()
        return respuesta([producto_fila(fila) for fila in filas])

    def validar_producto(datos):
        producto = {}
        for campo, defecto in {"titulo": "", "identificador": "", "descripcion": "", "categoria": "Almuerzo",
                               "imagen": "/images/products/11.png"}.items():
            valor = datos.get(campo, defecto)
            if not isinstance(valor, str):
                raise ValueError(f"{campo} debe ser texto.")
            producto[campo] = valor.strip()
        if not producto["titulo"] or len(producto["titulo"]) > 160:
            raise ValueError("El título debe tener entre 1 y 160 caracteres.")
        producto["identificador"] = producto["identificador"] or "-".join(producto["titulo"].lower().split())
        for campo in ("precio", "precioOferta", "descuento", "cantidad"):
            valor = datos.get(campo, datos.get("precio", 0) if campo == "precioOferta" else 0)
            if isinstance(valor, bool) or not isinstance(valor, (int, float)) or not math.isfinite(valor) or valor < 0:
                raise ValueError(f"{campo} debe ser un número no negativo.")
            producto[campo] = valor
        if producto["descuento"] > 100 or producto["cantidad"] != int(producto["cantidad"]):
            raise ValueError("Descuento entre 0 y 100 y stock entero requeridos.")
        if producto["precioOferta"] > producto["precio"]:
            raise ValueError("El precio de oferta no puede superar el precio normal.")
        etiquetas = datos.get("etiquetas", [])
        if not isinstance(etiquetas, list) or not all(isinstance(etiqueta, str) for etiqueta in etiquetas):
            raise ValueError("Las etiquetas deben ser una lista de textos.")
        producto.update(etiquetas=etiquetas, ofertaDestacada=bool(datos.get("ofertaDestacada", False)))
        return producto

    @servicio.post("/administracion/productos")
    @servicio.put("/administracion/productos/<int:identificador_producto>")
    def guardar_producto(identificador_producto=None):
        producto = validar_producto(cuerpo())
        with cerrar(conectar()) as conexion, conexion:
            if identificador_producto is not None:
                fila = conexion.execute("SELECT * FROM productos_prueba WHERE id = ?", (identificador_producto,)).fetchone()
                if fila is None:
                    return error("Producto no encontrado.", 404)
                producto["fechaCreacion"] = json.loads(fila["datos"])["fechaCreacion"]
                conexion.execute("UPDATE productos_prueba SET datos = ? WHERE id = ?",
                                 (json.dumps(producto), identificador_producto))
            else:
                producto["fechaCreacion"] = FechaHora.now(ZonaHoraria.utc).isoformat()
                identificador_producto = conexion.execute("INSERT INTO productos_prueba (datos) VALUES (?)",
                                               (json.dumps(producto),)).lastrowid
        return respuesta({**producto, "id": str(identificador_producto)}, 201 if solicitud.method == "POST" else 200)

    @servicio.delete("/administracion/productos/<int:identificador_producto>")
    def eliminar_producto(identificador_producto):
        with cerrar(conectar()) as conexion, conexion:
            borrado = conexion.execute("DELETE FROM productos_prueba WHERE id = ?", (identificador_producto,))
            if not borrado.rowcount:
                return error("Producto no encontrado.", 404)
        return "", 204

    @servicio.post("/administracion/imagenes/productos")
    def imagen_producto():
        datos = cuerpo()
        direccion = datos.get("imagenCodificada", "")
        if not isinstance(direccion, str) or ";base64," not in direccion:
            return error("Imagen inválida.")
        prefijo, contenido = direccion.split(";base64,", 1)
        firmas = {"data:image/png": b"\x89PNG\r\n\x1a\n", "data:image/jpeg": b"\xff\xd8\xff",
                  "data:image/gif": b"GIF", "data:image/webp": b"RIFF"}
        try:
            imagen = base64.b64decode(contenido, validate=True)
        except (ValueError, binascii.Error):
            return error("Imagen inválida.")
        if prefijo not in firmas or not imagen.startswith(firmas[prefijo]) or len(imagen) > 2 * 1024 * 1024:
            return error("Usa PNG, JPG, GIF o WEBP de hasta 2 MB.")
        return respuesta({"direccion": direccion})

    @servicio.get("/administracion/estadisticas")
    def estadisticas():
        with cerrar(conectar()) as conexion:
            total = conexion.execute("SELECT COUNT(*) FROM productos_prueba").fetchone()[0]
        return respuesta({"totalProductos": total, "totalClientes": 0, "totalPedidos": 0,
                          "pedidosPendientes": 0, "pedidosCompletos": 0, "pedidosCancelados": 0,
                          "ingresos": 0, "gastos": 0, "ganancia": 0})

    @servicio.get("/pedidos")
    @servicio.get("/administracion/clientes")
    def pendientes_vacios():
        # Compatibilidad con las consultas del dashboard; estos módulos aún no se implementan.
        return respuesta([])

    @servicio.route("/<path:ruta>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    def pendiente(ruta):
        return error("Esta función está pendiente en la versión local de prueba.", 501)

    aplicacion.register_blueprint(servicio)
