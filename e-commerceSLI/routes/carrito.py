from contextlib import closing

from flask import Blueprint, g, jsonify, request

from database.db import get_db_connection
from routes.autenticacion import consultar_usuario
from routes.productos import consulta, ficha

carrito = Blueprint("carrito", __name__, url_prefix="/api/cart")


@carrito.before_request
def identificar_usuario():
    persona = consultar_usuario()
    if persona is None:
        return jsonify(error="Iniciá sesión para usar el carrito."), 401
    g.persona = persona["id_persona"]


def resumen_carrito(conexion, persona):
    filas = conexion.execute(f"""SELECT catalogo.*, carrito.cantidad AS unidades
        FROM ({consulta}) catalogo JOIN carrito ON carrito.producto = catalogo.id_producto
        WHERE carrito.persona = ? ORDER BY carrito.rowid""", (persona,))
    articulos = []
    for fila in filas:
        producto = ficha(fila)
        precio = producto["salePrice"] if producto.get("flashSale") and producto.get("salePrice") is not None else producto["price"]
        subtotal = round(precio * fila["unidades"], 2)
        articulos.append({"product": producto, "quantity": fila["unidades"], "unitPrice": precio, "lineTotal": subtotal})
    return {"items": articulos, "total": round(sum(a["lineTotal"] for a in articulos), 2)}


@carrito.get("")
def consultar_carrito():
    with closing(get_db_connection()) as conexion:
        return jsonify(data=resumen_carrito(conexion, g.persona))


@carrito.post("/items")
@carrito.route("/items/<clave>", methods=["PATCH", "DELETE"])
def modificar_carrito(clave=None):
    datos = request.get_json(silent=True) or {}
    if not isinstance(datos, dict):
        return jsonify(error="Revisá los datos del producto."), 400
    if request.method == "POST":
        clave = datos.get("productId")
    if not isinstance(clave, (str, int)) or not clave:
        return jsonify(error="Seleccioná un producto válido."), 400
    with closing(get_db_connection()) as conexion, conexion:
        conexion.execute("BEGIN IMMEDIATE")
        producto = conexion.execute(f"SELECT * FROM ({consulta}) WHERE clave=?", (str(clave),)).fetchone()
        if producto is None:
            return jsonify(error="El producto ya no está en el catálogo."), 404
        claves = (g.persona, producto["id_producto"])
        if request.method == "DELETE":
            conexion.execute("DELETE FROM carrito WHERE persona=? AND producto=?", claves)
        else:
            cantidad = datos.get("quantity")
            if type(cantidad) is not int or cantidad < 1:
                return jsonify(error="Elegí una cantidad entera mayor a cero."), 400
            actual = conexion.execute("SELECT cantidad FROM carrito WHERE persona=? AND producto=?", claves).fetchone()
            if request.method == "POST" and actual:
                cantidad += actual["cantidad"]
            if request.method == "PATCH" and not actual:
                return jsonify(error="El producto ya no está en tu carrito."), 404
            if cantidad > producto["cantidad"]:
                return jsonify(error="La cantidad supera el stock disponible."), 409
            conexion.execute("""INSERT INTO carrito VALUES (?, ?, ?) ON CONFLICT(persona,producto)
                             DO UPDATE SET cantidad=excluded.cantidad""", (*claves, cantidad))
        return jsonify(data=resumen_carrito(conexion, g.persona))
