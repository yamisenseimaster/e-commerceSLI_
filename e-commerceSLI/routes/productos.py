import base64
import hashlib
import json
from contextlib import closing
from uuid import uuid4

from flask import Blueprint, Response, jsonify, request

from database.db import get_db_connection

catalogo = Blueprint("catalogo", __name__, url_prefix="/api")
consulta = """
    SELECT p.*, COALESCE(f.clave, CAST(p.id_producto AS TEXT)) AS clave, f.datos, f.creado,
           COALESCE((SELECT SUM(cantidad) FROM stock_por_sucursal s WHERE s.id_producto=p.id_producto), 0) AS cantidad
    FROM productos p LEFT JOIN fichas_catalogo f USING (id_producto)
"""


def ficha(fila):
    datos = json.loads(fila["datos"] or "{}")
    return {**datos, "id": fila["clave"], "_id": fila["clave"], "title": fila["nombre_prod"],
            "price": fila["precio"], "description": fila["descripcion"] or "", "quantity": fila["cantidad"],
            "image": datos.get("image", "/products/11.png"), "type": datos.get("type", "General"),
            "createdAt": fila["creado"]}


@catalogo.get("/products")
def listar():
    with closing(get_db_connection()) as conexion:
        return jsonify(data=[ficha(fila) for fila in conexion.execute(consulta + " ORDER BY p.id_producto")])


@catalogo.post("/admin/products")
@catalogo.put("/admin/products/<clave>")
@catalogo.delete("/admin/products/<clave>")
def administrar(clave=None):
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("BEGIN IMMEDIATE")
        if clave is not None:
            fila = conexion.execute(consulta + " WHERE COALESCE(f.clave, CAST(p.id_producto AS TEXT)) = ?", (clave,)).fetchone()
            if fila is None:
                return jsonify(error="Producto inexistente."), 404
            identificador = fila["id_producto"]
            if request.method == "DELETE":
                conexion.execute("DELETE FROM productos WHERE id_producto=?", (identificador,))
                return "", 204
        datos = request.get_json(silent=True)
        if not isinstance(datos, dict) or any(not isinstance(datos.get(campo), str) for campo in
                                              ("title", "slug", "type", "description", "image")):
            return jsonify(error="Revisá los campos del producto."), 400
        nombre = datos["title"].strip()
        cantidad = datos.get("quantity")
        numeros = [datos.get(campo) for campo in ("price", "salePrice", "discount")]
        if (not nombre or type(cantidad) is not int or not 0 <= cantidad <= 2**31-1
                or any(type(n) not in (int, float) or not 0 <= n <= 1e15 for n in numeros)
                or datos["discount"] > 100 or not isinstance(datos.get("tags"), list)
                or not all(isinstance(t, str) for t in datos["tags"])):
            return jsonify(error="Revisá el nombre, los precios, el descuento y el stock."), 400
        valores = (nombre, datos["price"], datos["description"], bool(datos["discount"]))
        if clave is None:
            clave = uuid4().hex
            identificador = conexion.execute(
                "INSERT INTO productos(nombre_prod, precio, descripcion, tiene_descuento, marca) VALUES (?, ?, ?, ?, '')", valores
            ).lastrowid
        else:
            conexion.execute("UPDATE productos SET nombre_prod=?, precio=?, descripcion=?, tiene_descuento=? WHERE id_producto=?",
                             (*valores, identificador))
        sucursal = conexion.execute("SELECT sucursal FROM configuracion_catalogo").fetchone()[0]
        otras = conexion.execute("SELECT COALESCE(SUM(cantidad),0) FROM stock_por_sucursal WHERE id_producto=? AND id_sucursal!=?",
                                 (identificador, sucursal)).fetchone()[0]
        if otras > cantidad:
            conexion.rollback()
            return jsonify(error="El stock indicado es menor al asignado a otras sucursales."), 400
        conexion.execute("INSERT OR REPLACE INTO stock_por_sucursal VALUES (?, ?, ?)", (identificador, sucursal, cantidad - otras))
        extras = {campo: datos[campo] for campo in ("slug", "type", "image", "tags", "salePrice", "discount")}
        extras.update(tag=extras["tags"], flashSale=bool(datos.get("flashSale")))
        conexion.execute("""INSERT INTO fichas_catalogo(id_producto, clave, datos) VALUES (?, ?, ?)
                            ON CONFLICT(id_producto) DO UPDATE SET datos=excluded.datos""",
                         (identificador, clave, json.dumps(extras)))
        fila = conexion.execute(consulta + " WHERE p.id_producto=?", (identificador,)).fetchone()
        return jsonify(data=ficha(fila)), 201 if request.method == "POST" else 200


@catalogo.post("/admin/uploads/products")
def subir_imagen():
    datos = request.get_json(silent=True)
    valor = datos.get("dataUrl") if isinstance(datos, dict) else None
    if not isinstance(valor, str) or len(valor) > 2800000:
        return jsonify(error="Elegí una imagen de hasta 2 MB."), 400
    cabecera, _, codificado = valor.partition(",")
    firmas = {"image/png": (b"\x89PNG\r\n\x1a\n",), "image/jpeg": (b"\xff\xd8\xff",),
              "image/gif": (b"GIF87a", b"GIF89a"), "image/webp": (b"RIFF",)}
    tipo = cabecera.removeprefix("data:").removesuffix(";base64")
    try:
        contenido = base64.b64decode(codificado, validate=True)
    except ValueError:
        contenido = b""
    if (tipo not in firmas or not contenido.startswith(firmas[tipo]) or len(contenido) > 2 * 1024**2
            or (tipo == "image/webp" and contenido[8:12] != b"WEBP")):
        return jsonify(error="Formato o tamaño de imagen inválido."), 400
    clave = hashlib.sha256(contenido).hexdigest()
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("INSERT OR IGNORE INTO imagenes_catalogo VALUES (?, ?, ?)", (clave, tipo, contenido))
    return jsonify(data={"url": f"/api/imagenes/{clave}"})


@catalogo.get("/imagenes/<clave>")
def ver_imagen(clave):
    with closing(get_db_connection()) as conexion:
        fila = conexion.execute("SELECT * FROM imagenes_catalogo WHERE clave=?", (clave,)).fetchone()
    if fila is None:
        return jsonify(error="Imagen inexistente."), 404
    return Response(fila["contenido"], mimetype=fila["tipo"], headers={"X-Content-Type-Options": "nosniff"})
